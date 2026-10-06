import mongoose from "mongoose";

const subscriberSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  source: { type: String, required: true, default: 'newsletter-section', enum: ['hero', 'newsletter-section', 'footer'] }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: false }
});

export const Subscriber = mongoose.model("Subscriber", subscriberSchema);
