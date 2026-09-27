import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, required: true },
    tag: { type: String, enum: ["Bestseller", "New", "Trending", null], default: null },
    colors: { type: [String], default: [] },
    category: {
      type: String,
      enum: ["men", "women", "accessories", "sale"],
      required: true,
    },
    isNewArrival: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
