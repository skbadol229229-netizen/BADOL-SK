import { execSql, isTursoConfigured, queryRows } from "./turso";
import { defaultBanners, defaultCategories, defaultProducts } from "../data/catalog";

let schemaEnsured = false;
let schemaPromise: Promise<void> | null = null;

export async function ensureDbSchema(): Promise<void> {
  if (!isTursoConfigured) return;
  if (schemaEnsured) return;

  if (schemaPromise) {
    return schemaPromise;
  }

  schemaPromise = (async () => {
    try {
      // 1. Admin users
      await execSql(`
        CREATE TABLE IF NOT EXISTS admin_users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'admin'
        );
      `);

      // 2. Store settings
      await execSql(`
        CREATE TABLE IF NOT EXISTS store_settings (
          id TEXT PRIMARY KEY DEFAULT 'main',
          store_name TEXT,
          phone TEXT,
          email TEXT,
          address TEXT,
          shipping_charge_dhaka REAL DEFAULT 70,
          shipping_charge_outside REAL DEFAULT 130,
          free_shipping_min REAL DEFAULT 1500,
          banner_headline TEXT,
          banner_subheadline TEXT,
          logo_url TEXT,
          hero_banner_url TEXT
        );
      `);

      // 3. Products
      await execSql(`
        CREATE TABLE IF NOT EXISTS products (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL DEFAULT '',
          slug TEXT UNIQUE NOT NULL DEFAULT '',
          short_description TEXT DEFAULT '',
          full_description TEXT DEFAULT '',
          category_slug TEXT DEFAULT '',
          images TEXT DEFAULT '[]',
          image_public_ids TEXT DEFAULT '[]',
          regular_price REAL NOT NULL DEFAULT 0,
          sale_price REAL,
          sizes TEXT DEFAULT '[]',
          colors TEXT DEFAULT '[]',
          stock INTEGER NOT NULL DEFAULT 0,
          sku TEXT DEFAULT '',
          featured INTEGER NOT NULL DEFAULT 0,
          best_seller INTEGER NOT NULL DEFAULT 0,
          new_arrival INTEGER NOT NULL DEFAULT 0,
          active INTEGER NOT NULL DEFAULT 1,
          sort_order INTEGER NOT NULL DEFAULT 0,
          created_at TEXT
        );
      `);

      // Check and heal products columns if table existed with missing columns
      try {
        const prodInfo = await queryRows<{ name?: string }>("PRAGMA table_info(products)");
        const existingProdCols = new Set(prodInfo.map((r) => String(r.name || "")));

        const requiredProdCols: [string, string][] = [
          ["name", "TEXT NOT NULL DEFAULT ''"],
          ["slug", "TEXT DEFAULT ''"],
          ["short_description", "TEXT DEFAULT ''"],
          ["full_description", "TEXT DEFAULT ''"],
          ["category_slug", "TEXT DEFAULT ''"],
          ["images", "TEXT DEFAULT '[]'"],
          ["image_public_ids", "TEXT DEFAULT '[]'"],
          ["regular_price", "REAL NOT NULL DEFAULT 0"],
          ["sale_price", "REAL"],
          ["sizes", "TEXT DEFAULT '[]'"],
          ["colors", "TEXT DEFAULT '[]'"],
          ["stock", "INTEGER NOT NULL DEFAULT 0"],
          ["sku", "TEXT DEFAULT ''"],
          ["featured", "INTEGER NOT NULL DEFAULT 0"],
          ["best_seller", "INTEGER NOT NULL DEFAULT 0"],
          ["new_arrival", "INTEGER NOT NULL DEFAULT 0"],
          ["active", "INTEGER NOT NULL DEFAULT 1"],
          ["sort_order", "INTEGER NOT NULL DEFAULT 0"],
          ["created_at", "TEXT"],
        ];

        for (const [colName, colType] of requiredProdCols) {
          if (!existingProdCols.has(colName)) {
            await execSql(`ALTER TABLE products ADD COLUMN ${colName} ${colType}`);
          }
        }
      } catch (e) {
        console.warn("Products column check warning:", e);
      }

      // 4. Categories
      await execSql(`
        CREATE TABLE IF NOT EXISTS categories (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL DEFAULT '',
          slug TEXT UNIQUE NOT NULL DEFAULT '',
          description TEXT DEFAULT '',
          image_url TEXT DEFAULT '',
          image_public_id TEXT DEFAULT '',
          active INTEGER NOT NULL DEFAULT 1,
          sort_order INTEGER NOT NULL DEFAULT 0
        );
      `);

      try {
        const catInfo = await queryRows<{ name?: string }>("PRAGMA table_info(categories)");
        const existingCatCols = new Set(catInfo.map((r) => String(r.name || "")));
        const requiredCatCols: [string, string][] = [
          ["name", "TEXT NOT NULL DEFAULT ''"],
          ["slug", "TEXT DEFAULT ''"],
          ["description", "TEXT DEFAULT ''"],
          ["image_url", "TEXT DEFAULT ''"],
          ["image_public_id", "TEXT DEFAULT ''"],
          ["active", "INTEGER NOT NULL DEFAULT 1"],
          ["sort_order", "INTEGER NOT NULL DEFAULT 0"],
        ];
        for (const [colName, colType] of requiredCatCols) {
          if (!existingCatCols.has(colName)) {
            await execSql(`ALTER TABLE categories ADD COLUMN ${colName} ${colType}`);
          }
        }
      } catch (e) {
        console.warn("Categories column check warning:", e);
      }

      // 5. Banners
      await execSql(`
        CREATE TABLE IF NOT EXISTS banners (
          id TEXT PRIMARY KEY,
          title TEXT DEFAULT '',
          subtitle TEXT DEFAULT '',
          cta_label TEXT DEFAULT '',
          cta_href TEXT DEFAULT '',
          image_url TEXT DEFAULT '',
          image_public_id TEXT DEFAULT '',
          mobile_image_url TEXT DEFAULT '',
          mobile_image_public_id TEXT DEFAULT '',
          active INTEGER NOT NULL DEFAULT 1,
          sort_order INTEGER NOT NULL DEFAULT 0
        );
      `);

      // 6. Orders
      await execSql(`
        CREATE TABLE IF NOT EXISTS orders (
          id TEXT PRIMARY KEY,
          customer_name TEXT DEFAULT '',
          customer_phone TEXT DEFAULT '',
          shipping_address TEXT DEFAULT '',
          district TEXT DEFAULT '',
          sub_district TEXT DEFAULT '',
          payment_method TEXT DEFAULT '',
          items TEXT DEFAULT '[]',
          total REAL NOT NULL DEFAULT 0,
          status TEXT DEFAULT 'pending',
          created_at TEXT
        );
      `);

      // 7. Reviews
      await execSql(`
        CREATE TABLE IF NOT EXISTS reviews (
          id TEXT PRIMARY KEY,
          product_slug TEXT DEFAULT '',
          customer_name TEXT DEFAULT '',
          rating INTEGER NOT NULL DEFAULT 5,
          comment TEXT DEFAULT '',
          verified INTEGER NOT NULL DEFAULT 1,
          created_at TEXT
        );
      `);

      // 8. Auto-seed products if database is empty
      try {
        const pCount = await queryRows<{ count: number }>("SELECT COUNT(*) as count FROM products");
        const count = pCount?.[0]?.count ?? 0;
        if (count === 0 && defaultProducts.length > 0) {
          for (const p of defaultProducts) {
            await execSql(
              `INSERT OR IGNORE INTO products (
                id, name, slug, short_description, full_description, category_slug,
                images, image_public_ids, regular_price, sale_price, sizes, colors,
                stock, sku, featured, best_seller, new_arrival, active, sort_order, created_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                p.id,
                p.name,
                p.slug,
                p.shortDescription || "",
                p.fullDescription || "",
                p.categorySlug || "",
                JSON.stringify(p.images || []),
                JSON.stringify(p.imagePublicIds || []),
                p.regularPrice || 0,
                p.salePrice ?? null,
                JSON.stringify(p.sizes || []),
                JSON.stringify(p.colors || []),
                p.stock || 0,
                p.sku || "",
                p.featured ? 1 : 0,
                p.bestSeller ? 1 : 0,
                p.newArrival ? 1 : 0,
                p.active ? 1 : 0,
                p.sortOrder || 0,
                p.createdAt || new Date().toISOString(),
              ],
            );
          }
        }
      } catch (e) {
        console.warn("Product auto-seed warning:", e);
      }

      // Auto-seed categories if empty
      try {
        const cCount = await queryRows<{ count: number }>(
          "SELECT COUNT(*) as count FROM categories",
        );
        const count = cCount?.[0]?.count ?? 0;
        if (count === 0 && defaultCategories.length > 0) {
          for (const c of defaultCategories) {
            await execSql(
              `INSERT OR IGNORE INTO categories (
                id, name, slug, description, image_url, image_public_id, active, sort_order
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                c.id,
                c.name,
                c.slug,
                c.description || "",
                c.image || "",
                c.imagePublicId || "",
                c.active ? 1 : 0,
                c.sortOrder || 0,
              ],
            );
          }
        }
      } catch (e) {
        console.warn("Category auto-seed warning:", e);
      }

      // Auto-seed banners if empty
      try {
        const bCount = await queryRows<{ count: number }>("SELECT COUNT(*) as count FROM banners");
        const count = bCount?.[0]?.count ?? 0;
        if (count === 0 && defaultBanners.length > 0) {
          for (const b of defaultBanners) {
            await execSql(
              `INSERT OR IGNORE INTO banners (
                id, title, subtitle, cta_label, cta_href, image_url, image_public_id, mobile_image_url, mobile_image_public_id, active, sort_order
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                b.id,
                b.title || "",
                b.subtitle || "",
                b.ctaLabel || "",
                b.ctaHref || "",
                b.image || "",
                b.imagePublicId || "",
                b.mobileImage || "",
                b.mobileImagePublicId || "",
                b.active ? 1 : 0,
                b.sortOrder || 0,
              ],
            );
          }
        }
      } catch (e) {
        console.warn("Banner auto-seed warning:", e);
      }

      schemaEnsured = true;
    } catch (err) {
      console.error("ensureDbSchema error:", err);
    } finally {
      schemaPromise = null;
    }
  })();

  return schemaPromise;
}
