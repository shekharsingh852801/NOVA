import bcrypt from "bcryptjs";
import { connectDB, closeDB } from "../config/db.js";
import { Admin } from "../models/Admin.js";
import dotenv from "dotenv";

dotenv.config();

async function seedAdmin() {
  await connectDB();
  
  try {
    const adminEmail = "admin@nova.com";
    const plainPassword = "admin";
    
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log(`Admin ${adminEmail} already exists.`);
      return;
    }
    
    // Hash password
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(plainPassword, salt);
    
    // Insert admin
    const newAdmin = new Admin({
      name: "Super Admin",
      email: adminEmail,
      password_hash: passwordHash,
      role: "superadmin"
    });
    
    await newAdmin.save();
    console.log(`Successfully created admin user: ${adminEmail} / ${plainPassword}`);
  } catch (error) {
    console.error("Error seeding admin:", error);
  } finally {
    await closeDB();
  }
}

seedAdmin();
