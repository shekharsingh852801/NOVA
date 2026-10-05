import bcrypt from "bcryptjs";
import { connectDB, closeDB } from "../config/db.js";

function seedAdmin() {
  const db = connectDB();
  
  try {
    const adminEmail = "admin@nova.com";
    const plainPassword = "admin";
    
    // Check if admin already exists
    const existingAdmin = db.prepare("SELECT * FROM admins WHERE email = ?").get(adminEmail);
    if (existingAdmin) {
      console.log(`Admin ${adminEmail} already exists.`);
      return;
    }
    
    // Hash password
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(plainPassword, salt);
    
    // Insert admin
    const stmt = db.prepare(`
      INSERT INTO admins (name, email, password_hash, role)
      VALUES (?, ?, ?, ?)
    `);
    
    stmt.run("Super Admin", adminEmail, passwordHash, "superadmin");
    console.log(`Successfully created admin user: ${adminEmail} / ${plainPassword}`);
  } catch (error) {
    console.error("Error seeding admin:", error);
  } finally {
    closeDB();
  }
}

seedAdmin();
