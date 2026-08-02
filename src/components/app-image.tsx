import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Props = Omit<React.ImgHTMLAttributes<HTMLImageElement>, "loading"> & {
  /** Render eagerly (above-the-fold imagery such as the hero). */
  eager?: boolean;
  /** Optional mobile-specific source, rendered through <picture>. */
  mobileSrc?: string;
};

/**
 * Presentational image with lazy loading and a soft reveal once decoded:
 * fades in from a faint blur and settles to scale 1. Keeps layout identical to
 * a plain <img> — the placeholder is the element's own background tint.
 */
export function AppImage({ eager = false, mobileSrc, className, ...props }: Props) {
  const ref = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);

  // Cached images can be complete before React attaches onLoad.
  useEffect(() => {
    if (ref.current?.complete) setLoaded(true);
  }, [props.src]);

  const img = (
    <img
      {...props}
      ref={ref}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      onLoad={(e) => {
        setLoaded(true);
        props.onLoad?.(e);
      }}
      className={cn(
        "bg-secondary transition-[opacity,transform,filter] duration-700 ease-out motion-reduce:transition-none",
        loaded ? "scale-100 opacity-100 blur-0" : "scale-[1.02] opacity-0 blur-[6px]",
        "motion-reduce:scale-100 motion-reduce:opacity-100 motion-reduce:blur-0",
        className,
      )}
    />
  );

  if (!mobileSrc) return img;

  return (
    <picture>
      <source media="(max-width: 767px)" srcSet={mobileSrc} />
      {img}
    </picture>
  );
}
