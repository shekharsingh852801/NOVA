import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import Database from "better-sqlite3";
import { Product } from "../models/Product.js";
import { Admin } from "../models/Admin.js";
import { Order } from "../models/Order.js";
import { Subscriber } from "../models/Subscriber.js";
import { SupportRequest } from "../models/SupportRequest.js";
import { Testimonial } from "../models/Testimonial.js";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_DATABASE_PATH = fileURLToPath(new URL("../data/nova.sqlite", import.meta.url));

async function migrate() {
  console.log("Connecting to SQLite...");
  const db = new Database(resolve(DEFAULT_DATABASE_PATH));

  console.log("Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("MongoDB connected.");

  // Clean MongoDB database before migration
  console.log("Clearing MongoDB data...");
  await Promise.all([
    Product.deleteMany({}),
    Admin.deleteMany({}),
    Order.deleteMany({}),
    Subscriber.deleteMany({}),
    SupportRequest.deleteMany({}),
    Testimonial.deleteMany({})
  ]);

  console.log("Migrating Products...");
  const products = db.prepare("SELECT * FROM products").all();
  await Product.insertMany(products);

  console.log("Migrating Admins...");
  const admins = db.prepare("SELECT * FROM admins").all();
  await Admin.insertMany(admins);

  console.log("Migrating Orders...");
  const orders = db.prepare("SELECT * FROM orders").all();
  await Order.insertMany(orders);

  console.log("Migrating Subscribers...");
  const subscribers = db.prepare("SELECT * FROM subscribers").all();
  await Subscriber.insertMany(subscribers);

  console.log("Migrating SupportRequests...");
  const supportRequests = db.prepare("SELECT * FROM support_requests").all();
  await SupportRequest.insertMany(supportRequests);

  console.log("Migrating Testimonials...");
  const testimonials = db.prepare("SELECT * FROM testimonials").all();
  await Testimonial.insertMany(testimonials);

  console.log("Migration completed successfully!");
  process.exit(0);
}

migrate().catch(error => {
  console.error("Migration failed:", error);
  process.exit(1);
});
