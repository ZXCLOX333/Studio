import { RequestHandler } from "express";
import fetch from "node-fetch";

interface ContactFormData {
  name: string;
  phone: string;
  message: string;
}

interface ContactRequest {
  name: string;
  phone: string;
  message: string;
}

interface ContactResponse {
  success: boolean;
  message: string;
}

// Функція для відправки повідомлення в Telegram
async function sendToTelegram(data: ContactFormData): Promise<boolean> {
  try {
    // Замініть на ваш токен бота та chat_id
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
    
    console.log('Telegram BOT_TOKEN:', BOT_TOKEN ? 'SET' : 'NOT SET');
    console.log('Telegram CHAT_ID:', CHAT_ID ? 'SET' : 'NOT SET');
    
    if (!BOT_TOKEN || !CHAT_ID) {
      console.error('Telegram credentials not configured');
      console.error('BOT_TOKEN:', BOT_TOKEN);
      console.error('CHAT_ID:', CHAT_ID);
      return false;
    }

    // Log the actual values (be careful with security in production)
    console.log('BOT_TOKEN length:', BOT_TOKEN.length);
    console.log('CHAT_ID:', CHAT_ID);

    const message = `
🔔 *Нове повідомлення з сайту*

👤 *Ім'я:* ${data.name}
📱 *Телефон:* ${data.phone}
💬 *Повідомлення:* ${data.message}

⏰ *Час:* ${new Date().toLocaleString('uk-UA')}
    `;

    console.log('Sending message to Telegram...');
    console.log('Chat ID:', CHAT_ID);
    console.log('Message:', message);

    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: CHAT_ID,
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

    console.log('Message sent to Telegram successfully');
    return true;
  } catch (error) {
    console.error('Error sending to Telegram:', error);
    return false;
  }
}

// POST /api/contact - Send contact form to Telegram
export const sendContact: RequestHandler = async (req, res) => {
  try {
    const { name, phone, message }: ContactRequest = req.body;
    
    // Валідація
    if (!name || !phone || !message) {
      return res.status(400).json({ 
        success: false, 
        message: "Всі поля обов'язкові" 
      });
    }

    if (name.trim().length === 0 || phone.trim().length === 0 || message.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Всі поля повинні бути заповнені" 
      });
    }

    // Відправка в Telegram
    const success = await sendToTelegram({ name, phone, message });
    
    if (success) {
      const response: ContactResponse = {
        success: true,
        message: "Повідомлення успішно надіслано!"
      };
      res.status(200).json(response);
    } else {
      const response: ContactResponse = {
        success: false,
        message: "Помилка відправки повідомлення. Спробуйте пізніше."
      };
      res.status(500).json(response);
    }
  } catch (error) {
    console.error("Error processing contact form:", error);
    const response: ContactResponse = {
      success: false,
      message: "Внутрішня помилка сервера"
    };
    res.status(500).json(response);
  }
};
