import { Router } from "express";
import Product from "../models/Product.js";

const router = Router();

// GET /api/products?category=men&newArrivals=true
router.get("/", async (req, res) => {
  try {
    const { category, newArrivals } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (newArrivals === "true") filter.isNewArrival = true;

    const products = await Product.find(filter).sort({ sortOrder: 1, createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Failed to load products", error: err.message });
  }
});

// GET /api/products/:id
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: "Invalid product id", error: err.message });
  }
});

export default router;
