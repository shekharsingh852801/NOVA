import { Router } from "express";
import { getDB } from "../config/db.js";

const router = Router();

// POST /api/newsletter/subscribe  { email, source }
router.post("/subscribe", (req, res, next) => {
  const { email, source } = req.body || {};
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

  if (!normalizedEmail) {
    return res.status(400).json({ message: "Email is required" });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return res.status(400).json({ message: "Please enter a valid email address" });
  }
  const normalizedSource = source || "newsletter-section";
  if (!["hero", "newsletter-section", "footer"].includes(normalizedSource)) {
    return res.status(400).json({ message: "Please check your subscription details" });
  }

  try {
    const result = getDB().prepare("INSERT INTO subscribers(email, source) VALUES (?, ?) ON CONFLICT(email) DO NOTHING")
      .run(normalizedEmail, normalizedSource);
    if (result.changes === 0) {
      return res.status(200).json({ message: "You're already subscribed — welcome back!" });
    }

    const subscriber = getDB().prepare("SELECT email, created_at FROM subscribers WHERE email = ?").get(normalizedEmail);
    res.status(201).json({
      message: "Subscribed! Watch your inbox for new drops.",
      subscriber: { email: subscriber.email, createdAt: subscriber.created_at },
    });
  } catch (err) {
    return next(err);
  }
});

export default router;
