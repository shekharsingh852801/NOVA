import { Router } from "express";
import { getDB } from "../config/db.js";
import { authenticateAdmin } from "../middleware/auth.js";

const router = Router();
const COLOR_VALUES = {
  Ash: "#aaa9a4", Black: "#242321", Blue: "#82919a", Chalk: "#ebe8df", Charcoal: "#343431",
  Cloud: "#e5e0d5", Field: "#77745d", Ink: "#20201e", Moss: "#66705b", Natural: "#c9b99d",
  Oat: "#d8d1c5", Olive: "#5c6650", Sand: "#c0ad92", Stone: "#d1c8b8", "Washed indigo": "#515966",
};

function parseJSON(value, fallback) {
  try { return JSON.parse(value); } catch { return fallback; }
}

function serializeProduct(row) {
  const colors = parseJSON(row.colors_json, []);
  return {
    id: row.slug,
    _id: row.slug,
    slug: row.slug,
    name: row.name,
    subcategory: row.subcategory,
    price: row.price,
    compareAtPrice: row.compare_at_price,
    image: row.image,
    images: parseJSON(row.images_json, [row.image]),
    tag: row.tag,
    colors: colors.map((color) => typeof color === "string" ? { name: color, value: COLOR_VALUES[color] || "#777777" } : color),
    sizes: parseJSON(row.sizes_json, []),
    description: row.description,
    material: row.material,
    fit: row.fit,
    care: row.care,
    rating: row.rating,
    reviews: row.reviews,
    stock: row.stock,
    tags: parseJSON(row.tags_json, []),
    category: row.category[0].toUpperCase() + row.category.slice(1),
    isNewArrival: Boolean(row.is_new_arrival),
    newArrival: Boolean(row.new_arrival),
    featured: Boolean(row.featured),
    bestSeller: Boolean(row.best_seller),
    trending: Boolean(row.trending),
    sortOrder: row.sort_order,
    createdAt: row.created_at,
  };
}

// GET /api/products?category=men&newArrivals=true
router.get("/", (req, res) => {
  const { category, newArrivals } = req.query;
  if (category && !["men", "women", "accessories", "sale"].includes(category)) {
    return res.status(400).json({ message: "Invalid product category" });
  }
  if (newArrivals && !["true", "false"].includes(newArrivals)) {
    return res.status(400).json({ message: "newArrivals must be true or false" });
  }

  const clauses = [];
  const values = [];
  if (category) { clauses.push("category = ?"); values.push(category); }
  if (newArrivals === "true") clauses.push("is_new_arrival = 1");
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const rows = getDB().prepare(`SELECT * FROM products ${where} ORDER BY sort_order, created_at DESC`).all(...values);
  res.json(rows.map(serializeProduct));
});

// GET /api/products/:id
router.get("/:id", (req, res) => {
  const product = getDB().prepare("SELECT * FROM products WHERE slug = ?").get(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(serializeProduct(product));
});

// Helper to generate a slug if none is provided
function generateSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

// POST /api/products (Admin Only)
router.post("/", authenticateAdmin, (req, res) => {
  const data = req.body;
  const db = getDB();
  
  try {
    const slug = data.slug || generateSlug(data.name);
    
    // Check if slug already exists
    const existing = db.prepare("SELECT slug FROM products WHERE slug = ?").get(slug);
    if (existing) {
      return res.status(400).json({ message: "Product with this slug already exists" });
    }

    const stmt = db.prepare(`
      INSERT INTO products (
        slug, name, subcategory, price, compare_at_price, image, images_json,
        tag, colors_json, sizes_json, description, material, fit, care,
        rating, reviews, stock, tags_json, category, is_new_arrival, new_arrival,
        featured, best_seller, trending, sort_order
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `);

    stmt.run(
      slug,
      data.name || '',
      data.subcategory || '',
      data.price || 0,
      data.compareAtPrice || null,
      data.image || '',
      JSON.stringify(data.images || [data.image || '']),
      data.tag || '',
      JSON.stringify(data.colors || []),
      JSON.stringify(data.sizes || []),
      data.description || '',
      data.material || '',
      data.fit || '',
      data.care || '',
      data.rating || 0,
      data.reviews || 0,
      data.stock || 0,
      JSON.stringify(data.tags || []),
      data.category ? data.category.toLowerCase() : 'men',
      data.isNewArrival ? 1 : 0,
      data.newArrival ? 1 : 0,
      data.featured ? 1 : 0,
      data.bestSeller ? 1 : 0,
      data.trending ? 1 : 0,
      data.sortOrder || 0
    );

    const newProduct = db.prepare("SELECT * FROM products WHERE slug = ?").get(slug);
    res.status(201).json(serializeProduct(newProduct));
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({ message: "Failed to create product" });
  }
});

// PUT /api/products/:id (Admin Only)
router.put("/:id", authenticateAdmin, (req, res) => {
  const data = req.body;
  const slug = req.params.id;
  const db = getDB();
  
  try {
    const existing = db.prepare("SELECT slug FROM products WHERE slug = ?").get(slug);
    if (!existing) {
      return res.status(404).json({ message: "Product not found" });
    }

    const stmt = db.prepare(`
      UPDATE products SET
        name = ?, subcategory = ?, price = ?, compare_at_price = ?, image = ?, images_json = ?,
        tag = ?, colors_json = ?, sizes_json = ?, description = ?, material = ?, fit = ?, care = ?,
        rating = ?, reviews = ?, stock = ?, tags_json = ?, category = ?, is_new_arrival = ?, new_arrival = ?,
        featured = ?, best_seller = ?, trending = ?, sort_order = ?, updated_at = CURRENT_TIMESTAMP
      WHERE slug = ?
    `);

    stmt.run(
      data.name !== undefined ? data.name : existing.name,
      data.subcategory !== undefined ? data.subcategory : existing.subcategory,
      data.price !== undefined ? data.price : existing.price,
      data.compareAtPrice !== undefined ? data.compareAtPrice : existing.compare_at_price,
      data.image !== undefined ? data.image : existing.image,
      data.images !== undefined ? JSON.stringify(data.images) : existing.images_json,
      data.tag !== undefined ? data.tag : existing.tag,
      data.colors !== undefined ? JSON.stringify(data.colors) : existing.colors_json,
      data.sizes !== undefined ? JSON.stringify(data.sizes) : existing.sizes_json,
      data.description !== undefined ? data.description : existing.description,
      data.material !== undefined ? data.material : existing.material,
      data.fit !== undefined ? data.fit : existing.fit,
      data.care !== undefined ? data.care : existing.care,
      data.rating !== undefined ? data.rating : existing.rating,
      data.reviews !== undefined ? data.reviews : existing.reviews,
      data.stock !== undefined ? data.stock : existing.stock,
      data.tags !== undefined ? JSON.stringify(data.tags) : existing.tags_json,
      data.category !== undefined ? data.category.toLowerCase() : existing.category,
      data.isNewArrival !== undefined ? (data.isNewArrival ? 1 : 0) : existing.is_new_arrival,
      data.newArrival !== undefined ? (data.newArrival ? 1 : 0) : existing.new_arrival,
      data.featured !== undefined ? (data.featured ? 1 : 0) : existing.featured,
      data.bestSeller !== undefined ? (data.bestSeller ? 1 : 0) : existing.best_seller,
      data.trending !== undefined ? (data.trending ? 1 : 0) : existing.trending,
      data.sortOrder !== undefined ? data.sortOrder : existing.sort_order,
      slug
    );

    const updatedProduct = db.prepare("SELECT * FROM products WHERE slug = ?").get(slug);
    res.json(serializeProduct(updatedProduct));
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ message: "Failed to update product" });
  }
});

// DELETE /api/products/:id (Admin Only)
router.delete("/:id", authenticateAdmin, (req, res) => {
  const slug = req.params.id;
  const db = getDB();
  
  try {
    const existing = db.prepare("SELECT slug FROM products WHERE slug = ?").get(slug);
    if (!existing) {
      return res.status(404).json({ message: "Product not found" });
    }

    db.prepare("DELETE FROM products WHERE slug = ?").run(slug);
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ message: "Failed to delete product" });
  }
});

export default router;
