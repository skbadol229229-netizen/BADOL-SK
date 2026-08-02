export const TARGET_MAX_BYTES = 100 * 1024;

const DIMENSION_STEPS = [2000, 1600, 1280, 1024, 800];
const MIN_QUALITY = 0.4;
const MAX_QUALITY = 0.95;
const QUALITY_PASSES = 6;

/** Formats that cannot (or should not) be re-encoded through a canvas. */
function isPassThrough(file: File): boolean {
  return (
    file.type === "image/svg+xml" ||
    file.type === "image/gif" ||
    file.type === "image/avif" ||
    !file.type.startsWith("image/")
  );
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

function supportsWebp(): boolean {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL("image/webp").startsWith("data:image/webp");
}

async function loadBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file);
    } catch {
      /* fall through to the <img> path */
    }
  }
  const url = URL.createObjectURL(file);
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("This image could not be read."));
      img.src = url;
    });
  } finally {
    // Revoked after decode; the bitmap data is already in memory.
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}

function renderAt(
  source: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
  maxDimension: number,
): HTMLCanvasElement {
  const scale = Math.min(1, maxDimension / Math.max(sourceWidth, sourceHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(sourceWidth * scale));
  canvas.height = Math.max(1, Math.round(sourceHeight * scale));

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("This browser cannot process images.");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas;
}

/**
 * Finds the highest quality encode that still fits under maxBytes at this size.
 * Returns null when even the lowest quality is too large.
 */
async function bestUnderLimit(
  canvas: HTMLCanvasElement,
  mime: string,
  maxBytes: number,
): Promise<Blob | null> {
  let low = MIN_QUALITY;
  let high = MAX_QUALITY;
  let best: Blob | null = null;

  const floor = await canvasToBlob(canvas, mime, MIN_QUALITY);
  if (!floor || floor.size > maxBytes) return null;
  best = floor;

  for (let i = 0; i < QUALITY_PASSES; i += 1) {
    const mid = (low + high) / 2;
    const blob = await canvasToBlob(canvas, mime, mid);
    if (blob && blob.size <= maxBytes) {
      best = blob;
      low = mid;
    } else {
      high = mid;
    }
  }

  return best;
}

export type CompressResult = {
  file: File;
  originalBytes: number;
  compressedBytes: number;
  compressed: boolean;
};

/**
 * Shrinks an image in the browser so it lands under `maxBytes`, keeping the
 * highest quality that fits. Falls back to the original file when the image
 * cannot be re-encoded (SVG, GIF) or the browser lacks canvas support.
 */
export async function compressImage(
  file: File,
  options: { maxBytes?: number; maxDimension?: number } = {},
): Promise<CompressResult> {
  const maxBytes = options.maxBytes ?? TARGET_MAX_BYTES;
  const unchanged: CompressResult = {
    file,
    originalBytes: file.size,
    compressedBytes: file.size,
    compressed: false,
  };

  if (isPassThrough(file)) return unchanged;
  if (file.size <= maxBytes && file.type === "image/webp") return unchanged;

  let source: ImageBitmap | HTMLImageElement;
  try {
    source = await loadBitmap(file);
  } catch {
    return unchanged;
  }

  const width = "width" in source ? source.width : 0;
  const height = "height" in source ? source.height : 0;
  if (!width || !height) return unchanged;

  const mime = supportsWebp() ? "image/webp" : "image/jpeg";
  const extension = mime === "image/webp" ? "webp" : "jpg";
  const baseName = file.name.replace(/\.[^.]+$/, "") || "image";

  const ceiling = options.maxDimension ?? DIMENSION_STEPS[0];
  const steps = DIMENSION_STEPS.filter((d) => d <= ceiling);
  if (steps.length === 0) steps.push(ceiling);

  let chosen: Blob | null = null;
  for (const dimension of steps) {
    const canvas = renderAt(source, width, height, dimension);
    chosen = await bestUnderLimit(canvas, mime, maxBytes);
    if (chosen) break;
  }

  if (!chosen) {
    // Last resort: smallest step at the lowest quality, even if slightly over.
    const canvas = renderAt(source, width, height, steps[steps.length - 1]);
    chosen = await canvasToBlob(canvas, mime, MIN_QUALITY);
  }

  if ("close" in source) source.close();
  if (!chosen) return unchanged;

  // Never hand back something larger than what we were given.
  if (chosen.size >= file.size) return unchanged;

  return {
    file: new File([chosen], `${baseName}.${extension}`, {
      type: mime,
      lastModified: Date.now(),
    }),
    originalBytes: file.size,
    compressedBytes: chosen.size,
    compressed: true,
  };
}

export function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
