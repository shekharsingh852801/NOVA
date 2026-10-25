import dotenv from "dotenv";
import { closeDB, connectDB } from "../config/db.js";
import { seedDatabase } from "./seedDatabase.js";
import { Coupon } from "../models/Coupon.js";

dotenv.config();

const DEFAULT_COUPONS = [
  {
    code: "WELCOME15",
    description: "15% off your first order",
    type: "percent",
    value: 15,
    min_order: 0,
    max_uses: 0,
    is_active: true,
  },
  {
    code: "FREESHIP",
    description: "Free shipping on any order",
    type: "free_shipping",
    value: 0,
    min_order: 0,
    max_uses: 0,
    is_active: true,
  },
];

async function seedCoupons() {
  for (const coupon of DEFAULT_COUPONS) {
    await Coupon.updateOne({ code: coupon.code }, { $setOnInsert: coupon }, { upsert: true });
  }
  return Coupon.countDocuments();
}

async function run() {
  await connectDB();
  const result = await seedDatabase({ reset: process.argv.includes("--reset") });
  const coupons = await seedCoupons();
  console.log(`MongoDB seed complete: ${result.products} products, ${result.testimonials} testimonials, ${coupons} coupons.`);
  await closeDB();
}

run().catch(async (err) => {
  console.error("Seeding failed:", err);
  await closeDB();
  process.exit(1);
});
