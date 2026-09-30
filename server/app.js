import { randomUUID } from "node:crypto";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { isDatabaseReady } from "./config/db.js";
import newsletterRoutes from "./routes/newsletter.js";
import orderRoutes from "./routes/orders.js";
import productRoutes from "./routes/products.js";
import supportRoutes from "./routes/support.js";
import testimonialRoutes from "./routes/testimonials.js";

export function createApp() {
  const app = express();
  const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.disable("x-powered-by");
  app.use((req, res, next) => {
    req.requestId = randomUUID();
    res.setHeader("X-Request-Id", req.requestId);
    next();
  });
  app.use(helmet());
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        const error = new Error("Origin is not allowed");
        error.status = 403;
        callback(error);
      },
    })
  );
  app.use(express.json({ limit: "10kb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "nova-server" });
  });

  app.get("/api/health/ready", (_req, res) => {
    const databaseConnected = isDatabaseReady();
    res.status(databaseConnected ? 200 : 503).json({
      status: databaseConnected ? "ready" : "not_ready",
      database: databaseConnected ? "connected" : "disconnected",
    });
  });

  app.use("/api/products", productRoutes);
  app.use("/api/testimonials", testimonialRoutes);
  app.use(
    "/api/orders",
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 20,
      standardHeaders: "draft-8",
      legacyHeaders: false,
      message: { message: "Too many order requests. Please try again later." },
    }),
    orderRoutes
  );
  app.use(
    "/api/support",
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 8,
      standardHeaders: "draft-8",
      legacyHeaders: false,
      message: { message: "Too many support requests. Please try again later." },
    }),
    supportRoutes
  );
  app.use(
    "/api/newsletter",
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 10,
      standardHeaders: "draft-8",
      legacyHeaders: false,
      message: { message: "Too many subscription attempts. Please try again later." },
    }),
    newsletterRoutes
  );

  app.use((req, res) => {
    res.status(404).json({ message: "Route not found", requestId: req.requestId });
  });

  app.use((err, req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const clientMessages = {
      "entity.parse.failed": "Invalid JSON request body",
      "entity.too.large": "Request body exceeds the 10 KB limit",
    };
    const message = status >= 500 ? "Internal server error" : clientMessages[err.type] || err.message;

    if (status >= 500) {
      console.error(JSON.stringify({ level: "error", requestId: req.requestId, message: err.message }));
    }

    res.status(status).json({ message, requestId: req.requestId });
  });

  return app;
}