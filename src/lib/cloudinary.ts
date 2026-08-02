import { compressImage, TARGET_MAX_BYTES } from "@/lib/image-compress";

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string | undefined;

/** Picker limit. Anything under this is compressed to TARGET_MAX_BYTES before upload. */
export const MAX_IMAGE_BYTES = 25 * 1024 * 1024;

export type CloudinaryImage = {
  url: string;
  publicId: string;
  width: number;
  height: number;
  originalBytes: number;
  compressedBytes: number;
};

export type UploadStage = "compressing" | "uploading";

export function cloudinaryUploadUrl(): string {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      "Cloudinary is not configured. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET.",
    );
  }
  return `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
}

export function validateImageFile(file: File): string | null {
  if (!file.type.startsWith("image/")) return "Only image files can be uploaded.";
  if (file.size > MAX_IMAGE_BYTES) {
    return `${file.name} is ${(file.size / 1024 / 1024).toFixed(1)} MB. The limit is 25 MB.`;
  }
  return null;
}

/**
 * Compresses the image under 100 KB in the browser, then does an unsigned
 * upload straight to Cloudinary. XHR is used instead of fetch so the admin UI
 * can show real upload progress.
 */
export async function uploadToCloudinary(
  file: File,
  onProgress?: (percent: number) => void,
  onStage?: (stage: UploadStage) => void,
): Promise<CloudinaryImage> {
  const invalid = validateImageFile(file);
  if (invalid) throw new Error(invalid);

  const endpoint = cloudinaryUploadUrl();

  onStage?.("compressing");
  const { file: payloadFile, originalBytes, compressedBytes } = await compressImage(file, {
    maxBytes: TARGET_MAX_BYTES,
  });
  onStage?.("uploading");

  const body = new FormData();
  body.append("file", payloadFile);
  body.append("upload_preset", UPLOAD_PRESET as string);


  return new Promise<CloudinaryImage>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", endpoint, true);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onerror = () => reject(new Error("Upload failed. Check your connection and try again."));
    xhr.onabort = () => reject(new Error("Upload cancelled."));

    xhr.onload = () => {
      let payload: Record<string, unknown> = {};
      try {
        payload = JSON.parse(xhr.responseText) as Record<string, unknown>;
      } catch {
        reject(new Error("Cloudinary returned an unexpected response."));
        return;
      }

      if (xhr.status < 200 || xhr.status >= 300) {
        const error = payload.error as { message?: string } | undefined;
        reject(new Error(error?.message ?? `Upload failed (${xhr.status}).`));
        return;
      }

      onProgress?.(100);
      resolve({
        url: String(payload.secure_url ?? ""),
        publicId: String(payload.public_id ?? ""),
        width: Number(payload.width ?? 0),
        height: Number(payload.height ?? 0),
        originalBytes,
        compressedBytes,
      });

    };

    xhr.send(body);
  });
}
