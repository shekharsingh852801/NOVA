import { Router } from "express";
import { Testimonial } from "../models/Testimonial.js";

const router = Router();

// GET /api/testimonials
router.get("/", async (_req, res) => {
  try {
    const rows = await Testimonial.find().sort({ sort_order: 1, created_at: -1 });
    res.json(rows.map((row) => ({
      _id: String(row._id),
      name: row.name,
      avatar: row.avatar,
      rating: row.rating,
      verified: Boolean(row.verified),
      quote: row.quote,
      postedAt: row.posted_at,
      sortOrder: row.sort_order,
      createdAt: row.created_at,
    })));
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
