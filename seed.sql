-- ====================================================================
-- PureBengal Organic Food Store - Complete Database Setup & Seed SQL
-- Run this SQL in your Turso Dashboard / Turso CLI / SQLite client
-- ====================================================================

-- 1. Create Tables
CREATE TABLE IF NOT EXISTS admin_users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'admin'
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  image_public_id TEXT,
  active INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  short_description TEXT,
  full_description TEXT,
  category_slug TEXT NOT NULL,
  images TEXT DEFAULT '[]',
  image_public_ids TEXT DEFAULT '[]',
  regular_price REAL NOT NULL,
  sale_price REAL,
  sizes TEXT DEFAULT '[]',
  colors TEXT DEFAULT '[]',
  stock INTEGER DEFAULT 50,
  sku TEXT,
  featured INTEGER DEFAULT 0,
  best_seller INTEGER DEFAULT 0,
  new_arrival INTEGER DEFAULT 0,
  active INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS banners (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  cta_label TEXT,
  cta_href TEXT,
  image_url TEXT NOT NULL,
  image_public_id TEXT,
  mobile_image_url TEXT,
  mobile_image_public_id TEXT,
  active INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS store_settings (
  id INTEGER PRIMARY KEY,
  store_name TEXT NOT NULL,
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
  delivery_inside_dhaka REAL DEFAULT 60,
  delivery_outside_dhaka REAL DEFAULT 120,
  delivery_time_inside TEXT,
  delivery_time_outside TEXT,
  exchange_window_days INTEGER DEFAULT 3,
  cod_enabled INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  mobile TEXT NOT NULL,
  district TEXT NOT NULL,
  area TEXT NOT NULL,
  address TEXT NOT NULL,
  note TEXT,
  subtotal REAL NOT NULL,
  delivery_charge REAL NOT NULL,
  total REAL NOT NULL,
  payment_method TEXT DEFAULT 'cod',
  status TEXT DEFAULT 'Pending',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  product_id TEXT,
  product_slug TEXT,
  name TEXT NOT NULL,
  image TEXT,
  size TEXT,
  color TEXT,
  unit_price REAL NOT NULL,
  quantity INTEGER NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  product_slug TEXT NOT NULL,
  author TEXT NOT NULL,
  rating INTEGER NOT NULL,
  body TEXT NOT NULL,
  approved INTEGER DEFAULT 1,
  review_date TEXT NOT NULL
);

-- 2. Clear Existing Default Data to ensure clean reset
DELETE FROM categories;
DELETE FROM products;
DELETE FROM banners;
DELETE FROM store_settings;

-- 3. Seed Admin User
INSERT INTO admin_users (id, email, password_hash, role)
VALUES ('admin_01', 'admin@organicbd.com', 'admin123', 'admin')
ON CONFLICT(email) DO UPDATE SET password_hash='admin123';

-- 4. Seed Categories (Including Seeds & Nuts)
INSERT INTO categories (id, name, slug, description, image_url, active, sort_order) VALUES
('pure-honey', 'Pure Honey (খাঁটি মধু)', 'pure-honey', '100% unpasteurized raw honey collected straight from Sundarban mangrove and wildflower orchards.', 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80', 1, 1),
('seeds-and-nuts', 'Seeds & Nuts (বীজ ও বাদাম)', 'seeds-and-nuts', 'Nutrient-dense black seed (Kalojira), organic chia seeds, raw almond, and energy nuts.', 'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&w=800&q=80', 1, 2),
('organic-spices', 'Organic Spices (বিশুদ্ধ মশলা)', 'organic-spices', 'Chemical-free, stone-ground turmeric, red chili, cumin, coriander, and whole aromatic spices.', 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80', 1, 3),
('oils-and-ghee', 'Oils & Ghee (তেল ও ঘি)', 'oils-and-ghee', 'Traditional wood-pressed mustard oil, pure Pabna cow ghee, and cold-pressed coconut oil.', 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80', 1, 4),
('herbal-and-tea', 'Herbal & Tea (ভেষজ ও চা)', 'herbal-and-tea', 'Organic Sylhet green tea leaves, pure Ashwagandha, Moringa powder, and herbal infusions.', 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80', 1, 5);

-- 5. Seed Products (25 Organic Items with High-Quality Images)
INSERT INTO products (id, name, slug, short_description, full_description, category_slug, images, regular_price, sale_price, sizes, colors, stock, sku, featured, best_seller, new_arrival, active, sort_order, created_at) VALUES
('p1', 'Sundarban Raw Wild Flower Honey (500g)', 'sundarban-raw-wild-honey', '100% pure unheated raw wild flower honey from the Sundarban mangrove forest.', 'Harvested sustainably by traditional honey collectors. Unfiltered, rich in natural enzymes, antioxidants, and wildflower pollen.', 'pure-honey', '["https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80"]', 750, 680, '["250g","500g","1kg"]', '[{"name":"Amber Gold","hex":"#f57f17"}]', 50, 'HNY-SND-01', 1, 1, 0, 1, 1, CURRENT_TIMESTAMP),
('p2', 'Organic Mustard Flower Honey (500g)', 'organic-mustard-flower-honey', 'Naturally crystallized light honey collected from organic mustard fields.', 'Rich in natural nectar with a distinct pleasant floral aroma. Great natural energy booster for tea and warm water.', 'pure-honey', '["https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=800&q=80"]', 600, 520, '["250g","500g","1kg"]', '[{"name":"Light Gold","hex":"#fbc02d"}]', 40, 'HNY-MST-02', 1, 0, 1, 1, 2, CURRENT_TIMESTAMP),
('p3', 'Pure Lychee Blossom Honey (500g)', 'pure-lychee-blossom-honey', 'Fragrant sweet honey gathered during the seasonal lychee blossom in Dinajpur.', 'Smooth, sweet, and lightly fruity aroma. No sugar syrup added.', 'pure-honey', '["https://images.unsplash.com/photo-1471943311424-646960669fbc?auto=format&fit=crop&w=800&q=80"]', 700, 620, '["250g","500g"]', '[{"name":"Golden Amber","hex":"#ffb300"}]', 30, 'HNY-LCH-03', 0, 1, 0, 1, 3, CURRENT_TIMESTAMP),
('p4', 'Kalijira Flower Honey (500g)', 'kalijira-flower-honey', 'Rare dark medicinal honey sourced from black seed blossoms.', 'Deep rich flavor packed with health benefits of black cumin nectar.', 'pure-honey', '["https://images.unsplash.com/photo-1628102491629-778571d893a3?auto=format&fit=crop&w=800&q=80"]', 950, 880, '["250g","500g","1kg"]', '[{"name":"Dark Mahogany","hex":"#4e342e"}]', 25, 'HNY-KLJ-04', 1, 1, 1, 1, 4, CURRENT_TIMESTAMP),
('p5', 'Raw Comb Honey with Natural Honeycomb (400g)', 'raw-comb-honey', 'Fresh honey filled right inside authentic natural beeswax honeycomb frames.', 'The purest form of honey straight from the hive, untouched and completely natural.', 'pure-honey', '["https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80"]', 1200, 1050, '["400g","800g"]', '[{"name":"Honeycomb","hex":"#ff8f00"}]', 15, 'HNY-CMB-05', 1, 0, 1, 1, 5, CURRENT_TIMESTAMP),

('p6', 'Premium Kalojira Seed / কালোজিরা (250g)', 'premium-kalojira-seeds', 'Clean, fragrant organic black cumin seeds carefully sifted and packed.', 'Known as the miracle seed for immune wellness. Perfect for daily consumption or spice seasoning.', 'seeds-and-nuts', '["https://images.unsplash.com/photo-1509358271058-acd05cc93898?auto=format&fit=crop&w=800&q=80"]', 250, 210, '["250g","500g","1kg"]', '[{"name":"Jet Black","hex":"#212121"}]', 60, 'SDS-KLJ-06', 1, 1, 0, 1, 6, CURRENT_TIMESTAMP),
('p7', 'Organic Chia Seeds / চিয়া সিড (500g)', 'organic-chia-seeds', 'High-fiber organic chia seeds rich in Omega-3 and protein.', 'Triple washed and air dried. Ideal for morning smoothies, puddings, or hydration drinks.', 'seeds-and-nuts', '["https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&w=800&q=80"]', 450, 390, '["250g","500g","1kg"]', '[{"name":"Speckled Black","hex":"#424242"}]', 45, 'SDS-CHA-07', 1, 1, 1, 1, 7, CURRENT_TIMESTAMP),
('p8', 'Raw California Almonds / কাঠবাদাম (250g)', 'raw-california-almonds', 'Whole nonpareil crunchy almonds packed with natural vitamin E.', 'Unsalted and raw. Sourced fresh for crisp texture and rich nutty flavor.', 'seeds-and-nuts', '["https://images.unsplash.com/photo-1508061252966-f72b4f77c3e7?auto=format&fit=crop&w=800&q=80"]', 380, 330, '["250g","500g","1kg"]', '[{"name":"Nutty Brown","hex":"#8d6e63"}]', 35, 'NTS-ALM-08', 0, 1, 0, 1, 8, CURRENT_TIMESTAMP),
('p9', 'Organic Flaxseeds / তিসি বীজ (250g)', 'organic-flaxseeds', 'Golden-brown roasted or raw organic flaxseeds for heart wellness.', 'Rich in lignans and dietary fiber. Excellent seed boost for cereal and baking.', 'seeds-and-nuts', '["https://images.unsplash.com/photo-1543208541-0059d64222f7?auto=format&fit=crop&w=800&q=80"]', 180, 150, '["250g","500g"]', '[{"name":"Bronze Brown","hex":"#6d4c41"}]', 40, 'SDS-FLX-09', 0, 0, 1, 1, 9, CURRENT_TIMESTAMP),
('p10', 'Mixed Energy Nuts & Seeds Pack (500g)', 'mixed-energy-nuts-and-seeds', 'Handpicked premium mix of almonds, cashews, raisins, pumpkin, and chia seeds.', 'The ultimate natural energy snack for workout recovery and wholesome munching.', 'seeds-and-nuts', '["https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=800&q=80"]', 650, 580, '["250g","500g","1kg"]', '[{"name":"Multi-grain","hex":"#a1887f"}]', 30, 'NTS-MIX-10', 1, 1, 1, 1, 10, CURRENT_TIMESTAMP),

('p11', 'Pure Organic Turmeric Powder / হলুদের গুঁড়া (250g)', 'organic-turmeric-powder', 'High-curcumin aromatic turmeric ground directly from dried organic roots.', 'Chemical-free turmeric harvested in Pabna. Deep golden color and authentic earthly aroma.', 'organic-spices', '["https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80"]', 220, 185, '["250g","500g","1kg"]', '[{"name":"Vibrant Yellow","hex":"#fdd835"}]', 55, 'SPC-TRM-11', 1, 1, 0, 1, 11, CURRENT_TIMESTAMP),
('p12', 'Stone-Ground Red Chili Powder / মরিচ গুঁড়া (250g)', 'stone-ground-red-chili-powder', 'Naturally sun-dried Bogura red chilies stone-milled for rich red color and heat.', 'No artificial dyes or red food coloring. Pure ground chili for authentic curry recipes.', 'organic-spices', '["https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80"]', 240, 200, '["250g","500g"]', '[{"name":"Chili Red","hex":"#e53935"}]', 40, 'SPC-CHL-12', 1, 0, 1, 1, 12, CURRENT_TIMESTAMP),
('p13', 'Fragrant Cumin Seed & Powder / জিরার গুঁড়া (250g)', 'fragrant-cumin-powder', 'Freshly roasted and stone-ground premium cumin powder.', 'Deep warm aroma that enhances fish, meat, and lentil curries.', 'organic-spices', '["https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=800&q=80"]', 350, 290, '["250g","500g"]', '[{"name":"Earthly Cumin","hex":"#795548"}]', 35, 'SPC-CMN-13', 0, 1, 0, 1, 13, CURRENT_TIMESTAMP),
('p14', 'Organic Coriander Powder / ধনিয়ার গুঁড়া (250g)', 'organic-coriander-powder', 'Cool, sweet aromatic coriander powder ground from whole green seeds.', '100% natural without stalks or foreign matter.', 'organic-spices', '["https://images.unsplash.com/photo-1532336414038-cf19250c5757?auto=format&fit=crop&w=800&q=80"]', 190, 160, '["250g","500g"]', '[{"name":"Warm Khaki","hex":"#bcaaa4"}]', 45, 'SPC-COR-14', 0, 0, 1, 1, 14, CURRENT_TIMESTAMP),
('p15', 'Whole Cardamom & Cinnamon Pack / এলাচ ও দারুচিনি (100g)', 'whole-cardamom-cinnamon-pack', 'Fragrant whole green cardamom pods and Ceylon cinnamon sticks.', 'Essential Bangladeshi aromatic whole spice blend for biryani, polao, and desserts.', 'organic-spices', '["https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80"]', 420, 380, '["100g","250g"]', '[{"name":"Forest Spice","hex":"#3e2723"}]', 30, 'SPC-MIX-15', 1, 1, 1, 1, 15, CURRENT_TIMESTAMP),

('p16', 'Wood-Pressed Cold Mustard Oil / কাঠের ঘানি সরিষার তেল (1L)', 'wood-pressed-mustard-oil', 'Traditional Kather Ghani wood-pressed pungent virgin mustard oil.', 'Cold extracted without heat or chemical solvents. Retains full natural aroma, pungency, and vital nutrients.', 'oils-and-ghee', '["https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80"]', 380, 340, '["500ml","1 Litre","2 Litres","5 Litres"]', '[{"name":"Golden Yellow","hex":"#fbc02d"}]', 60, 'OIL-MST-16', 1, 1, 0, 1, 16, CURRENT_TIMESTAMP),
('p17', 'Premium Pabna Cow Milk Ghee / খাঁটি গাভীর ঘি (500g)', 'premium-pabna-cow-ghee', 'Aromatic granular desi cow milk ghee churned traditionally in Pabna.', 'Made from pure milk fat. Rich golden color and heavenly aroma that elevates every traditional meal.', 'oils-and-ghee', '["https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?auto=format&fit=crop&w=800&q=80"]', 950, 880, '["250g","500g","1kg"]', '[{"name":"Ghee Yellow","hex":"#fdd835"}]', 40, 'GHE-PBN-17', 1, 1, 1, 1, 17, CURRENT_TIMESTAMP),
('p18', 'Extra Virgin Cold-Pressed Coconut Oil (500ml)', 'extra-virgin-coconut-oil', 'Raw cold-pressed coconut oil pressed from fresh copra.', 'Unrefined and unbleached. Multi-purpose for dietary intake and hair wellness.', 'oils-and-ghee', '["https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=800&q=80"]', 550, 480, '["250ml","500ml","1 Litre"]', '[{"name":"Crystal Clear","hex":"#fafafa"}]', 30, 'OIL-CCN-18', 0, 0, 1, 1, 18, CURRENT_TIMESTAMP),
('p19', 'Pure Kalojira Seed Oil / কালোজিরা তেল (100ml)', 'pure-kalojira-oil', '100% pure cold-extracted black cumin oil in a dark glass bottle.', 'Potent natural tonic rich in thymoquinone for daily immunity.', 'oils-and-ghee', '["https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80"]', 320, 280, '["100ml","250ml"]', '[{"name":"Dark Amber","hex":"#3e2723"}]', 35, 'OIL-KLJ-19', 1, 1, 0, 1, 19, CURRENT_TIMESTAMP),
('p20', 'Organic Cold-Pressed Olive Oil (500ml)', 'organic-cold-pressed-olive-oil', 'Unrefined extra virgin olive oil high in polyphenols.', 'First cold press. Ideal for salad dressing and daily healthy diet.', 'oils-and-ghee', '["https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80"]', 1250, 1100, '["250ml","500ml","1 Litre"]', '[{"name":"Olive Green","hex":"#558b2f"}]', 20, 'OIL-OLV-20', 0, 0, 1, 1, 20, CURRENT_TIMESTAMP),

('p21', 'Organic Sylhet Green Tea Leaves (200g)', 'organic-sylhet-green-tea', 'Hand-picked whole leaf green tea from organic estates in Sreemangal, Sylhet.', 'Antioxidant-rich whole green tea leaves with a refreshing light floral finish.', 'herbal-and-tea', '["https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80"]', 320, 270, '["100g","200g","500g"]', '[{"name":"Leaf Green","hex":"#33691e"}]', 50, 'TEA-GRN-21', 1, 1, 0, 1, 21, CURRENT_TIMESTAMP),
('p22', 'Pure Ashwagandha Root Powder / অশ্বগন্ধা (100g)', 'pure-ashwagandha-powder', 'Finely ground organic Ashwagandha root powder for stress support and stamina.', 'Authentic Ayurvedic adaptogen herb. 100% additive-free.', 'herbal-and-tea', '["https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80"]', 350, 295, '["100g","250g"]', '[{"name":"Cream Tan","hex":"#d7ccc8"}]', 35, 'HRB-ASH-22', 0, 1, 1, 1, 22, CURRENT_TIMESTAMP),
('p23', 'Organic Moringa Leaf Powder / সজিনা পাতা (100g)', 'organic-moringa-powder', 'Superfood Moringa leaf powder packed with vitamins, iron, and calcium.', 'Gently shade-dried organic Sajna leaves pulverized into a fine superfood powder.', 'herbal-and-tea', '["https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=800&q=80"]', 280, 240, '["100g","250g"]', '[{"name":"Emerald Green","hex":"#1b5e20"}]', 40, 'HRB-MRG-23', 1, 0, 1, 1, 23, CURRENT_TIMESTAMP),
('p24', 'Chamomile Herbal Infusion Tea (100g)', 'chamomile-herbal-tea', 'Calming whole chamomile flower heads for bedtime relaxation.', 'Caffeine-free soothing floral herbal tea for peaceful sleep and digestion.', 'herbal-and-tea', '["https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=800&q=80"]', 450, 390, '["100g","200g"]', '[{"name":"Daisy Yellow","hex":"#fff59d"}]', 25, 'TEA-CHM-24', 0, 0, 1, 1, 24, CURRENT_TIMESTAMP),
('p25', 'Pure Triphala Herbal Powder / ত্রিফলা (200g)', 'pure-triphala-powder', 'Traditional herbal blend of Amla, Haritaki, and Bibhitaki.', 'Time-tested natural digestive aid and body cleanser.', 'herbal-and-tea', '["https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80"]', 300, 250, '["200g","500g"]', '[{"name":"Herbal Brown","hex":"#5d4037"}]', 30, 'HRB-TRP-25', 1, 1, 0, 1, 25, CURRENT_TIMESTAMP);

-- 6. Seed Hero Banner
INSERT INTO banners (id, title, subtitle, cta_label, cta_href, image_url, mobile_image_url, active, sort_order) VALUES
('hero-purebengal-1', 'Authentic Organic Food Store', '100% Pure & Chemical-Free Bangladeshi Organic Produce', 'Shop Organic Harvest', '/shop', 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80', 1, 1);

-- 7. Seed Store Settings
INSERT INTO store_settings (id, store_name, announcement, support_phone, whatsapp, support_email, address, delivery_inside_dhaka, delivery_outside_dhaka, delivery_time_inside, delivery_time_outside, exchange_window_days, cod_enabled) VALUES
(1, 'PureBengal', '🌱 100% Certified Organic • Pure Farm Sourced Organic Food across Bangladesh', '+880 1711-223344', '+880 1711-223344', 'hello@purebengal.com.bd', 'House 45, Road 11, Block D, Banani, Dhaka 1213', 60, 120, 'Same-day or Next-morning delivery', '24-48 hours refrigerated transit', 3, 1)
ON CONFLICT(id) DO UPDATE SET store_name='PureBengal', announcement='🌱 100% Certified Organic • Pure Farm Sourced Organic Food across Bangladesh';
