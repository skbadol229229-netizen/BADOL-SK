import { useRef, useState } from "react";
import { ImagePlus, Loader2, Upload, X } from "lucide-react";
import { uploadToTelegram, validateImageFile, type UploadStage } from "@/lib/telegram-upload";
import { formatBytes } from "@/lib/image-compress";
import { cn, formatImageUrl } from "@/lib/utils";

export type UploadedImage = { url: string; publicId: string };

type Props = {
  value: UploadedImage;
  onChange: (next: UploadedImage) => void;
  /** Tailwind aspect utility for the preview, e.g. "aspect-video". */
  aspect?: string;
  /** Extra classes for the preview frame (e.g. "rounded-full max-w-[140px]"). */
  previewClassName?: string;
  disabled?: boolean;
};

export function ImageUploader({
  value,
  onChange,
  aspect = "aspect-video",
  previewClassName,
  assistiveText,
  disabled,
}: Props & { assistiveText?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [stage, setStage] = useState<UploadStage>("compressing");
  const [error, setError] = useState<string | null>(null);
  const [savings, setSavings] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const busy = progress !== null;
  const busyLabel = stage === "compressing" ? "Compressing…" : "Uploading…";

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setSavings(null);
    const invalid = validateImageFile(file);
    if (invalid) {
      setError(invalid);
      return;
    }
    setStage("compressing");
    setProgress(0);
    try {
      const result = await uploadToTelegram(file, setProgress, setStage);
      onChange({ url: result.fileId, publicId: result.fileId });
      setSavings(
        result.compressedBytes < result.originalBytes
          ? `${formatBytes(result.originalBytes)} → ${formatBytes(result.compressedBytes)}`
          : formatBytes(result.compressedBytes),
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setProgress(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />

      {value.url ? (
        <div className="space-y-3">
          <div
            className={cn(
              "w-full max-w-xs overflow-hidden border border-border bg-muted",
              aspect,
              previewClassName,
            )}
          >
            <img src={formatImageUrl(value.url)} alt="" className="h-full w-full object-cover" />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={disabled || busy}
              onClick={() => inputRef.current?.click()}
              className="a-btn a-btn-outline"
            >
              {busy ? busyLabel : "Replace"}
            </button>
            <button
              type="button"
              disabled={disabled || busy}
              onClick={() => {
                onChange({ url: "", publicId: "" });
                setSavings(null);
                setError(null);
              }}
              className="a-btn a-btn-outline"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
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
            void handleFile(e.dataTransfer.files?.[0]);
          }}
          className={cn(
            "flex min-h-[120px] w-full max-w-xs flex-col items-center justify-center gap-2 border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground transition-colors",
            dragging && "border-foreground text-foreground",
          )}
        >
          {busy ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <ImagePlus className="h-5 w-5" strokeWidth={1.5} />
          )}
          <span>{busy ? busyLabel : "Drop an image or click to upload"}</span>
          <span className="text-xs">
            {assistiveText ?? "JPG, PNG or WEBP up to 25 MB — auto-compressed under 100 KB"}
          </span>
        </button>
      )}

      {busy && (
        <div className="mt-3 max-w-xs">
          <div className="h-1 w-full bg-muted">
            <div
              className="h-1 bg-foreground transition-all"
              style={{ width: stage === "compressing" ? "8%" : `${progress}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            <Upload className="mr-1 inline h-3 w-3" />
            {stage === "compressing" ? "Compressing…" : `${progress}%`}
          </p>
        </div>
      )}

      {savings && !busy && !error && (
        <p className="mt-2 text-xs text-muted-foreground">Uploaded — {savings}</p>
      )}

      {error && (
        <p className="mt-2 flex items-start gap-1 text-xs text-destructive">
          <X className="mt-px h-3 w-3 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
