import { randomUUID } from "node:crypto";
import { Router } from "express";
import { getDB } from "../config/db.js";

const router = Router();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PAYMENT_METHODS = new Set(["cash_on_delivery", "pay_on_delivery"]);

function invalid(message) {
  return Object.assign(new Error(message), { status: 400 });
}

function conflict(message) {
  return Object.assign(new Error(message), { status: 409 });
}

export function validateOrderPayload(body) {
  const customer = body?.customer;
  const address = body?.shippingAddress;
  if (!customer || typeof customer.name !== "string" || !customer.name.trim()) return "Customer name is required";
  if (typeof customer.email !== "string" || !EMAIL_RE.test(customer.email.trim())) return "A valid customer email is required";
  if (typeof customer.phone !== "string" || !customer.phone.trim()) return "Customer phone is required";
  if (!address || ["address", "city", "state", "postal"].some((field) => typeof address[field] !== "string" || !address[field].trim())) {
    return "A complete shipping address is required";
  }
  if (!Array.isArray(body.items) || body.items.length < 1 || body.items.length > 20) return "Order must contain between 1 and 20 items";
  if (!PAYMENT_METHODS.has(body.paymentMethod)) return "Unsupported payment method";

  for (const item of body.items) {
    if (typeof item.slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.slug)) return "Invalid product selection";
    if (typeof item.size !== "string" || !item.size.trim() || typeof item.color !== "string" || !item.color.trim()) return "Each item requires a size and colour";
    if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 10) return "Item quantity must be between 1 and 10";
  }

  return null;
}

router.post("/", (req, res, next) => {
  const validationError = validateOrderPayload(req.body);
  if (validationError) return res.status(400).json({ message: validationError });

  const db = getDB();
  const orderNumber = `NV-${randomUUID().replaceAll("-", "").slice(0, 8).toUpperCase()}`;
  const createOrder = db.transaction((body) => {
    const getProduct = db.prepare("SELECT * FROM products WHERE slug = ?");
    const reserveStock = db.prepare("UPDATE products SET stock = stock - ?, updated_at = CURRENT_TIMESTAMP WHERE slug = ? AND stock >= ?");
    const lines = [];
    let subtotal = 0;

    for (const item of body.items) {
      const product = getProduct.get(item.slug);
      if (!product) throw Object.assign(new Error("A selected product is no longer available"), { status: 404 });
      const colors = JSON.parse(product.colors_json);
      const sizes = JSON.parse(product.sizes_json);
      const colorAvailable = colors.some((color) => (typeof color === "string" ? color : color.name) === item.color);
      if (!sizes.includes(item.size) || !colorAvailable) {
        throw invalid(`${product.name} does not have that size and colour combination`);
      }

      if (reserveStock.run(item.quantity, product.slug, item.quantity).changes !== 1) {
        throw conflict(`${product.name} no longer has enough stock`);
      }

      const lineTotal = Math.round(product.price * item.quantity * 100) / 100;
      subtotal += lineTotal;
      lines.push({
        slug: product.slug,
        name: product.name,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        unitPrice: product.price,
        lineTotal,
      });
    }

    subtotal = Math.round(subtotal * 100) / 100;
    const shipping = subtotal >= 75 ? 0 : 8;
    db.prepare(`
      INSERT INTO orders (
        order_number, customer_name, customer_email, customer_phone,
        shipping_address, shipping_city, shipping_state, shipping_postal,
        items_json, subtotal, shipping, total, payment_method
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      orderNumber,
      body.customer.name.trim(),
      body.customer.email.trim().toLowerCase(),
      body.customer.phone.trim(),
      body.shippingAddress.address.trim(),
      body.shippingAddress.city.trim(),
      body.shippingAddress.state.trim(),
      body.shippingAddress.postal.trim(),
      JSON.stringify(lines),
      subtotal,
      shipping,
      Math.round((subtotal + shipping) * 100) / 100,
      body.paymentMethod
    );
  });

  try {
    createOrder(req.body);
  } catch (error) {
    return next(error);
  }

  const savedOrder = db.prepare("SELECT order_number, status, progress, total, created_at FROM orders WHERE order_number = ?").get(orderNumber);
  res.status(201).json({
    order: {
      orderNumber: savedOrder.order_number,
      status: savedOrder.status,
      progress: savedOrder.progress,
      total: savedOrder.total,
      createdAt: savedOrder.created_at,
    },
  });
});

router.post("/track", (req, res, next) => {
  const orderNumber = typeof req.body?.orderNumber === "string" ? req.body.orderNumber.trim().toUpperCase() : "";
  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  if (!/^NV-[A-F0-9]{8}$/.test(orderNumber) || !EMAIL_RE.test(email)) {
    return res.status(400).json({ message: "Enter a valid order number and checkout email" });
  }

  try {
    const row = getDB().prepare(`
      SELECT order_number, status, progress, total, created_at
      FROM orders WHERE order_number = ? AND customer_email = ? COLLATE NOCASE
    `).get(orderNumber, email);
    if (!row) return res.status(404).json({ message: "We couldn't find an order with those details" });
    res.json({ order: { orderNumber: row.order_number, status: row.status, progress: row.progress, total: row.total, createdAt: row.created_at } });
  } catch (error) { return next(error); }
});

export default router;