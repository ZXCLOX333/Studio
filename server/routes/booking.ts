import { RequestHandler } from "express";

interface BookingFormData {
  name: string;
  phone: string;
  date: string;
  time: string;
  description: string;
}

interface BookingRequest {
  name: string;
  phone: string;
  date: string;
  time: string;
  description: string;
}

interface BookingResponse {
  success: boolean;
  message: string;
}

// Функція для відправки повідомлення про запис в Telegram
async function sendBookingToTelegram(data: BookingFormData): Promise<boolean> {
  try {
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
    
    console.log('BOT_TOKEN:', BOT_TOKEN ? 'SET' : 'NOT SET');
    console.log('CHAT_ID:', CHAT_ID ? 'SET' : 'NOT SET');
    console.log('BOT_TOKEN value:', BOT_TOKEN);
    console.log('CHAT_ID value:', CHAT_ID);
    
    if (!BOT_TOKEN || !CHAT_ID) {
      console.error('Telegram credentials not configured');
      return false;
    }

    const message = `
🎯 *Новий запис на тату!*

👤 *Ім'я:* ${data.name}
📱 *Телефон:* ${data.phone}
📅 *Дата:* ${data.date}
🕐 *Час:* ${data.time}
💬 *Опис:* ${data.description}

⏰ *Час запису:* ${new Date().toLocaleString('uk-UA')}
    `;
    
    console.log('Telegram message:', message);

    console.log('Sending request to Telegram API');
    console.log('URL:', `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`);
    console.log('Request body:', JSON.stringify({
      chat_id: parseInt(CHAT_ID, 10),
      text: message,
      parse_mode: 'Markdown'
    }));
    
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: parseInt(CHAT_ID, 10),
        text: message,
        parse_mode: 'Markdown'
      })
    });
    
    console.log('Telegram API response status:', response.status);
    console.log('Telegram API response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Telegram API error:', response.status, errorText);
      throw new Error(`Telegram API error: ${response.status} - ${errorText}`);
    }

    return true;
  } catch (error) {
    console.error('Error sending booking to Telegram:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    if (error.stack) {
      console.error('Error stack:', error.stack);
    }
    return false;
  }
}



import { Router } from "express";

const router = Router();


router.post("/", async (req, res) => {
  const { name, phone, date, time, description } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ success: false, message: "Name and phone are required" });
  }

  const bookingData = { name, phone, date, time, description };
  console.log("Нова бронь:", bookingData);

  // Send booking to Telegram
  const sent = await sendBookingToTelegram(bookingData);
  if (sent) {
    res.json({ success: true, message: "Booking received and sent to Telegram" });
  } else {
    res.status(500).json({ success: false, message: "Booking received, but failed to send to Telegram" });
  }
});

export default router;

