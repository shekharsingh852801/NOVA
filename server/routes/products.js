import { Router } from "express";
import { getDB } from "../config/db.js";

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

export default router;
