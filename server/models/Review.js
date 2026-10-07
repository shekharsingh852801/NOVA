import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  product_slug: { type: String, required: true },
  customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  customer_name: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' } // Default to approved for immediate feedback for MVP
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

export const Review = mongoose.model("Review", reviewSchema);
