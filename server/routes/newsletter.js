import { Router } from "express";
import Subscriber from "../models/Subscriber.js";

const router = Router();

// POST /api/newsletter/subscribe  { email, source }
router.post("/subscribe", async (req, res) => {
  const { email, source } = req.body || {};

  if (!email || typeof email !== "string") {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const existing = await Subscriber.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(200).json({ message: "You're already subscribed — welcome back!" });
    }

    const subscriber = await Subscriber.create({ email, source });
    res.status(201).json({
      message: "Subscribed! Watch your inbox for new drops.",
      subscriber: { email: subscriber.email, createdAt: subscriber.createdAt },
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }
    res.status(500).json({ message: "Something went wrong. Please try again.", error: err.message });
  }
});

export default router;
