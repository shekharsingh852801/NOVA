import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  description: { type: String, default: "" },
  type: { type: String, required: true, enum: ["percent", "fixed", "free_shipping"] },
  value: { type: Number, required: true, min: 0, default: 0 },
  min_order: { type: Number, required: true, min: 0, default: 0 },
  max_uses: { type: Number, min: 0, default: 0 },
  used_count: { type: Number, required: true, min: 0, default: 0 },
  active_from: { type: Date, default: null },
  active_until: { type: Date, default: null },
  is_active: { type: Boolean, required: true, default: true },
}, {
  timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
});

export const Coupon = mongoose.model("Coupon", couponSchema);
