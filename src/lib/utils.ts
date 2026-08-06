import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatImageUrl(urlOrId?: string | null): string {
  if (!urlOrId) return "";
  if (
    urlOrId.startsWith("http://") ||
    urlOrId.startsWith("https://") ||
    urlOrId.startsWith("/") ||
    urlOrId.startsWith("data:")
  ) {
    return urlOrId;
  }
  return `/api/images/${urlOrId}`;
}
