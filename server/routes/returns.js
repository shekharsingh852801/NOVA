import { Router } from "express";
import mongoose from "mongoose";
import { authenticateAdmin } from "../middleware/auth.js";
import { authenticateCustomer } from "../middleware/customerAuth.js";
import { Customer } from "../models/Customer.js";
import { Order } from "../models/Order.js";
import { ReturnRequest } from "../models/ReturnRequest.js";

const router = Router();
const RETURN_REASONS = new Set(["damaged", "wrong_item", "quality_issue", "changed_mind", "other"]);
const RETURN_STATUSES = new Set(["requested", "approved", "rejected", "received", "refunded"]);

function invalid(message) {
  return Object.assign(new Error(message), { status: 400 });
}

function conflict(message) {
  return Object.assign(new Error(message), { status: 409 });
}

router.post("/", authenticateCustomer, async (req, res, next) => {
  const orderId = typeof req.body?.orderId === "string" ? req.body.orderId : "";
  const reason = typeof req.body?.reason === "string" ? req.body.reason : "";
  if (req.body?.details !== undefined && typeof req.body.details !== "string") {
    return res.status(400).json({ message: "Return details must be text" });
  }
  const details = typeof req.body?.details === "string" ? req.body.details.trim() : "";

  if (!mongoose.isValidObjectId(orderId)) return res.status(400).json({ message: "A valid order is required" });
  if (!RETURN_REASONS.has(reason)) return res.status(400).json({ message: "Choose a valid return reason" });
  if (details.length > 1000) return res.status(400).json({ message: "Return details must be 1000 characters or fewer" });

  try {
    const customer = await Customer.findById(req.customer.id).select("name email").lean();
    if (!customer) return res.status(404).json({ message: "Customer account not found" });

    const order = await Order.findById(orderId).lean();
    if (!order || order.customer_email.toLowerCase() !== customer.email.toLowerCase()) {
      return res.status(404).json({ message: "Order not found for this customer" });
    }
    if (order.status !== "delivered") {
      return res.status(400).json({ message: "A return can only be requested for a delivered order" });
    }

    const existing = await ReturnRequest.findOne({ order: order._id }).lean();
    if (existing) return res.status(409).json({ message: "A return request already exists for this order" });

    const returnRequest = await ReturnRequest.create({
      order: order._id,
      order_number: order.order_number,
      customer_email: customer.email,
      customer_name: customer.name || order.customer_name,
      reason,
      details,
    });
    res.status(201).json(returnRequest);
  } catch (error) {
    if (error.code === 11000) return next(conflict("A return request already exists for this order"));
    return next(error);
  }
});

router.get("/mine", authenticateCustomer, async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.customer.id).select("email").lean();
    if (!customer) return res.status(404).json({ message: "Customer account not found" });
    const requests = await ReturnRequest.find({ customer_email: customer.email.toLowerCase() })
      .sort({ requested_at: -1 })
      .lean();
    res.json(requests.map((request) => ({ ...request, order_id: String(request.order) })));
  } catch (error) {
    return next(error);
  }
});

router.get("/admin", authenticateAdmin, async (req, res, next) => {
  const status = typeof req.query.status === "string" ? req.query.status : "";
  if (status && !RETURN_STATUSES.has(status)) {
    return res.status(400).json({ message: "Invalid return request status" });
  }
  const pageValue = req.query.page === undefined ? "1" : req.query.page;
  const limitValue = req.query.limit === undefined ? "50" : req.query.limit;
  const page = Number(pageValue);
  const limit = Number(limitValue);
  if (!Number.isInteger(page) || !Number.isInteger(limit) || page < 1 || limit < 1 || limit > 100) {
    return res.status(400).json({ message: "Invalid return request pagination" });
  }

  try {
    const query = status ? { status } : {};
    const [requests, total] = await Promise.all([
      ReturnRequest.find(query)
      .sort({ requested_at: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("order", "order_number total status payment_status payment_method")
      .lean(),
      ReturnRequest.countDocuments(query),
    ]);
    res.json({
      requests: requests.map((request) => ({
        ...request,
        order_id: request.order?._id ? String(request.order._id) : String(request.order),
      })),
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    return next(error);
  }
});

router.patch("/admin/:id", authenticateAdmin, async (req, res, next) => {
  const { status, admin_note: adminNote, refund_reference: refundReference } = req.body || {};
  if (!RETURN_STATUSES.has(status)) return res.status(400).json({ message: "Choose a valid return request status" });
  if (adminNote !== undefined && (typeof adminNote !== "string" || adminNote.trim().length > 1000)) {
    return res.status(400).json({ message: "Admin note must be 1000 characters or fewer" });
  }
  if (refundReference !== undefined && (typeof refundReference !== "string" || refundReference.trim().length > 120)) {
    return res.status(400).json({ message: "Refund reference must be 120 characters or fewer" });
  }
  if (status === "refunded" && !refundReference?.trim()) {
    return res.status(400).json({ message: "Enter the external refund reference before recording a refund" });
  }
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid return request" });
  }

  try {
    const request = await ReturnRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Return request not found" });

    const allowedTransitions = {
      requested: ["approved", "rejected"],
      approved: ["received"],
      received: ["refunded"],
      rejected: [],
      refunded: [],
    };
    if (!allowedTransitions[request.status].includes(status)) {
      return res.status(409).json({ message: `Cannot move a ${request.status} request to ${status}` });
    }

    const update = { status };
    if (adminNote !== undefined) update.admin_note = adminNote.trim();
    if (status === "approved" || status === "rejected") {
      update.reviewed_at = new Date();
      update.reviewed_by = req.admin.id;
    }
    if (status === "refunded") {
      update.refund_reference = refundReference.trim();
      update.refunded_at = new Date();
    }

    const updated = await ReturnRequest.findOneAndUpdate(
      { _id: request._id, status: request.status },
      { $set: update },
      { new: true, runValidators: true }
    );
    if (!updated) return next(conflict("This return request was updated by another admin. Refresh and try again."));
    res.json(updated);
  } catch (error) {
    return next(error);
  }
});

export default router;
