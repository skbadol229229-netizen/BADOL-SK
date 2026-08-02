import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, GripVertical, ImagePlus, Loader2, X } from "lucide-react";
import { uploadToCloudinary, validateImageFile, type UploadStage } from "@/lib/cloudinary";
import { formatBytes } from "@/lib/image-compress";
import { cn } from "@/lib/utils";

type Props = {
  urls: string[];
  publicIds: string[];
  onChange: (urls: string[], publicIds: string[]) => void;
  disabled?: boolean;
};

type Pending = { name: string; progress: number; stage: UploadStage };

export function ImageGalleryUploader({ urls, publicIds, onChange, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<Pending[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [savings, setSavings] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const busy = pending.length > 0;

  const ids = urls.map((_, i) => publicIds[i] ?? "");

  function move(from: number, to: number) {
    if (to < 0 || to >= urls.length || from === to) return;
    const nextUrls = [...urls];
    const nextIds = [...ids];
    const [u] = nextUrls.splice(from, 1);
    const [p] = nextIds.splice(from, 1);
    nextUrls.splice(to, 0, u);
    nextIds.splice(to, 0, p);
    onChange(nextUrls, nextIds);
  }

  function remove(index: number) {
    onChange(
      urls.filter((_, i) => i !== index),
      ids.filter((_, i) => i !== index),
    );
  }

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);
    const rejected: string[] = [];
    const accepted: File[] = [];

    for (const file of files) {
      const invalid = validateImageFile(file);
      if (invalid) rejected.push(invalid);
      else accepted.push(file);
    }
    setErrors(rejected);
    setSavings(null);
    if (accepted.length === 0) return;

    setPending(accepted.map((f) => ({ name: f.name, progress: 0, stage: "compressing" as const })));

    const nextUrls = [...urls];
    const nextIds = [...ids];
    const failures = [...rejected];
    let originalTotal = 0;
    let compressedTotal = 0;

    for (let i = 0; i < accepted.length; i += 1) {
      const file = accepted[i];
      try {
        const result = await uploadToCloudinary(
          file,
          (percent) => {
            setPending((prev) =>
              prev.map((p, index) => (index === i ? { ...p, progress: percent } : p)),
            );
          },
          (stage) => {
            setPending((prev) => prev.map((p, index) => (index === i ? { ...p, stage } : p)));
          },
        );
        nextUrls.push(result.url);
        nextIds.push(result.publicId);
        originalTotal += result.originalBytes;
        compressedTotal += result.compressedBytes;
      } catch (e) {
        failures.push(`${file.name}: ${(e as Error).message}`);
      }
    }

    onChange(nextUrls, nextIds);
    setErrors(failures);
    setSavings(
      compressedTotal > 0
        ? `${formatBytes(originalTotal)} → ${formatBytes(compressedTotal)}`
        : null,
    );
    setPending([]);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        onChange={(e) => void handleFiles(e.target.files)}
      />

      {urls.length > 0 && (
        <ul className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {urls.map((url, index) => (
            <li
              key={`${url}-${index}`}
              draggable={!disabled && !busy}
              onDragStart={() => setDragIndex(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (dragIndex !== null) move(dragIndex, index);
                setDragIndex(null);
              }}
              onDragEnd={() => setDragIndex(null)}
              className={cn(
                "group relative border border-border bg-muted",
                dragIndex === index && "opacity-50",
              )}
            >
              <img src={url} alt="" className="media-4x5 w-full object-cover" />
              {index === 0 && (
                <span className="absolute left-0 top-0 bg-foreground px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-background">
                  Cover
                </span>
              )}
              <span className="absolute right-1 top-1 hidden text-muted-foreground md:block">
                <GripVertical className="h-4 w-4" />
              </span>
              <div className="flex items-center justify-between border-t border-border bg-card">
                <button
                  type="button"
                  aria-label="Move image left"
                  disabled={disabled || busy || index === 0}
                  onClick={() => move(index, index - 1)}
                  className="flex h-9 w-9 items-center justify-center disabled:opacity-30"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="Remove image"
                  disabled={disabled || busy}
                  onClick={() => remove(index)}
                  className="flex h-9 w-9 items-center justify-center text-destructive"
                >
                  <X className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="Move image right"
                  disabled={disabled || busy || index === urls.length - 1}
                  onClick={() => move(index, index + 1)}
                  className="flex h-9 w-9 items-center justify-center disabled:opacity-30"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        disabled={disabled || busy}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex min-h-[96px] w-full flex-col items-center justify-center gap-2 border border-dashed border-border px-4 py-5 text-center text-sm text-muted-foreground transition-colors",
          dragging && "border-foreground text-foreground",
        )}
      >
        {busy ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <ImagePlus className="h-5 w-5" strokeWidth={1.5} />
        )}
        <span>{busy ? "Processing…" : "Drop images or click to upload"}</span>
        <span className="text-xs">
          Multiple files up to 25 MB each — auto-compressed under 100 KB. Drag a tile to reorder.
        </span>
      </button>

      {pending.length > 0 && (
        <ul className="mt-3 space-y-2">
          {pending.map((p) => (
            <li key={p.name}>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="truncate">{p.name}</span>
                <span>{p.stage === "compressing" ? "Compressing…" : `${p.progress}%`}</span>
              </div>
              <div className="mt-1 h-1 w-full bg-muted">
                <div
                  className="h-1 bg-foreground transition-all"
                  style={{ width: p.stage === "compressing" ? "8%" : `${p.progress}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      {savings && !busy && (
        <p className="mt-2 text-xs text-muted-foreground">Uploaded — {savings}</p>
      )}

      {errors.length > 0 && (
        <ul className="mt-2 space-y-1">
          {errors.map((e) => (
            <li key={e} className="text-xs text-destructive">
              {e}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
