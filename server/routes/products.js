import { Router } from "express";
import { Product } from "../models/Product.js";
import { Review } from "../models/Review.js";
import { authenticateAdmin } from "../middleware/auth.js";
import { authenticateCustomer } from "../middleware/customerAuth.js";

const router = Router();
const COLOR_VALUES = {
  Ash: "#aaa9a4", Black: "#242321", Blue: "#82919a", Chalk: "#ebe8df", Charcoal: "#343431",
  Cloud: "#e5e0d5", Field: "#77745d", Ink: "#20201e", Moss: "#66705b", Natural: "#c9b99d",
  Oat: "#d8d1c5", Olive: "#5c6650", Sand: "#c0ad92", Stone: "#d1c8b8", "Washed indigo": "#515966",
};

function parseJSON(value, fallback) {
  if (typeof value !== "string") return value;
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
router.get("/", async (req, res) => {
  const { category, newArrivals } = req.query;
  if (category && !["men", "women", "accessories", "sale"].includes(category)) {
    return res.status(400).json({ message: "Invalid product category" });
  }
  if (newArrivals && !["true", "false"].includes(newArrivals)) {
    return res.status(400).json({ message: "newArrivals must be true or false" });
  }

  const query = {};
  if (category) query.category = category;
  if (newArrivals === "true") query.is_new_arrival = 1;

  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;

    const rows = await Product.find(query).sort({ sort_order: 1, created_at: -1 }).skip(skip).limit(limit);
    const total = await Product.countDocuments(query);
    
    res.set("X-Total-Count", total);
    res.set("Access-Control-Expose-Headers", "X-Total-Count");
    res.json(rows.map(serializeProduct));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// GET /api/products/:id
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.id });
    if (!product) return res.status(404).json({ message: "Product not found" });
    
    // Fetch approved reviews
    const reviews = await Review.find({ product_id: product._id, status: 'approved' }).sort({ created_at: -1 });
    const serializedProduct = serializeProduct(product);
    serializedProduct.userReviews = reviews;
    
    res.json(serializedProduct);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// POST /api/products/:id/reviews
router.post("/:id/reviews", authenticateCustomer, async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.id });
    if (!product) return res.status(404).json({ message: "Product not found" });

    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ message: "Rating must be between 1 and 5" });
    if (!comment || !comment.trim()) return res.status(400).json({ message: "Comment is required" });

    const review = new Review({
      product_id: product._id,
      product_slug: product.slug,
      customer_id: req.customer._id,
      customer_name: req.customer.name,
      rating: Number(rating),
      comment: comment.trim(),
      status: 'approved' // Auto-approve for MVP
    });

    await review.save();

    // Update product rating average
    const allReviews = await Review.find({ product_id: product._id, status: 'approved' });
    const newAverage = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    
    product.reviews = allReviews.length;
    product.rating = Math.round(newAverage * 10) / 10;
    await product.save();

    res.status(201).json({ message: "Review added successfully", review });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

function generateSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

// POST /api/products (Admin Only)
router.post("/", authenticateAdmin, async (req, res) => {
  const data = req.body;
  
  try {
    const slug = data.slug || generateSlug(data.name);
    
    const existing = await Product.findOne({ slug });
    if (existing) {
      return res.status(400).json({ message: "Product with this slug already exists" });
    }

    const newProduct = new Product({
      slug,
      name: data.name || '',
      subcategory: data.subcategory || '',
      price: data.price || 0,
      compare_at_price: data.compareAtPrice || null,
      image: data.image || '',
      images_json: JSON.stringify(data.images || [data.image || '']),
      tag: data.tag || '',
      colors_json: JSON.stringify(data.colors || []),
      sizes_json: JSON.stringify(data.sizes || []),
      description: data.description || '',
      material: data.material || '',
      fit: data.fit || '',
      care: data.care || '',
      rating: data.rating || 0,
      reviews: data.reviews || 0,
      stock: data.stock || 0,
      tags_json: JSON.stringify(data.tags || []),
      category: data.category ? data.category.toLowerCase() : 'men',
      is_new_arrival: data.isNewArrival ? 1 : 0,
      new_arrival: data.newArrival ? 1 : 0,
      featured: data.featured ? 1 : 0,
      best_seller: data.bestSeller ? 1 : 0,
      trending: data.trending ? 1 : 0,
      sort_order: data.sortOrder || 0
    });

    await newProduct.save();
    res.status(201).json(serializeProduct(newProduct));
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({ message: "Failed to create product" });
  }
});

// PUT /api/products/:id (Admin Only)
router.put("/:id", authenticateAdmin, async (req, res) => {
  const data = req.body;
  const slug = req.params.id;
  
  try {
    const existing = await Product.findOne({ slug });
    if (!existing) {
      return res.status(404).json({ message: "Product not found" });
    }

    const updateData = {
      name: data.name !== undefined ? data.name : existing.name,
      subcategory: data.subcategory !== undefined ? data.subcategory : existing.subcategory,
      price: data.price !== undefined ? data.price : existing.price,
      compare_at_price: data.compareAtPrice !== undefined ? data.compareAtPrice : existing.compare_at_price,
      image: data.image !== undefined ? data.image : existing.image,
      images_json: data.images !== undefined ? JSON.stringify(data.images) : existing.images_json,
      tag: data.tag !== undefined ? data.tag : existing.tag,
      colors_json: data.colors !== undefined ? JSON.stringify(data.colors) : existing.colors_json,
      sizes_json: data.sizes !== undefined ? JSON.stringify(data.sizes) : existing.sizes_json,
      description: data.description !== undefined ? data.description : existing.description,
      material: data.material !== undefined ? data.material : existing.material,
      fit: data.fit !== undefined ? data.fit : existing.fit,
      care: data.care !== undefined ? data.care : existing.care,
      rating: data.rating !== undefined ? data.rating : existing.rating,
      reviews: data.reviews !== undefined ? data.reviews : existing.reviews,
      stock: data.stock !== undefined ? data.stock : existing.stock,
      tags_json: data.tags !== undefined ? JSON.stringify(data.tags) : existing.tags_json,
      category: data.category !== undefined ? data.category.toLowerCase() : existing.category,
      is_new_arrival: data.isNewArrival !== undefined ? (data.isNewArrival ? 1 : 0) : existing.is_new_arrival,
      new_arrival: data.newArrival !== undefined ? (data.newArrival ? 1 : 0) : existing.new_arrival,
      featured: data.featured !== undefined ? (data.featured ? 1 : 0) : existing.featured,
      best_seller: data.bestSeller !== undefined ? (data.bestSeller ? 1 : 0) : existing.best_seller,
      trending: data.trending !== undefined ? (data.trending ? 1 : 0) : existing.trending,
      sort_order: data.sortOrder !== undefined ? data.sortOrder : existing.sort_order
    };

    const updatedProduct = await Product.findOneAndUpdate({ slug }, updateData, { new: true });
    res.json(serializeProduct(updatedProduct));
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ message: "Failed to update product" });
  }
});

// DELETE /api/products/:id (Admin Only)
router.delete("/:id", authenticateAdmin, async (req, res) => {
  const slug = req.params.id;
  
  try {
    const existing = await Product.findOne({ slug });
    if (!existing) {
      return res.status(404).json({ message: "Product not found" });
    }

    await Product.deleteOne({ slug });
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ message: "Failed to delete product" });
  }
});

export default router;
