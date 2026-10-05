import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getDB } from "../config/db.js";
import { authenticateAdmin } from "../middleware/auth.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "default_jwt_secret_change_in_production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";

// POST /api/auth/login
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Please provide both email and password" });
  }

  try {
    const db = getDB();
    const admin = db.prepare("SELECT * FROM admins WHERE email = ?").get(email);

    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = bcrypt.compareSync(password, admin.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Update last_login
    db.prepare("UPDATE admins SET last_login = CURRENT_TIMESTAMP WHERE id = ?").run(admin.id);

    const payload = {
      id: admin.id,
      role: admin.role,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.json({
      token,
      user: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
});

// GET /api/auth/me
router.get("/me", authenticateAdmin, (req, res) => {
  try {
    const db = getDB();
    const admin = db.prepare("SELECT id, name, email, role, created_at, last_login FROM admins WHERE id = ?").get(req.admin.id);
    
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    
    res.json({ user: admin });
  } catch (error) {
    console.error("Auth me error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
