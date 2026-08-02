import { useSettings } from "@/hooks/use-store";
import { cn } from "@/lib/utils";

type Props = {
  /** Extra classes for the wrapper element. */
  className?: string;
  /** Tailwind height utility used when a logo image is present. */
  logoClassName?: string;
  /** Classes applied to the store name text. */
  textClassName?: string;
  /** Hide the store name and show only the logo (when a logo exists). */
  logoOnly?: boolean;
};

/**
 * Single source of truth for the store identity: shows the uploaded logo from
 * Admin → Settings → Branding alongside the store name, and falls back to the
 * name alone when no logo is configured.
 */
export function BrandMark({
  className,
  logoClassName = "h-7 md:h-8",
  textClassName = "font-serif-display text-xl leading-none tracking-tight md:text-2xl",
  logoOnly = false,
}: Props) {
  const settings = useSettings();

  return (
    <span className={cn("inline-flex min-w-0 items-center gap-2 md:gap-2.5", className)}>
      {settings.logoUrl && (
        <span
          className={cn(
            "aspect-square shrink-0 overflow-hidden rounded-full bg-muted",
            logoClassName,
          )}
        >
          <img
            src={settings.logoUrl}
            alt={settings.storeName}
            className="h-full w-full object-cover"
          />
        </span>
      )}
      {!(settings.logoUrl && logoOnly) && (
        <span className={cn("truncate uppercase", textClassName)}>{settings.storeName}</span>
      )}
    </span>
  );
}

export function useStoreName() {
  return useSettings().storeName;
}
