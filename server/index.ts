import bookingRouter from "./routes/booking";
import { sendContact } from "./routes/contact";
import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { handleDemo } from "./routes/demo";

import { getReviews, addReview, clearReviews } from "./routes/reviews";

import telegramRouter from "./routes/telegram";

export function createServer() {
  const app = express();

  // Middleware
  const allowedOrigins = [
    "http://localhost:8080",
    process.env.ALLOWED_ORIGIN,
    process.env.NETLIFY_URL,
    process.env.DEPLOY_URL,
    process.env.RENDER_EXTERNAL_URL,
  ].filter(Boolean) as string[];

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.some((o) => origin.includes(o))) {
          return callback(null, true);
        }
        return callback(null, true); // allow by default; tighten if needed
      },
      credentials: false,
    })
  );
  app.use(bodyParser.json({ limit: "10mb" }));
  app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

  // Example API routes
  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Reviews API
  app.get("/api/reviews", getReviews);
  app.post("/api/reviews", addReview);
  app.delete("/api/reviews", clearReviews);

  // Contact API endpoint
  app.post("/api/contact", sendContact);

  // Telegram API endpoint
  app.use("/api/telegram", telegramRouter);

  // Booking API endpoint
  app.use("/api/booking", bookingRouter);

  return app;
}
