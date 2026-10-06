import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  subcategory: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  compare_at_price: { type: Number, min: 0 },
  image: { type: String, required: true },
  images_json: { type: String, required: true },
  tag: { type: String },
  colors_json: { type: String, required: true },
  sizes_json: { type: String, required: true },
  description: { type: String, required: true },
  material: { type: String, required: true },
  fit: { type: String, required: true },
  care: { type: String, required: true },
  rating: { type: Number, required: true, default: 0, min: 0, max: 5 },
  reviews: { type: Number, required: true, default: 0, min: 0 },
  stock: { type: Number, required: true, default: 0, min: 0 },
  tags_json: { type: String, required: true },
  category: { type: String, required: true, enum: ['men', 'women', 'accessories', 'sale'] },
  is_new_arrival: { type: Number, required: true, default: 1, enum: [0, 1] },
  new_arrival: { type: Number, required: true, default: 1, enum: [0, 1] },
  featured: { type: Number, required: true, default: 0, enum: [0, 1] },
  best_seller: { type: Number, required: true, default: 0, enum: [0, 1] },
  trending: { type: Number, required: true, default: 0, enum: [0, 1] },
  sort_order: { type: Number, required: true, default: 0 },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

productSchema.index({ category: 1, sort_order: 1, created_at: -1 });
productSchema.index({ new_arrival: 1, sort_order: 1 });

export const Product = mongoose.model("Product", productSchema);
