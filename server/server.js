import dotenv from "dotenv";
import { closeDB, connectDB } from "./config/db.js";
import { createApp } from "./app.js";

dotenv.config();

const PORT = process.env.PORT || 5001;
const app = createApp();

async function startServer() {
  await connectDB();
  const server = app.listen(PORT, () => {
    console.log(`NOVA API running on http://localhost:${PORT}`);
  });

  let isShuttingDown = false;
  const shutdown = (signal) => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    console.log(`${signal} received; shutting down NOVA API`);
    server.close(async (error) => {
      if (error) console.error("HTTP server shutdown failed:", error.message);
      closeDB();
      process.exitCode = error ? 1 : 0;
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

startServer().catch((error) => {
  console.error("NOVA API startup failed:", error.message);
  process.exitCode = 1;
});
