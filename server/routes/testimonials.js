import { Router } from "express";
import { getDB } from "../config/db.js";

const router = Router();

// GET /api/testimonials
router.get("/", (_req, res) => {
  const rows = getDB().prepare("SELECT * FROM testimonials ORDER BY sort_order, created_at DESC").all();
  res.json(rows.map((row) => ({
    _id: String(row.id),
    name: row.name,
    avatar: row.avatar,
    rating: row.rating,
    verified: Boolean(row.verified),
    quote: row.quote,
    postedAt: row.posted_at,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
  })));
});

export default router;
