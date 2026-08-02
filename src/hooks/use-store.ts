import { useQuery } from "@tanstack/react-query";
import { fetchCategories, fetchSettings } from "@/data/api";
import { defaultSettings } from "@/data/catalog";
import type { Category, StoreSettings } from "@/data/types";

/**
 * Live store settings. The shipped defaults are used as placeholder data only,
 * so the layout never shifts while the request is in flight — but Query still
 * treats the cache as empty and always fetches the real row.
 */
export function useSettings(): StoreSettings {
  const { data } = useQuery({
    queryKey: ["store-settings"],
    queryFn: fetchSettings,
    staleTime: 60_000,
    refetchOnWindowFocus: true,
    placeholderData: defaultSettings,
  });
  return data ?? defaultSettings;
}

export function useCategories(): Category[] {
  const { data } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  });
  return data ?? [];
}
