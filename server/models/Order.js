import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  order_number: { type: String, required: true, unique: true },
  customer_name: { type: String, required: true },
  customer_email: { type: String, required: true },
  customer_phone: { type: String, required: true },
  shipping_address: { type: String, required: true },
  shipping_city: { type: String, required: true },
  shipping_state: { type: String, required: true },
  shipping_postal: { type: String, required: true },
  items_json: { type: String, required: true },
  subtotal: { type: Number, required: true, min: 0 },
  shipping: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true, min: 0 },
  payment_method: { type: String, required: true, enum: ['cash_on_delivery', 'pay_on_delivery'] },
  payment_status: { type: String, required: true, default: 'pending', enum: ['pending', 'paid', 'refunded'] },
  status: { type: String, required: true, default: 'confirmed', enum: ['confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'] },
  progress: { type: Number, required: true, default: 2, min: 1, max: 6 },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: false }
});

orderSchema.index({ order_number: 1, customer_email: 1 });

export const Order = mongoose.model("Order", orderSchema);
