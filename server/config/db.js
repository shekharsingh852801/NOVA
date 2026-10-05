import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";

const DEFAULT_DATABASE_PATH = fileURLToPath(new URL("../data/nova.sqlite", import.meta.url));
const CURRENT_SCHEMA_VERSION = 2;
let connection = null;

const schema = `
  CREATE TABLE IF NOT EXISTS products (
    slug TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    subcategory TEXT NOT NULL,
    price REAL NOT NULL CHECK (price >= 0),
    compare_at_price REAL CHECK (compare_at_price IS NULL OR compare_at_price >= 0),
    image TEXT NOT NULL,
    images_json TEXT NOT NULL,
    tag TEXT,
    colors_json TEXT NOT NULL,
    sizes_json TEXT NOT NULL,
    description TEXT NOT NULL,
    material TEXT NOT NULL,
    fit TEXT NOT NULL,
    care TEXT NOT NULL,
    rating REAL NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    reviews INTEGER NOT NULL DEFAULT 0 CHECK (reviews >= 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    tags_json TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('men', 'women', 'accessories', 'sale')),
    is_new_arrival INTEGER NOT NULL DEFAULT 1 CHECK (is_new_arrival IN (0, 1)),
    new_arrival INTEGER NOT NULL DEFAULT 1 CHECK (new_arrival IN (0, 1)),
    featured INTEGER NOT NULL DEFAULT 0 CHECK (featured IN (0, 1)),
    best_seller INTEGER NOT NULL DEFAULT 0 CHECK (best_seller IN (0, 1)),
    trending INTEGER NOT NULL DEFAULT 0 CHECK (trending IN (0, 1)),
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS products_category_order ON products(category, sort_order, created_at);
  CREATE INDEX IF NOT EXISTS products_new_arrivals ON products(new_arrival, sort_order);

  CREATE TABLE IF NOT EXISTS testimonials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    avatar TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    verified INTEGER NOT NULL DEFAULT 0 CHECK (verified IN (0, 1)),
    quote TEXT NOT NULL,
    posted_at TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS subscribers (
    email TEXT PRIMARY KEY COLLATE NOCASE,
    source TEXT NOT NULL DEFAULT 'newsletter-section' CHECK (source IN ('hero', 'newsletter-section', 'footer')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_number TEXT NOT NULL UNIQUE,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL COLLATE NOCASE,
    customer_phone TEXT NOT NULL,
    shipping_address TEXT NOT NULL,
    shipping_city TEXT NOT NULL,
    shipping_state TEXT NOT NULL,
    shipping_postal TEXT NOT NULL,
    items_json TEXT NOT NULL,
    subtotal REAL NOT NULL CHECK (subtotal >= 0),
    shipping REAL NOT NULL CHECK (shipping >= 0),
    total REAL NOT NULL CHECK (total >= 0),
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cash_on_delivery', 'pay_on_delivery')),
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled')),
    progress INTEGER NOT NULL DEFAULT 2 CHECK (progress BETWEEN 1 AND 6),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS orders_tracking_lookup ON orders(order_number, customer_email);

  CREATE TABLE IF NOT EXISTS support_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kind TEXT NOT NULL CHECK (kind IN ('contact', 'back-in-stock')),
    name TEXT,
    email TEXT NOT NULL COLLATE NOCASE,
    topic TEXT,
    message TEXT,
    product_slug TEXT,
    product_name TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE UNIQUE INDEX IF NOT EXISTS support_stock_alert_once
    ON support_requests(kind, email, product_slug) WHERE kind = 'back-in-stock';

  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'superadmin')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login TEXT
  );
`;

export function connectDB(databasePath = process.env.DATABASE_PATH || DEFAULT_DATABASE_PATH) {
  if (connection?.open) return connection;
  const resolvedPath = databasePath === ":memory:" ? databasePath : resolve(databasePath);
  if (resolvedPath !== ":memory:") mkdirSync(dirname(resolvedPath), { recursive: true });

  connection = new Database(resolvedPath);
  connection.pragma("foreign_keys = ON");
  connection.pragma("busy_timeout = 5000");
  if (resolvedPath !== ":memory:") connection.pragma("journal_mode = WAL");

  const currentVersion = connection.pragma("user_version", { simple: true });
  if (currentVersion < CURRENT_SCHEMA_VERSION) {
    const migrate = connection.transaction(() => {
      connection.exec(schema);
      connection.pragma(`user_version = ${CURRENT_SCHEMA_VERSION}`);
    });
    migrate();
  }

  console.log(`SQLite connected -> ${resolvedPath}`);
  return connection;
}

export function getDB() {
  if (!connection?.open) throw new Error("SQLite database has not been initialized");
  return connection;
}

export function isDatabaseReady() {
  return Boolean(connection?.open);
}

export function closeDB() {
  if (!connection?.open) return;
  connection.close();
  connection = null;
}

export default connectDB;