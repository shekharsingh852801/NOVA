import dotenv from "dotenv";
import { closeDB, connectDB } from "../config/db.js";
import { seedDatabase } from "./seedDatabase.js";

dotenv.config();

async function run() {
  await connectDB();
  const result = await seedDatabase({ reset: process.argv.includes("--reset") });
  console.log(`MongoDB seed complete: ${result.products} products and ${result.testimonials} testimonials.`);
  await closeDB();
}

run().catch(async (err) => {
  console.error("Seeding failed:", err);
  await closeDB();
  process.exit(1);
});
