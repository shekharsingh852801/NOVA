import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Product from "../models/Product.js";
import Testimonial from "../models/Testimonial.js";
import { products, testimonials } from "./seedData.js";

dotenv.config();

async function run() {
  await connectDB();

  await Product.deleteMany({});
  await Testimonial.deleteMany({});

  await Product.insertMany(products);
  await Testimonial.insertMany(testimonials);

  console.log(`Seeded ${products.length} products and ${testimonials.length} testimonials.`);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
