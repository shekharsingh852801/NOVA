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

import { z } from "zod";

const orderSchema = z.object({
  customer: z.object({
    name: z.string().trim().min(1, "Customer name is required"),
    email: z.string().trim().email("A valid customer email is required"),
    phone: z.string().trim().min(1, "Customer phone is required"),
  }),
  shippingAddress: z.object({
    address: z.string().trim().min(1, "Address is required"),
    city: z.string().trim().min(1, "City is required"),
    state: z.string().trim().min(1, "State is required"),
    postal: z.string().trim().min(1, "Postal code is required"),
  }),
  paymentMethod: z.enum(["cash_on_delivery", "pay_on_delivery"], {
    errorMap: () => ({ message: "Unsupported payment method" })
  }),
  items: z.array(z.object({
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid product selection"),
    size: z.string().trim().min(1, "Size is required"),
    color: z.string().trim().min(1, "Color is required"),
    quantity: z.number().int().min(1).max(10, "Item quantity must be between 1 and 10"),
  })).min(1, "Order must contain at least 1 item").max(20, "Order must contain no more than 20 items"),
});

// Admin Analytics Overview
router.get("/overview", authenticateAdmin, async (req, res, next) => {
  try {
    const totalOrders = await Order.countDocuments();
    
    const revenueResult = await Order.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: "$total" } } }
    ]);
    
    const statusCountsResult = await Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    const orderStatusCounts = statusCountsResult.map(c => ({ name: c._id || "Confirmed", value: c.count }));

    const recentOrders = await Order.find().sort({ created_at: -1 }).limit(10);
    const totalProducts = await Product.countDocuments();

    const lowStockProducts = await Product.find({ stock: { $lt: 10 } })
      .limit(5)
      .select('name stock _id slug');

    res.json({
      totalOrders,
      totalRevenue: revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0,
      recentOrders,
      totalProducts,
      orderStatusCounts,
      lowStockProducts
    });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  const result = orderSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ message: result.error.errors[0].message });
  }
  const body = result.data; // Zod validates and strips/normalizes the body based on schema!

  const orderNumber = `NV-${randomUUID().replaceAll("-", "").slice(0, 8).toUpperCase()}`;
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
        throw Object.assign(new Error(`${product.name} no longer has enough stock`), { status: 409 });
      }

      const updatedProduct = await Product.findOneAndUpdate(
        { _id: product._id, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { session, new: true }
      );

      if (!updatedProduct) {
        throw Object.assign(new Error(`${product.name} no longer has enough stock`), { status: 409 });
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

    // Send confirmation email asynchronously
    import("../utils/email.js")
      .then(({ sendOrderConfirmation }) => sendOrderConfirmation(newOrder, body.customer, lines))
      .catch(console.error);
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    
    const rows = await Order.find().sort({ created_at: -1 }).skip(skip).limit(limit).lean();
    const total = await Order.countDocuments();
    
    const orders = rows.map(row => ({
      ...row,
      id: row._id,
      items: JSON.parse(row.items_json),
      items_json: undefined
    }));
    // Return array with X-Total-Count header to preserve backwards compatibility
    // with current admin UI while still enforcing a limit.
    res.set("X-Total-Count", total);
    res.set("Access-Control-Expose-Headers", "X-Total-Count");
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