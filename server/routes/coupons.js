import { Router } from "express";
import { z } from "zod";
import { Coupon } from "../models/Coupon.js";
import { authenticateAdmin } from "../middleware/auth.js";

const router = Router();

export function computeDiscount(coupon, subtotal, shipping) {
  if (coupon.type === "percent") {
    return Math.round(((subtotal * coupon.value) / 100) * 100) / 100;
  }
  if (coupon.type === "fixed") {
    return Math.min(coupon.value, subtotal);
  }
  // free_shipping: discount equals the shipping cost
  return shipping;
}

export async function resolveCoupon(code, subtotal, shipping) {
  const normalized = String(code || "").trim().toUpperCase();
  if (!normalized) {
    throw Object.assign(new Error("Please enter a coupon code."), { status: 400 });
  }
  const coupon = await Coupon.findOne({ code: normalized });
  if (!coupon || !coupon.is_active) {
    throw Object.assign(new Error("This coupon code is not valid."), { status: 404 });
  }
  const now = new Date();
  if (coupon.active_from && now < coupon.active_from) {
    throw Object.assign(new Error("This coupon is not active yet."), { status: 409 });
  }
  if (coupon.active_until && now > coupon.active_until) {
    throw Object.assign(new Error("This coupon has expired."), { status: 409 });
  }
  if (coupon.max_uses > 0 && coupon.used_count >= coupon.max_uses) {
    throw Object.assign(new Error("This coupon has reached its usage limit."), { status: 409 });
  }
  if (subtotal < coupon.min_order) {
    throw Object.assign(new Error(`This coupon requires a minimum order of $${coupon.min_order}.`), { status: 409 });
  }
  const discount = computeDiscount(coupon, subtotal, shipping);
  return {
    coupon,
    result: {
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discount,
      freeShipping: coupon.type === "free_shipping",
    },
  };
}

const couponBodySchema = z.object({
  code: z.string().trim().min(2).max(24),
  description: z.string().trim().max(160).optional(),
  type: z.enum(["percent", "fixed", "free_shipping"]),
  value: z.number().min(0),
  min_order: z.number().min(0).optional(),
  max_uses: z.number().min(0).optional(),
  active_from: z.string().datetime().optional().nullable(),
  active_until: z.string().datetime().optional().nullable(),
  is_active: z.boolean().optional(),
});

// Public: validate a coupon against a cart
router.post("/validate", async (req, res, next) => {
  try {
    const body = z.object({
      code: z.string().trim().min(1),
      subtotal: z.number().min(0),
      shipping: z.number().min(0),
    }).parse(req.body);
    const { result } = await resolveCoupon(body.code, body.subtotal, body.shipping);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Admin: list coupons
router.get("/", authenticateAdmin, async (_req, res, next) => {
  try {
    const coupons = await Coupon.find().sort({ created_at: -1 }).lean();
    res.json(coupons);
  } catch (err) {
    next(err);
  }
});

// Admin: create coupon
router.post("/", authenticateAdmin, async (req, res, next) => {
  try {
    const body = couponBodySchema.parse(req.body);
    const existing = await Coupon.findOne({ code: body.code.toUpperCase() });
    if (existing) {
      throw Object.assign(new Error("A coupon with this code already exists."), { status: 409 });
    }
    const coupon = await Coupon.create({
      ...body,
      code: body.code.toUpperCase(),
      min_order: body.min_order ?? 0,
      max_uses: body.max_uses ?? 0,
      active_from: body.active_from || null,
      active_until: body.active_until || null,
    });
    res.status(201).json(coupon);
  } catch (err) {
    next(err);
  }
});

// Admin: update coupon
router.patch("/:id", authenticateAdmin, async (req, res, next) => {
  try {
    const body = couponBodySchema.partial().parse(req.body);
    if (body.code) body.code = body.code.toUpperCase();
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true });
    if (!coupon) {
      throw Object.assign(new Error("Coupon not found."), { status: 404 });
    }
    res.json(coupon);
  } catch (err) {
    next(err);
  }
});

// Admin: delete coupon
router.delete("/:id", authenticateAdmin, async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      throw Object.assign(new Error("Coupon not found."), { status: 404 });
    }
    res.json({ message: "Coupon deleted" });
  } catch (err) {
    next(err);
  }
});

export default router;
