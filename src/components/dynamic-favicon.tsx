import { useEffect } from "react";
import { useSettings } from "@/hooks/use-store";

/** Builds a small square icon URL from a Cloudinary delivery URL. */
function faviconUrl(logoUrl: string): string {
  if (!logoUrl) return "";
  const marker = "/upload/";
  const i = logoUrl.indexOf(marker);
  if (i === -1) return logoUrl;
  return `${logoUrl.slice(0, i + marker.length)}w_64,h_64,c_fill,g_auto,r_max,f_png/${logoUrl.slice(
    i + marker.length,
  )}`;
}

/**
 * Keeps the browser tab icon in sync with the logo uploaded in
 * Admin → Settings → Branding. No logo configured means no custom icon.
 */
export function DynamicFavicon() {
  const { logoUrl } = useSettings();

  useEffect(() => {
    if (typeof document === "undefined") return;

    const href = faviconUrl(logoUrl);
    const existing = document.querySelectorAll<HTMLLinkElement>(
      'link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]',
    );
    existing.forEach((el) => el.remove());
    if (!href) return;

    const icon = document.createElement("link");
    icon.rel = "icon";
    icon.type = "image/png";
    icon.href = href;
    document.head.appendChild(icon);

    const apple = document.createElement("link");
    apple.rel = "apple-touch-icon";
    apple.href = href;
    document.head.appendChild(apple);

    return () => {
      icon.remove();
      apple.remove();
    };
  }, [logoUrl]);

  return null;
}
