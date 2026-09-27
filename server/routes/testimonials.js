import { Router } from "express";
import Testimonial from "../models/Testimonial.js";

const router = Router();

// GET /api/testimonials
router.get("/", async (_req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ sortOrder: 1, createdAt: -1 });
    res.json(testimonials);
  } catch (err) {
    res.status(500).json({ message: "Failed to load testimonials", error: err.message });
  }
});

export default router;
