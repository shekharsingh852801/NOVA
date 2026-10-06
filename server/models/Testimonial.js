import mongoose from "mongoose";

const testimonialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  avatar: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  verified: { type: Number, required: true, default: 0, enum: [0, 1] },
  quote: { type: String, required: true },
  posted_at: { type: String, required: true },
  sort_order: { type: Number, required: true, default: 0 }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: false }
});

export const Testimonial = mongoose.model("Testimonial", testimonialSchema);
