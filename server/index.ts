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
  app.use(cors({ origin: "http://localhost:8080" }));
  app.use(bodyParser.json({ limit: "10mb" }));
  app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

  // Example API routes
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
