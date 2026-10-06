import mongoose from "mongoose";

const supportRequestSchema = new mongoose.Schema({
  kind: { type: String, required: true, enum: ['contact', 'back-in-stock'] },
  name: { type: String },
  email: { type: String, required: true },
  topic: { type: String },
  message: { type: String },
  product_slug: { type: String },
  product_name: { type: String },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: false }
});

supportRequestSchema.index({ kind: 1, email: 1, product_slug: 1 }, { unique: true, partialFilterExpression: { kind: 'back-in-stock' } });

export const SupportRequest = mongoose.model("SupportRequest", supportRequestSchema);
