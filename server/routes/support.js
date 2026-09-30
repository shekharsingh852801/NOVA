import { Router } from "express";
import { getDB } from "../config/db.js";

const router = Router();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post("/contact", (req, res, next) => {
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
    const result = getDB().prepare(`
      INSERT INTO support_requests (kind, name, email, topic, message)
      VALUES ('contact', ?, ?, ?, ?)
    `).run(name.trim(), email.trim().toLowerCase(), topic.trim(), message.trim());
    res.status(201).json({ requestId: String(result.lastInsertRowid), message: "Your message has been received" });
  } catch (error) { next(error); }
});

router.post("/back-in-stock", (req, res, next) => {
  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const productSlug = typeof req.body?.productSlug === "string" ? req.body.productSlug.trim().toLowerCase() : "";
  if (!EMAIL_RE.test(email)) return res.status(400).json({ message: "A valid email address is required" });
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(productSlug)) return res.status(400).json({ message: "A valid product is required" });

  try {
    const db = getDB();
    const product = db.prepare("SELECT name, stock FROM products WHERE slug = ?").get(productSlug);
    if (!product) return res.status(404).json({ message: "Product not found" });
    if (product.stock > 0) return res.status(409).json({ message: "This product is currently available" });

    const existing = db.prepare("SELECT id FROM support_requests WHERE kind = 'back-in-stock' AND email = ? AND product_slug = ?")
      .get(email, productSlug);
    if (existing) return res.json({ message: "You're already on the notification list" });

    try {
      db.prepare(`
        INSERT INTO support_requests (kind, email, product_slug, product_name)
        VALUES ('back-in-stock', ?, ?, ?)
      `).run(email, productSlug, product.name);
    } catch (error) {
      if (error.code === "SQLITE_CONSTRAINT_UNIQUE") return res.json({ message: "You're already on the notification list" });
      throw error;
    }
    res.status(201).json({ message: "Your back-in-stock request has been saved" });
  } catch (error) {
    next(error);
  }
});

export default router;