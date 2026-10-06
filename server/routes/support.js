import { Router } from "express";
import { SupportRequest } from "../models/SupportRequest.js";
import { Product } from "../models/Product.js";

const router = Router();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post("/contact", async (req, res, next) => {
  const { name, email, topic, message } = req.body || {};
  if (typeof name !== "string" || !name.trim() || name.length > 120) {
    return res.status(400).json({ message: "A valid name is required" });
  }
  if (typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
    return res.status(400).json({ message: "A valid email address is required" });
  }
  if (typeof topic !== "string" || !topic.trim() || topic.length > 80) {
    return res.status(400).json({ message: "Choose a contact topic" });
  }
  if (typeof message !== "string" || message.trim().length < 10 || message.length > 3000) {
    return res.status(400).json({ message: "Message must be between 10 and 3000 characters" });
  }

  try {
    const newRequest = new SupportRequest({
      kind: 'contact',
      name: name.trim(),
      email: email.trim().toLowerCase(),
      topic: topic.trim(),
      message: message.trim()
    });
    await newRequest.save();
    res.status(201).json({ requestId: String(newRequest._id), message: "Your message has been received" });
  } catch (error) { next(error); }
});

router.post("/back-in-stock", async (req, res, next) => {
  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const productSlug = typeof req.body?.productSlug === "string" ? req.body.productSlug.trim().toLowerCase() : "";
  if (!EMAIL_RE.test(email)) return res.status(400).json({ message: "A valid email address is required" });
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(productSlug)) return res.status(400).json({ message: "A valid product is required" });

  try {
    const product = await Product.findOne({ slug: productSlug });
    if (!product) return res.status(404).json({ message: "Product not found" });
    if (product.stock > 0) return res.status(409).json({ message: "This product is currently available" });

    const existing = await SupportRequest.findOne({ kind: 'back-in-stock', email, product_slug: productSlug });
    if (existing) return res.json({ message: "You're already on the notification list" });

    try {
      const newRequest = new SupportRequest({
        kind: 'back-in-stock',
        email,
        product_slug: productSlug,
        product_name: product.name
      });
      await newRequest.save();
    } catch (error) {
      if (error.code === 11000) return res.json({ message: "You're already on the notification list" });
      throw error;
    }
    res.status(201).json({ message: "Your back-in-stock request has been saved" });
  } catch (error) {
    next(error);
  }
});

export default router;