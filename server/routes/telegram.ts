import { Router } from "express";
import fetch from "node-fetch";

// Type definitions for Telegram API response
interface TelegramSuccessResponse {
  ok: true;
  result: any;
}

interface TelegramErrorResponse {
  ok: false;
  error_code: number;
  description: string;
}

type TelegramResponse = TelegramSuccessResponse | TelegramErrorResponse;

const router = Router();

router.post("/send-message", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ success: false, error: "Повідомлення пусте" });
  }

  try {
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      return res.status(500).json({ success: false, error: "❌ Немає TELEGRAM_BOT_TOKEN або TELEGRAM_CHAT_ID" });
    }

    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

    const tgResponse = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: "HTML",
      }),
    });

    const data = await tgResponse.json() as TelegramResponse;

    if (data.ok) {
      res.json({ success: true });
    } else {
      // Type guard to ensure we're dealing with TelegramErrorResponse
      const errorResponse = data as TelegramErrorResponse;
      res.json({ success: false, error: errorResponse.description || "Помилка відправки повідомлення" });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || "Помилка сервера" });
  }
});

export default router;
