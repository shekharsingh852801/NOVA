import { randomUUID } from "node:crypto";
import { Router } from "express";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { authenticateAdmin } from "../middleware/auth.js";
import mongoose from "mongoose";

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

router.post("/", async (req, res, next) => {
  const validationError = validateOrderPayload(req.body);
  if (validationError) return res.status(400).json({ message: validationError });

  const orderNumber = `NV-${randomUUID().replaceAll("-", "").slice(0, 8).toUpperCase()}`;
  const body = req.body;
  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    const lines = [];
    let subtotal = 0;

    for (const item of body.items) {
      const product = await Product.findOne({ slug: item.slug }).session(session);
      if (!product) throw Object.assign(new Error("A selected product is no longer available"), { status: 404 });
      
      const colors = JSON.parse(product.colors_json);
      const sizes = JSON.parse(product.sizes_json);
      const colorAvailable = colors.some((color) => (typeof color === "string" ? color : color.name) === item.color);
      if (!sizes.includes(item.size) || !colorAvailable) {
        throw invalid(`${product.name} does not have that size and colour combination`);
      }

      if (product.stock < item.quantity) {
        throw conflict(`${product.name} no longer has enough stock`);
      }

      product.stock -= item.quantity;
      await product.save({ session });

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
    const total = Math.round((subtotal + shipping) * 100) / 100;

    const newOrder = new Order({
      order_number: orderNumber,
      customer_name: body.customer.name.trim(),
      customer_email: body.customer.email.trim().toLowerCase(),
      customer_phone: body.customer.phone.trim(),
      shipping_address: body.shippingAddress.address.trim(),
      shipping_city: body.shippingAddress.city.trim(),
      shipping_state: body.shippingAddress.state.trim(),
      shipping_postal: body.shippingAddress.postal.trim(),
      items_json: JSON.stringify(lines),
      subtotal,
      shipping,
      total,
      payment_method: body.paymentMethod
    });

    await newOrder.save({ session });
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      order: {
        orderNumber: newOrder.order_number,
        status: newOrder.status,
        progress: newOrder.progress,
        total: newOrder.total,
        createdAt: newOrder.created_at,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return next(error);
  }
});

router.post("/track", async (req, res, next) => {
  const orderNumber = typeof req.body?.orderNumber === "string" ? req.body.orderNumber.trim().toUpperCase() : "";
  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  if (!/^NV-[A-F0-9]{8}$/.test(orderNumber) || !EMAIL_RE.test(email)) {
    return res.status(400).json({ message: "Enter a valid order number and checkout email" });
  }

  try {
    const row = await Order.findOne({ order_number: orderNumber, customer_email: email });
    if (!row) return res.status(404).json({ message: "We couldn't find an order with those details" });
    res.json({ order: { orderNumber: row.order_number, status: row.status, progress: row.progress, total: row.total, createdAt: row.created_at } });
  } catch (error) { return next(error); }
});

// Admin: Get all orders
router.get("/", authenticateAdmin, async (req, res, next) => {
  try {
    const rows = await Order.find().sort({ created_at: -1 }).lean();
    const orders = rows.map(row => ({
      ...row,
      id: row._id,
      items: JSON.parse(row.items_json),
      items_json: undefined
    }));
    res.json(orders);
  } catch (error) {
    return next(error);
  }
});

// Admin: Get single order
router.get("/:id", authenticateAdmin, async (req, res, next) => {
  try {
    const row = await Order.findById(req.params.id).lean();
    if (!row) return res.status(404).json({ message: "Order not found" });
    const order = {
      ...row,
      id: row._id,
      items: JSON.parse(row.items_json),
      items_json: undefined
    };
    res.json(order);
  } catch (error) {
    return next(error);
  }
});

// Admin: Update order status
router.patch("/:id/status", authenticateAdmin, async (req, res, next) => {
  try {
    const { status, payment_status } = req.body;
    
    const progressMap = {
      'confirmed': 2,
      'packed': 3,
      'shipped': 4,
      'out_for_delivery': 5,
      'delivered': 6,
      'cancelled': 1
    };

    let updateData = {};
    if (status && progressMap[status]) {
      updateData.status = status;
      updateData.progress = progressMap[status];
    }
    if (payment_status) {
      updateData.payment_status = payment_status;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    const updated = await Order.findByIdAndUpdate(req.params.id, updateData, { new: true }).lean();
    if (!updated) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({
      ...updated,
      id: updated._id,
      items: JSON.parse(updated.items_json),
      items_json: undefined
    });
  } catch (error) {
    return next(error);
  }
});

export default router;