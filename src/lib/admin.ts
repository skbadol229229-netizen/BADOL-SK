import { execBatch, execSql, isTursoConfigured, queryRow, queryRows } from "@/lib/turso";
import {
  defaultBanner,
  defaultBanners,
  defaultCategories,
  defaultProducts,
  defaultSettings,
} from "@/data/catalog";
import { mapBanner, mapCategory, mapProduct, mapReview, mapSettings } from "@/data/api";
import type {
  Banner,
  Category,
  Order,
  OrderItem,
  OrderStatus,
  Product,
  Review,
  StoreSettings,
} from "@/data/types";

const ADMIN_SESSION_KEY = "dhaka_admin_session_v1";

/* ---------------------------------- auth --------------------------------- */

export async function signInAdmin(email: string, password: string): Promise<void> {
  const cleanEmail = email.trim().toLowerCase();
  const DEFAULT_EMAIL = "skbadol229229@gmail.com";
  const DEFAULT_PASS = "01965566396";

  if (isTursoConfigured) {
    try {
      const user = await queryRow<{ id: string; role: string; password_hash: string }>(
        "SELECT * FROM admin_users WHERE LOWER(email) = ?",
        [cleanEmail],
      );
      if (user) {
        if (user.password_hash !== password) {
          throw new Error("Invalid email or password!");
        }
      } else {
        if (cleanEmail !== DEFAULT_EMAIL || password !== DEFAULT_PASS) {
          throw new Error("Invalid email or password!");
        }
      }
    } catch (e) {
      if ((e as Error).message.includes("Invalid email")) throw e;
      if (cleanEmail !== DEFAULT_EMAIL || password !== DEFAULT_PASS) {
        throw new Error("Invalid email or password!");
      }
    }
  } else {
    if (cleanEmail !== DEFAULT_EMAIL || password !== DEFAULT_PASS) {
      throw new Error("Invalid email or password!");
    }
  }

  // Save session to localStorage
  try {
    window.localStorage.setItem(
      ADMIN_SESSION_KEY,
      JSON.stringify({ email: cleanEmail, time: Date.now() }),
    );
  } catch {
    /* storage unavailable */
  }
}

export async function checkAdmin(): Promise<boolean> {
  try {
    const raw = window.localStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return false;
    const session = JSON.parse(raw) as { email: string };
    return Boolean(session && session.email);
  } catch {
    return false;
  }
}

export async function signOutAdmin(): Promise<void> {
  try {
    window.localStorage.removeItem(ADMIN_SESSION_KEY);
  } catch {
    /* storage unavailable */
  }
}

export async function getAdminEmail(): Promise<string> {
  try {
    const raw = window.localStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return "skbadol229229@gmail.com";
    const session = JSON.parse(raw) as { email: string };
    return session.email || "skbadol229229@gmail.com";
  } catch {
    return "skbadol229229@gmail.com";
  }
}

export async function updateAdminCredentials(
  currentEmail: string,
  newEmail: string,
  newPassword?: string,
): Promise<void> {
  const cleanNewEmail = newEmail.trim().toLowerCase();
  const cleanCurrentEmail = currentEmail.trim().toLowerCase();

  if (isTursoConfigured) {
    try {
      await execSql(`
        CREATE TABLE IF NOT EXISTS admin_users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'admin'
        );
      `);

      const existing = await queryRow<{ id: string }>(
        "SELECT id FROM admin_users WHERE LOWER(email) = ?",
        [cleanCurrentEmail],
      );

      if (existing) {
        if (newPassword && newPassword.trim()) {
          await execSql("UPDATE admin_users SET email = ?, password_hash = ? WHERE id = ?", [
            cleanNewEmail,
            newPassword.trim(),
            existing.id,
          ]);
        } else {
          await execSql("UPDATE admin_users SET email = ? WHERE id = ?", [
            cleanNewEmail,
            existing.id,
          ]);
        }
      } else {
        const id = "admin_" + Date.now().toString(36);
        await execSql(
          "INSERT INTO admin_users (id, email, password_hash, role) VALUES (?, ?, ?, 'admin')",
          [id, cleanNewEmail, newPassword?.trim() || "admin123"],
        );
      }
    } catch (e) {
      console.error("Error updating admin credentials in DB:", e);
    }
  }

  // Always update local session
  try {
    window.localStorage.setItem(
      ADMIN_SESSION_KEY,
      JSON.stringify({ email: cleanNewEmail, time: Date.now() }),
    );
  } catch {
    /* storage unavailable */
  }
}

/* -------------------------------- dashboard ------------------------------- */

export type AdminStats = {
  totalOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  revenue: number;
  pipelineValue: number;
  totalProducts: number;
  activeProducts: number;
  outOfStock: number;
  totalCategories: number;
  pendingReviews: number;
  statusCounts: Record<string, number>;
};

export async function fetchAdminStats(): Promise<AdminStats> {
  if (!isTursoConfigured) {
    return {
      totalOrders: 0,
      pendingOrders: 0,
      deliveredOrders: 0,
      revenue: 0,
      pipelineValue: 0,
      totalProducts: defaultProducts.length,
      activeProducts: defaultProducts.filter((p) => p.active).length,
      outOfStock: 0,
      totalCategories: defaultCategories.length,
      pendingReviews: 0,
      statusCounts: {},
    };
  }

  try {
    const [orders, products, categories, reviews] = await Promise.all([
      queryRows<{ status: string; total: number }>("SELECT status, total FROM orders"),
      queryRows<{ active: number; stock: number }>("SELECT active, stock FROM products"),
      queryRows<{ id: string }>("SELECT id FROM categories"),
      queryRows<{ approved: number }>("SELECT approved FROM reviews"),
    ]);

    let totalOrders = 0;
    let pendingOrders = 0;
    let deliveredOrders = 0;
    let revenue = 0;
    let pipelineValue = 0;
    const statusCounts: Record<string, number> = {};

    for (const o of orders) {
      totalOrders += 1;
      const st = o.status || "Pending";
      statusCounts[st] = (statusCounts[st] || 0) + 1;
      if (st === "Pending") pendingOrders += 1;
      if (st === "Delivered") deliveredOrders += 1;
      if (st !== "Cancelled" && st !== "Returned") revenue += Number(o.total || 0);
      if (["Pending", "Processing", "Shipped"].includes(st)) pipelineValue += Number(o.total || 0);
    }

    let activeProducts = 0;
    let outOfStock = 0;
    for (const p of products) {
      if (p.active) activeProducts += 1;
      if (Number(p.stock || 0) <= 0) outOfStock += 1;
    }

    const pendingReviews = reviews.filter((r) => !r.approved).length;

    return {
      totalOrders,
      pendingOrders,
      deliveredOrders,
      revenue,
      pipelineValue,
      totalProducts: products.length,
      activeProducts,
      outOfStock,
      totalCategories: categories.length,
      pendingReviews,
      statusCounts,
    };
  } catch {
    return {
      totalOrders: 0,
      pendingOrders: 0,
      deliveredOrders: 0,
      revenue: 0,
      pipelineValue: 0,
      totalProducts: defaultProducts.length,
      activeProducts: defaultProducts.filter((p) => p.active).length,
      outOfStock: 0,
      totalCategories: defaultCategories.length,
      pendingReviews: 0,
      statusCounts: {},
    };
  }
}

export type LowStockRow = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  stock: number;
  active: boolean;
};

export async function fetchLowStock(threshold = 5): Promise<LowStockRow[]> {
  try {
    const rows = await queryRows<Record<string, unknown>>(
      "SELECT id, name, slug, sku, stock, active FROM products WHERE stock <= ? ORDER BY stock ASC",
      [threshold],
    );
    return rows.map((r) => ({
      id: String(r.id),
      name: String(r.name),
      slug: String(r.slug),
      sku: String(r.sku ?? ""),
      stock: Number(r.stock ?? 0),
      active: Boolean(r.active),
    }));
  } catch {
    return defaultProducts
      .filter((p) => p.stock <= threshold)
      .map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        sku: p.sku,
        stock: p.stock,
        active: p.active,
      }));
  }
}

/* --------------------------------- products ------------------------------- */

export type ProductInput = Omit<Product, "id" | "createdAt">;

export async function adminListProducts(): Promise<Product[]> {
  let deletedIds = new Set<string>();
  if (typeof window !== "undefined") {
    try {
      const stored = window.localStorage.getItem("purebengal_deleted_products");
      if (stored) {
        deletedIds = new Set(JSON.parse(stored));
      }
    } catch {
      /* ignore */
    }
  }

  try {
    const rows = await queryRows("SELECT * FROM products ORDER BY sort_order ASC");
    if (rows && rows.length > 0) {
      return rows.map(mapProduct).filter((p) => !deletedIds.has(p.id));
    }
    return defaultProducts.filter((p) => !deletedIds.has(p.id));
  } catch {
    return defaultProducts.filter((p) => !deletedIds.has(p.id));
  }
}

export async function adminCreateProduct(input: ProductInput): Promise<void> {
  const id = "p_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  await execSql(
    `INSERT INTO products (
      id, name, slug, short_description, full_description, category_slug,
      images, image_public_ids, regular_price, sale_price, sizes, colors,
      stock, sku, featured, best_seller, new_arrival, active, sort_order
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      input.name,
      input.slug,
      input.shortDescription,
      input.fullDescription,
      input.categorySlug,
      JSON.stringify(input.images || []),
      JSON.stringify(input.imagePublicIds || []),
      input.regularPrice,
      input.salePrice,
      JSON.stringify(input.sizes || []),
      JSON.stringify(input.colors || []),
      input.stock,
      input.sku,
      input.featured ? 1 : 0,
      input.bestSeller ? 1 : 0,
      input.newArrival ? 1 : 0,
      input.active ? 1 : 0,
      input.sortOrder,
    ],
  );
}

export async function adminUpdateProduct(id: string, input: ProductInput): Promise<void> {
  await execSql(
    `UPDATE products SET
      name = ?, slug = ?, short_description = ?, full_description = ?, category_slug = ?,
      images = ?, image_public_ids = ?, regular_price = ?, sale_price = ?, sizes = ?, colors = ?,
      stock = ?, sku = ?, featured = ?, best_seller = ?, new_arrival = ?, active = ?, sort_order = ?
    WHERE id = ?`,
    [
      input.name,
      input.slug,
      input.shortDescription,
      input.fullDescription,
      input.categorySlug,
      JSON.stringify(input.images || []),
      JSON.stringify(input.imagePublicIds || []),
      input.regularPrice,
      input.salePrice,
      JSON.stringify(input.sizes || []),
      JSON.stringify(input.colors || []),
      input.stock,
      input.sku,
      input.featured ? 1 : 0,
      input.bestSeller ? 1 : 0,
      input.newArrival ? 1 : 0,
      input.active ? 1 : 0,
      input.sortOrder,
      id,
    ],
  );
}

export async function adminSetProductActive(id: string, active: boolean): Promise<void> {
  await execSql("UPDATE products SET active = ? WHERE id = ?", [active ? 1 : 0, id]);
}

export async function adminDeleteProduct(id: string): Promise<void> {
  if (typeof window !== "undefined") {
    try {
      const stored = window.localStorage.getItem("purebengal_deleted_products");
      const deletedIds: string[] = stored ? JSON.parse(stored) : [];
      if (!deletedIds.includes(id)) {
        deletedIds.push(id);
        window.localStorage.setItem("purebengal_deleted_products", JSON.stringify(deletedIds));
      }
    } catch {
      /* ignore */
    }
  }

  if (isTursoConfigured) {
    try {
      await execSql("DELETE FROM products WHERE id = ?", [id]);
    } catch (e) {
      console.error("Error deleting product from DB:", e);
    }
  }
}

/* -------------------------------- categories ------------------------------ */

export type CategoryInput = Omit<Category, "id">;

export async function adminListCategories(): Promise<Category[]> {
  try {
    const rows = await queryRows("SELECT * FROM categories ORDER BY sort_order ASC");
    if (rows && rows.length > 0) {
      return rows.map(mapCategory);
    }
    return defaultCategories;
  } catch {
    return defaultCategories;
  }
}

export async function adminCreateCategory(input: CategoryInput): Promise<void> {
  const id = "cat_" + Date.now().toString(36);
  await execSql(
    "INSERT INTO categories (id, name, slug, description, image_url, image_public_id, active, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [
      id,
      input.name,
      input.slug,
      input.description,
      input.image,
      input.imagePublicId || "",
      input.active ? 1 : 0,
      input.sortOrder,
    ],
  );
}

export async function adminUpdateCategory(id: string, input: CategoryInput): Promise<void> {
  await execSql(
    "UPDATE categories SET name=?, slug=?, description=?, image_url=?, image_public_id=?, active=?, sort_order=? WHERE id=?",
    [
      input.name,
      input.slug,
      input.description,
      input.image,
      input.imagePublicId || "",
      input.active ? 1 : 0,
      input.sortOrder,
      id,
    ],
  );
}

export async function adminDeleteCategory(id: string): Promise<void> {
  await execSql("DELETE FROM categories WHERE id = ? OR slug = ?", [id, id]);
}

/* ---------------------------------- banners ------------------------------- */

export type BannerInput = Omit<Banner, "id">;

export async function adminListBanners(): Promise<Banner[]> {
  try {
    const rows = await queryRows("SELECT * FROM banners ORDER BY sort_order ASC");
    if (!rows || rows.length === 0) return defaultBanners;
    return rows.map(mapBanner);
  } catch {
    return defaultBanners;
  }
}

export async function adminCreateBanner(input: BannerInput): Promise<void> {
  const id = "bnr_" + Date.now().toString(36);
  await execSql(
    "INSERT INTO banners (id, title, subtitle, cta_label, cta_href, image_url, image_public_id, mobile_image_url, mobile_image_public_id, active, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      id,
      input.title,
      input.subtitle,
      input.ctaLabel,
      input.ctaHref,
      input.image,
      input.imagePublicId || "",
      input.mobileImage || "",
      input.mobileImagePublicId || "",
      input.active ? 1 : 0,
      input.sortOrder,
    ],
  );
}

export async function adminUpdateBanner(id: string, input: BannerInput): Promise<void> {
  await execSql(
    "UPDATE banners SET title=?, subtitle=?, cta_label=?, cta_href=?, image_url=?, image_public_id=?, mobile_image_url=?, mobile_image_public_id=?, active=?, sort_order=? WHERE id=?",
    [
      input.title,
      input.subtitle,
      input.ctaLabel,
      input.ctaHref,
      input.image,
      input.imagePublicId || "",
      input.mobileImage || "",
      input.mobileImagePublicId || "",
      input.active ? 1 : 0,
      input.sortOrder,
      id,
    ],
  );
}

export async function adminDeleteBanner(id: string): Promise<void> {
  await execSql("DELETE FROM banners WHERE id = ?", [id]);
}

/* ---------------------------------- reviews ------------------------------- */

export type ReviewInput = Omit<Review, "id">;

export async function adminListReviews(): Promise<Review[]> {
  try {
    const rows = await queryRows("SELECT * FROM reviews ORDER BY review_date DESC");
    return rows.map(mapReview);
  } catch {
    return [];
  }
}

export async function adminCreateReview(input: ReviewInput): Promise<void> {
  const id = "rev_" + Date.now().toString(36);
  await execSql(
    "INSERT INTO reviews (id, product_slug, author, rating, body, approved, review_date) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [
      id,
      input.productSlug,
      input.author,
      input.rating,
      input.body,
      input.approved ? 1 : 0,
      input.date || new Date().toISOString().slice(0, 10),
    ],
  );
}

export async function adminUpdateReview(id: string, input: ReviewInput): Promise<void> {
  await execSql(
    "UPDATE reviews SET product_slug=?, author=?, rating=?, body=?, approved=?, review_date=? WHERE id=?",
    [
      input.productSlug,
      input.author,
      input.rating,
      input.body,
      input.approved ? 1 : 0,
      input.date || new Date().toISOString().slice(0, 10),
      id,
    ],
  );
}

export async function adminDeleteReview(id: string): Promise<void> {
  await execSql("DELETE FROM reviews WHERE id = ?", [id]);
}

/* ---------------------------------- orders -------------------------------- */

async function fetchOrderItems(orderIds: string[]): Promise<Record<string, OrderItem[]>> {
  if (orderIds.length === 0) return {};
  try {
    const placeholders = orderIds.map(() => "?").join(",");
    const rows = await queryRows<Record<string, unknown>>(
      `SELECT * FROM order_items WHERE order_id IN (${placeholders})`,
      orderIds,
    );
    const map: Record<string, OrderItem[]> = {};
    for (const r of rows) {
      const oid = String(r.order_id);
      if (!map[oid]) map[oid] = [];
      map[oid].push({
        id: String(r.id),
        productId: (r.product_id as string) ?? null,
        productSlug: String(r.product_slug ?? ""),
        name: String(r.name ?? ""),
        image: String(r.image ?? ""),
        size: String(r.size ?? ""),
        color: String(r.color ?? ""),
        unitPrice: Number(r.unit_price ?? 0),
        quantity: Number(r.quantity ?? 0),
      });
    }
    return map;
  } catch {
    return {};
  }
}

function mapOrderRow(row: Record<string, unknown>, items: OrderItem[] = []): Order {
  return {
    id: String(row.id),
    orderNumber: String(row.order_number),
    fullName: String(row.full_name),
    mobile: String(row.mobile),
    district: String(row.district),
    area: String(row.area),
    address: String(row.address),
    note: (row.note as string) ?? "",
    subtotal: Number(row.subtotal ?? 0),
    deliveryCharge: Number(row.delivery_charge ?? 0),
    total: Number(row.total ?? 0),
    paymentMethod: (row.payment_method as string) ?? "cod",
    status: (row.status as OrderStatus) ?? "Pending",
    createdAt: String(row.created_at ?? ""),
    items,
  };
}

export async function adminListOrders(): Promise<Order[]> {
  try {
    const rows = await queryRows<Record<string, unknown>>(
      "SELECT * FROM orders ORDER BY created_at DESC",
    );
    const ids = rows.map((r) => String(r.id));
    const itemsMap = await fetchOrderItems(ids);
    return rows.map((r) => mapOrderRow(r, itemsMap[String(r.id)] || []));
  } catch {
    return [];
  }
}

export async function adminUpdateOrderStatus(id: string, status: OrderStatus): Promise<void> {
  await execSql("UPDATE orders SET status = ? WHERE id = ?", [status, id]);
}

/* --------------------------------- settings ------------------------------- */

export async function adminFetchSettings(): Promise<StoreSettings> {
  let settings = defaultSettings;
  try {
    const row = await queryRow("SELECT * FROM store_settings LIMIT 1");
    if (row) {
      settings = mapSettings(row);
    }
  } catch {
    /* fallback */
  }

  if (typeof window !== "undefined") {
    try {
      const stored = window.localStorage.getItem("purebengal_store_settings");
      if (stored) {
        settings = { ...settings, ...JSON.parse(stored) };
      }
    } catch {
      /* ignore */
    }
  }

  return settings;
}

export async function adminUpdateSettings(input: StoreSettings): Promise<void> {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem("purebengal_store_settings", JSON.stringify(input));
    } catch {
      /* ignore */
    }
  }

  if (isTursoConfigured) {
    try {
      await execSql(`
        CREATE TABLE IF NOT EXISTS store_settings (
          id INTEGER PRIMARY KEY,
          store_name TEXT,
          logo_url TEXT,
          logo_public_id TEXT,
          announcement TEXT,
          support_phone TEXT,
          whatsapp TEXT,
          support_email TEXT,
          address TEXT,
          facebook_url TEXT,
          instagram_url TEXT,
          youtube_url TEXT,
          delivery_inside_dhaka REAL,
          delivery_outside_dhaka REAL,
          delivery_time_inside TEXT,
          delivery_time_outside TEXT,
          exchange_window_days INTEGER,
          cod_enabled INTEGER,
          flash_sale_enabled INTEGER,
          flash_sale_title_bn TEXT,
          flash_sale_title_en TEXT,
          flash_sale_end_time TEXT
        );
      `);

      try {
        await execSql("ALTER TABLE store_settings ADD COLUMN flash_sale_enabled INTEGER DEFAULT 1");
      } catch {
        /* column exists */
      }
      try {
        await execSql("ALTER TABLE store_settings ADD COLUMN flash_sale_title_bn TEXT");
      } catch {
        /* column exists */
      }
      try {
        await execSql("ALTER TABLE store_settings ADD COLUMN flash_sale_title_en TEXT");
      } catch {
        /* column exists */
      }
      try {
        await execSql("ALTER TABLE store_settings ADD COLUMN flash_sale_end_time TEXT");
      } catch {
        /* column exists */
      }

      await execSql(
        `INSERT INTO store_settings (
          id, store_name, logo_url, logo_public_id, announcement, support_phone, whatsapp,
          support_email, address, facebook_url, instagram_url, youtube_url,
          delivery_inside_dhaka, delivery_outside_dhaka, delivery_time_inside,
          delivery_time_outside, exchange_window_days, cod_enabled,
          flash_sale_enabled, flash_sale_title_bn, flash_sale_title_en, flash_sale_end_time
        ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          store_name=excluded.store_name,
          logo_url=excluded.logo_url,
          logo_public_id=excluded.logo_public_id,
          announcement=excluded.announcement,
          support_phone=excluded.support_phone,
          whatsapp=excluded.whatsapp,
          support_email=excluded.support_email,
          address=excluded.address,
          facebook_url=excluded.facebook_url,
          instagram_url=excluded.instagram_url,
          youtube_url=excluded.youtube_url,
          delivery_inside_dhaka=excluded.delivery_inside_dhaka,
          delivery_outside_dhaka=excluded.delivery_outside_dhaka,
          delivery_time_inside=excluded.delivery_time_inside,
          delivery_time_outside=excluded.delivery_time_outside,
          exchange_window_days=excluded.exchange_window_days,
          cod_enabled=excluded.cod_enabled,
          flash_sale_enabled=excluded.flash_sale_enabled,
          flash_sale_title_bn=excluded.flash_sale_title_bn,
          flash_sale_title_en=excluded.flash_sale_title_en,
          flash_sale_end_time=excluded.flash_sale_end_time`,
        [
          input.storeName,
          input.logoUrl || "",
          input.logoPublicId || "",
          input.announcement,
          input.supportPhone,
          input.whatsapp,
          input.supportEmail,
          input.address,
          input.facebookUrl,
          input.instagramUrl,
          input.youtubeUrl,
          input.deliveryInsideDhaka,
          input.deliveryOutsideDhaka,
          input.deliveryTimeInside,
          input.deliveryTimeOutside,
          input.exchangeWindowDays,
          input.codEnabled ? 1 : 0,
          input.flashSaleEnabled ? 1 : 0,
          input.flashSaleTitleBn || "",
          input.flashSaleTitleEn || "",
          input.flashSaleEndTime || "",
        ],
      );
    } catch (e) {
      console.error("Error updating settings in DB:", e);
    }
  }
}

/* ----------------------------- dashboard reads ---------------------------- */

export async function fetchRecentOrders(limit = 8): Promise<Order[]> {
  try {
    const rows = await queryRows<Record<string, unknown>>(
      "SELECT * FROM orders ORDER BY created_at DESC LIMIT ?",
      [limit],
    );
    const ids = rows.map((r) => String(r.id));
    const itemsMap = await fetchOrderItems(ids);
    return rows.map((r) => mapOrderRow(r, itemsMap[String(r.id)] || []));
  } catch {
    return [];
  }
}

export type SalesPoint = { date: string; label: string; revenue: number; orders: number };

export async function fetchSalesSeries(days = 30): Promise<SalesPoint[]> {
  const start = new Date();
  start.setDate(start.getDate() - (days - 1));
  start.setHours(0, 0, 0, 0);

  const buckets = new Map<string, SalesPoint>();
  for (let i = 0; i < days; i += 1) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    buckets.set(key, {
      date: key,
      label: d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
      revenue: 0,
      orders: 0,
    });
  }

  try {
    const rows = await queryRows<{ created_at: string; total: number; status: string }>(
      "SELECT created_at, total, status FROM orders WHERE created_at >= ? ORDER BY created_at ASC",
      [start.toISOString()],
    );

    for (const row of rows) {
      if (row.status === "Cancelled" || row.status === "Returned") continue;
      const key = String(row.created_at).slice(0, 10);
      const bucket = buckets.get(key);
      if (!bucket) continue;
      bucket.revenue += Number(row.total ?? 0);
      bucket.orders += 1;
    }
  } catch {
    /* fallback to empty chart buckets */
  }

  return [...buckets.values()];
}

export type BestSeller = {
  productSlug: string;
  name: string;
  image: string;
  quantity: number;
  revenue: number;
};

export async function fetchBestSellers(limit = 5): Promise<BestSeller[]> {
  try {
    const rows = await queryRows<{
      product_slug: string;
      name: string;
      image: string;
      quantity: number;
      unit_price: number;
    }>("SELECT product_slug, name, image, quantity, unit_price FROM order_items");

    const totals = new Map<string, BestSeller>();
    for (const row of rows) {
      const key = row.product_slug || row.name;
      const current =
        totals.get(key) ??
        ({
          productSlug: row.product_slug ?? "",
          name: row.name ?? "",
          image: row.image ?? "",
          quantity: 0,
          revenue: 0,
        } satisfies BestSeller);
      current.quantity += Number(row.quantity ?? 0);
      current.revenue += Number(row.quantity ?? 0) * Number(row.unit_price ?? 0);
      if (!current.image && row.image) current.image = row.image;
      totals.set(key, current);
    }

    return [...totals.values()].sort((a, b) => b.quantity - a.quantity).slice(0, limit);
  } catch {
    return [];
  }
}

/* ------------------------------- place order ------------------------------ */

export async function placeTursoOrder(input: {
  fullName: string;
  mobile: string;
  district: string;
  area: string;
  address: string;
  note?: string;
  items: {
    productId?: string | null;
    productSlug?: string;
    name: string;
    image?: string;
    size?: string;
    color?: string;
    unitPrice: number;
    quantity: number;
  }[];
  subtotal: number;
  deliveryCharge: number;
  total: number;
}): Promise<{ orderNumber: string; placedAt: string; id: string }> {
  const orderId = "ord_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const stamp = Date.now().toString().slice(-6);
  const rand = Math.floor(Math.random() * 900 + 100);
  const orderNumber = `TRK-${stamp}${rand}`;
  const placedAt = new Date().toISOString();

  const batch: { sql: string; args: (string | number | boolean | null)[] }[] = [
    {
      sql: `INSERT INTO orders (
        id, order_number, full_name, mobile, district, area, address, note,
        subtotal, delivery_charge, total, payment_method, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'cod', 'Pending', ?)`,
      args: [
        orderId,
        orderNumber,
        input.fullName,
        input.mobile,
        input.district,
        input.area,
        input.address,
        input.note || "",
        input.subtotal,
        input.deliveryCharge,
        input.total,
        placedAt,
      ],
    },
  ];

  for (const item of input.items) {
    const itemId = "item_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    batch.push({
      sql: `INSERT INTO order_items (
        id, order_id, product_id, product_slug, name, image, size, color, unit_price, quantity
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        itemId,
        orderId,
        item.productId || null,
        item.productSlug || "",
        item.name,
        item.image || "",
        item.size || "",
        item.color || "",
        item.unitPrice,
        item.quantity,
      ],
    });
  }

  if (isTursoConfigured) {
    await execBatch(batch);
  }

  return { orderNumber, placedAt, id: orderId };
}
