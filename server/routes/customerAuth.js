import express from "express";
import { authenticateCustomer } from "../middleware/customerAuth.js";
import { Order } from "../models/Order.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Customer } from "../models/Customer.js";
import { sendPasswordResetEmail } from "../utils/email.js";
import { randomBytes } from "crypto";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "default_jwt_secret_change_in_production";
const JWT_EXPIRES_IN = "30d";

// POST /api/customer/auth/register
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Please provide all required fields" });
  }

  try {
    const existing = await Customer.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: "An account with this email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const newCustomer = new Customer({
      name,
      email: email.toLowerCase(),
      password_hash
    });

    await newCustomer.save();
    
    const token = jwt.sign({ id: newCustomer._id, role: "customer" }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    
    res.status(201).json({
      token,
      customer: {
        id: newCustomer._id,
        name: newCustomer.name,
        email: newCustomer.email
      }
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
});

// POST /api/customer/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ message: "Please provide both email and password" });
  }

  try {
    const customer = await Customer.findOne({ email: email.toLowerCase() });
    if (!customer) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, customer.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    customer.last_login = new Date().toISOString();
    await customer.save();

    const token = jwt.sign({ id: customer._id, role: "customer" }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.json({
      token,
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        cart: customer.cart || []
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
});

// POST /api/customer/auth/sync-cart
router.post("/sync-cart", authenticateCustomer, async (req, res) => {
  const { cart } = req.body;
  if (!Array.isArray(cart)) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  try {
    const customer = await Customer.findById(req.customer.id);
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    customer.cart = cart;
    await customer.save();
    res.json({ message: "Cart synced successfully" });
  } catch (error) {
    console.error("Cart sync error:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// GET /api/customer/auth/orders
router.get("/orders", authenticateCustomer, async (req, res) => {
  try {
    const customer = await Customer.findById(req.customer.id);
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    const rows = await Order.find({ customer_email: customer.email }).sort({ created_at: -1 }).lean();
    const orders = rows.map(row => ({
      ...row,
      id: row._id,
      items: JSON.parse(row.items_json),
      items_json: undefined
    }));
    
    res.json(orders);
  } catch (error) {
    console.error("Fetch orders error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const customer = await Customer.findOne({ email: email.toLowerCase() });
    if (!customer) {
      return res.status(200).json({ message: "If an account exists, a reset link has been sent." });
    }

    const token = randomBytes(32).toString("hex");
    customer.resetPasswordToken = token;
    customer.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await customer.save();

    const resetLink = `http://${req.get("host").replace("5001", "5173")}/#/reset-password/${token}`;
    await sendPasswordResetEmail(customer, resetLink);

    res.status(200).json({ message: "If an account exists, a reset link has been sent." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ message: "Missing fields" });

    const customer = await Customer.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!customer) {
      return res.status(400).json({ message: "Password reset token is invalid or has expired." });
    }

    const salt = await bcrypt.genSalt(10);
    customer.password_hash = await bcrypt.hash(newPassword, salt);
    customer.resetPasswordToken = undefined;
    customer.resetPasswordExpires = undefined;
    await customer.save();

    res.status(200).json({ message: "Password has been reset successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
