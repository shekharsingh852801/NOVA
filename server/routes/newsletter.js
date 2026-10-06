import { Router } from "express";
import { Subscriber } from "../models/Subscriber.js";

const router = Router();

// POST /api/newsletter/subscribe  { email, source }
router.post("/subscribe", async (req, res, next) => {
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
    const existing = await Subscriber.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(200).json({ message: "You're already subscribed — welcome back!" });
    }

    const newSubscriber = new Subscriber({
      email: normalizedEmail,
      source: normalizedSource
    });
    await newSubscriber.save();

    res.status(201).json({
      message: "Subscribed! Watch your inbox for new drops.",
      subscriber: { email: newSubscriber.email, createdAt: newSubscriber.created_at },
    });
  } catch (err) {
    return next(err);
  }
});

export default router;
