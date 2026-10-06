import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  role: { type: String, required: true, default: 'admin', enum: ['admin', 'superadmin'] },
  last_login: { type: String }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: false }
});

export const Admin = mongoose.model("Admin", adminSchema);
