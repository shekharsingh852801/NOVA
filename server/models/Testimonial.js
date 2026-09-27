import mongoose from "mongoose";

const testimonialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    avatar: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    verified: { type: Boolean, default: true },
    quote: { type: String, required: true, trim: true },
    postedAt: { type: String, default: "recently" },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Testimonial", testimonialSchema);
