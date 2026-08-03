/**
 * Storefront data-access layer, backed by Turso (libSQL).
 */
import { queryRow, queryRows } from "@/lib/turso";
import {
  defaultBanner,
  defaultBanners,
  defaultCategories,
  defaultProducts,
  defaultSettings,
} from "./catalog";
import type { Banner, Category, Product, ProductColor, Review, StoreSettings } from "./types";

type Row = Record<string, unknown>;

export type ProductFilters = {
  category?: string;
  search?: string;
  sizes?: string[];
  colors?: string[];
  maxPrice?: number;
  sort?: "featured" | "price-asc" | "price-desc" | "newest";
};

function parseJson<T>(val: unknown, fallback: T): T {
  if (!val) return fallback;
  if (typeof val === "string") {
    try {
      return JSON.parse(val) as T;
    } catch {
      return fallback;
    }
  }
  return val as T;
}

export function priceOf(product: Product) {
  return product.salePrice && product.salePrice < product.regularPrice
    ? product.salePrice
    : product.regularPrice;
}

export function mapProduct(row: Row): Product {
  const images = parseJson<string[]>(row.images, []);
  const imagePublicIds = parseJson<string[]>(row.image_public_ids, []);
  const sizes = parseJson<string[]>(row.sizes, []);

  return {
    id: String(row.id),
    name: String(row.name),
    slug: String(row.slug),
    shortDescription: (row.short_description as string) ?? "",
    fullDescription: (row.full_description as string) ?? "",
    categorySlug: (row.category_slug as string) ?? "",
    images: images.filter(Boolean),
    imagePublicIds: imagePublicIds.filter(Boolean),
    regularPrice: Number(row.regular_price ?? 0),
    salePrice: row.sale_price == null ? null : Number(row.sale_price),
    sizes,
    colors: [],
    stock: Number(row.stock ?? 0),
    sku: (row.sku as string) ?? "",
    featured: Boolean(row.featured),
    bestSeller: Boolean(row.best_seller),
    newArrival: Boolean(row.new_arrival),
    active: Boolean(row.active),
    sortOrder: Number(row.sort_order ?? 0),
    createdAt: String(row.created_at ?? ""),
  };
}

export function mapCategory(row: Row): Category {
  return {
    id: String(row.id),
    name: String(row.name),
    slug: String(row.slug),
    description: (row.description as string) ?? "",
    image: (row.image_url as string) ?? "",
    imagePublicId: (row.image_public_id as string) ?? "",
    active: Boolean(row.active),
    sortOrder: Number(row.sort_order ?? 0),
  };
}

export function mapBanner(row: Row): Banner {
  return {
    id: String(row.id),
    title: String(row.title ?? ""),
    subtitle: (row.subtitle as string) ?? "",
    ctaLabel: (row.cta_label as string) ?? "",
    ctaHref: (row.cta_href as string) ?? "/shop",
    image: (row.image_url as string) ?? "",
    imagePublicId: (row.image_public_id as string) ?? "",
    mobileImage: (row.mobile_image_url as string) ?? "",
    mobileImagePublicId: (row.mobile_image_public_id as string) ?? "",
    active: Boolean(row.active),
    sortOrder: Number(row.sort_order ?? 0),
  };
}

export function mapReview(row: Row): Review {
  return {
    id: String(row.id),
    productSlug: String(row.product_slug ?? ""),
    author: String(row.author ?? ""),
    rating: Number(row.rating ?? 5),
    body: String(row.body ?? ""),
    date: String(row.review_date ?? row.created_at ?? ""),
    approved: Boolean(row.approved),
  };
}

export function mapSettings(row: Row | null): StoreSettings {
  if (!row) return defaultSettings;
  return {
    storeName: (row.store_name as string) || defaultSettings.storeName,
    logoUrl: (row.logo_url as string) ?? "",
    logoPublicId: (row.logo_public_id as string) ?? "",
    announcement: (row.announcement as string) ?? "",
    supportPhone: (row.support_phone as string) ?? "",
    whatsapp: (row.whatsapp as string) ?? "",
    supportEmail: (row.support_email as string) ?? "",
    address: (row.address as string) ?? "",
    facebookUrl: (row.facebook_url as string) ?? "",
    instagramUrl: (row.instagram_url as string) ?? "",
    youtubeUrl: (row.youtube_url as string) ?? "",
    deliveryInsideDhaka: Number(row.delivery_inside_dhaka ?? 60),
    deliveryOutsideDhaka: Number(row.delivery_outside_dhaka ?? 120),
    deliveryTimeInside: (row.delivery_time_inside as string) ?? "",
    deliveryTimeOutside: (row.delivery_time_outside as string) ?? "",
    exchangeWindowDays: Number(row.exchange_window_days ?? 7),
    codEnabled: Boolean(row.cod_enabled ?? 1),
    flashSaleEnabled:
      row.flash_sale_enabled != null
        ? Boolean(row.flash_sale_enabled)
        : defaultSettings.flashSaleEnabled,
    flashSaleTitleBn: (row.flash_sale_title_bn as string) || defaultSettings.flashSaleTitleBn,
    flashSaleTitleEn: (row.flash_sale_title_en as string) || defaultSettings.flashSaleTitleEn,
    flashSaleEndTime: (row.flash_sale_end_time as string) || defaultSettings.flashSaleEndTime,
  };
}

export async function fetchCategories(): Promise<Category[]> {
  try {
    const rows = await queryRows(
      "SELECT * FROM categories WHERE active = 1 ORDER BY sort_order ASC",
    );
    if (!rows || rows.length === 0) return defaultCategories;
    return rows.map(mapCategory);
  } catch {
    return defaultCategories;
  }
}

export async function fetchCategory(slug: string): Promise<Category | null> {
  try {
    const row = await queryRow("SELECT * FROM categories WHERE slug = ? AND active = 1", [slug]);
    if (!row) return defaultCategories.find((c) => c.slug === slug) ?? null;
    return mapCategory(row);
  } catch {
    return defaultCategories.find((c) => c.slug === slug) ?? null;
  }
}

export async function fetchBanners(): Promise<Banner[]> {
  try {
    const rows = await queryRows("SELECT * FROM banners WHERE active = 1 ORDER BY sort_order ASC");
    if (!rows || rows.length === 0) return defaultBanners;
    return rows.map(mapBanner);
  } catch {
    return defaultBanners;
  }
}

export async function fetchSettings(): Promise<StoreSettings> {
  try {
    const row = await queryRow("SELECT * FROM store_settings LIMIT 1");
    if (!row) return defaultSettings;
    return mapSettings(row);
  } catch {
    return defaultSettings;
  }
}

async function fetchActiveProducts(): Promise<Product[]> {
  try {
    const rows = await queryRows("SELECT * FROM products WHERE active = 1 ORDER BY sort_order ASC");
    if (!rows || rows.length === 0) return defaultProducts;
    return rows.map(mapProduct);
  } catch {
    return defaultProducts;
  }
}

/** Lowercases and strips punctuation so "T-Shirt" matches "tshirt". */
function normalise(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\u0980-\u09ff]+/g, " ")
    .trim();
}

export async function fetchProducts(filters: ProductFilters = {}): Promise<Product[]> {
  let list = await fetchActiveProducts();

  if (filters.category) {
    list = list.filter((p) => p.categorySlug === filters.category);
  }
  if (filters.search && normalise(filters.search)) {
    const terms = normalise(filters.search).split(" ").filter(Boolean);
    const categoryNames = new Map<string, string>();
    try {
      for (const c of await fetchCategories()) categoryNames.set(c.slug, c.name);
    } catch {
      /* search still works on product fields alone */
    }

    const haystack = (p: Product) =>
      normalise(
        [
          p.name,
          p.shortDescription,
          p.fullDescription,
          p.sku,
          p.categorySlug,
          categoryNames.get(p.categorySlug) ?? "",
          p.sizes.join(" "),
          p.colors.map((c) => c.name).join(" "),
        ].join(" "),
      );

    list = list.filter((p) => {
      const text = haystack(p);
      const squashed = text.replace(/ /g, "");
      return terms.every((t) => text.includes(t) || squashed.includes(t.replace(/ /g, "")));
    });
  }

  if (filters.sizes?.length) {
    list = list.filter((p) => p.sizes.some((s) => filters.sizes!.includes(s)));
  }
  if (filters.colors?.length) {
    list = list.filter((p) => p.colors.some((c) => filters.colors!.includes(c.name)));
  }
  if (filters.maxPrice) {
    list = list.filter((p) => priceOf(p) <= filters.maxPrice!);
  }

  switch (filters.sort) {
    case "price-asc":
      list = [...list].sort((a, b) => priceOf(a) - priceOf(b));
      break;
    case "price-desc":
      list = [...list].sort((a, b) => priceOf(b) - priceOf(a));
      break;
    case "newest":
      list = [...list].sort(
        (a, b) =>
          Number(b.newArrival) - Number(a.newArrival) || b.createdAt.localeCompare(a.createdAt),
      );
      break;
    default:
      list = [...list].sort((a, b) => Number(b.featured) - Number(a.featured));
  }

  return list;
}

export async function fetchProduct(slug: string): Promise<Product | null> {
  try {
    const row = await queryRow("SELECT * FROM products WHERE slug = ? AND active = 1", [slug]);
    if (!row) return defaultProducts.find((p) => p.slug === slug) ?? null;
    return mapProduct(row);
  } catch {
    return defaultProducts.find((p) => p.slug === slug) ?? null;
  }
}

export async function fetchRelated(product: Product): Promise<Product[]> {
  try {
    const rows = await queryRows(
      "SELECT * FROM products WHERE active = 1 AND category_slug = ? AND id != ? LIMIT 4",
      [product.categorySlug, product.id],
    );
    if (!rows || rows.length === 0) {
      return defaultProducts
        .filter((p) => p.categorySlug === product.categorySlug && p.id !== product.id)
        .slice(0, 4);
    }
    return rows.map(mapProduct);
  } catch {
    return defaultProducts
      .filter((p) => p.categorySlug === product.categorySlug && p.id !== product.id)
      .slice(0, 4);
  }
}

export async function fetchReviews(slug: string): Promise<Review[]> {
  try {
    const rows = await queryRows(
      "SELECT * FROM reviews WHERE product_slug = ? AND approved = 1 ORDER BY review_date DESC",
      [slug],
    );
    if (!rows) return [];
    return rows.map(mapReview);
  } catch {
    return [];
  }
}

export async function fetchHomeSections() {
  const list = await fetchActiveProducts();
  const flashSaleList = list.filter((p) => p.salePrice && p.salePrice < p.regularPrice);
  return {
    home12: list.slice(0, 12),
    flashSale: flashSaleList.length > 0 ? flashSaleList.slice(0, 4) : list.slice(0, 4),
    newArrivals: list.filter((p) => p.newArrival).slice(0, 8),
    bestSellers: list.filter((p) => p.bestSeller).slice(0, 12),
    featured: list.filter((p) => p.featured).slice(0, 12),
  };
}

export async function fetchFacets(): Promise<{ sizes: string[] }> {
  const list = await fetchActiveProducts();
  return {
    sizes: Array.from(new Set(list.flatMap((p) => p.sizes))),
  };
}
