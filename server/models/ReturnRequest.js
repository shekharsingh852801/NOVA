import mongoose from "mongoose";

const returnRequestSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true, unique: true },
  order_number: { type: String, required: true, index: true },
  customer_email: { type: String, required: true, lowercase: true, index: true },
  customer_name: { type: String, required: true },
  reason: {
    type: String,
    required: true,
    enum: ["damaged", "wrong_item", "quality_issue", "changed_mind", "other"],
  },
  details: { type: String, default: "", maxlength: 1000 },
  status: {
    type: String,
    required: true,
    default: "requested",
    enum: ["requested", "approved", "rejected", "received", "refunded"],
    index: true,
  },
  admin_note: { type: String, default: "", maxlength: 1000 },
  reviewed_at: { type: Date },
  reviewed_by: { type: mongoose.Schema.Types.ObjectId },
  refund_reference: { type: String, default: "", maxlength: 120 },
  refunded_at: { type: Date },
}, {
  timestamps: { createdAt: "requested_at", updatedAt: "updated_at" },
});

export const ReturnRequest = mongoose.model("ReturnRequest", returnRequestSchema);
