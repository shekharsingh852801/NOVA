import dotenv from "dotenv";
import { closeDB, connectDB } from "../config/db.js";
import { seedDatabase } from "./seedDatabase.js";

dotenv.config();

async function run() {
  await connectDB();
  const result = seedDatabase({ reset: process.argv.includes("--reset") });
  console.log(`SQLite seed complete: ${result.products} products and ${result.testimonials} testimonials.`);
  closeDB();
}

run().catch((err) => {
  console.error("Seeding failed:", err);
  closeDB();
  process.exit(1);
});
