import { compressImage, TARGET_MAX_BYTES, formatBytes } from "@/lib/image-compress";

export const MAX_IMAGE_BYTES = 25 * 1024 * 1024;

export type UploadedImageResult = {
  fileId: string;
  url: string;
  originalBytes: number;
  compressedBytes: number;
};

export type UploadStage = "compressing" | "uploading";

export function validateImageFile(file: File): string | null {
  if (!file.type.startsWith("image/")) return "Only image files can be uploaded.";
  if (file.size > MAX_IMAGE_BYTES) {
    return `${file.name} is ${(file.size / 1024 / 1024).toFixed(1)} MB. The limit is 25 MB.`;
  }
  return null;
}

export async function uploadToTelegram(
  file: File,
  onProgress?: (percent: number) => void,
  onStage?: (stage: UploadStage) => void,
): Promise<UploadedImageResult> {
  const invalid = validateImageFile(file);
  if (invalid) throw new Error(invalid);

  onStage?.("compressing");
  const {
    file: payloadFile,
    originalBytes,
    compressedBytes,
  } = await compressImage(file, {
    maxBytes: TARGET_MAX_BYTES,
  });

  onStage?.("uploading");

  const formData = new FormData();
  formData.append("file", payloadFile);

  return new Promise<UploadedImageResult>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/upload-image", true);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onerror = () => reject(new Error("Upload failed. Check your network connection."));
    xhr.onabort = () => reject(new Error("Upload cancelled."));

    xhr.onload = () => {
      let payload: Record<string, unknown> = {};
      try {
        payload = JSON.parse(xhr.responseText) as Record<string, unknown>;
      } catch {
        reject(new Error("Server returned an unexpected response."));
        return;
      }

      if (xhr.status < 200 || xhr.status >= 300) {
        reject(new Error(String(payload.error ?? `Upload failed (${xhr.status}).`)));
        return;
      }

      const fileId = String(payload.file_id ?? "");
      if (!fileId) {
        reject(new Error("No file_id returned from server."));
        return;
      }

      onProgress?.(100);
      resolve({
        fileId,
        url: `/api/images/${fileId}`,
        originalBytes,
        compressedBytes,
      });
    };

    xhr.send(formData);
  });
}

export { formatBytes };
