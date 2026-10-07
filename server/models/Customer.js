import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  phone: { type: String },
  addresses: [{
    street: String,
    city: String,
    state: String,
    postal: String,
    country: String,
    is_default: Boolean
  }],
  cart: [{
    product_slug: String,
    quantity: Number,
    size: String,
    color: String
  }],
  last_login: { type: String },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

export const Customer = mongoose.model("Customer", customerSchema);
