// types/api.ts

// Відповідь від Telegram API проксі (send-message)
export interface TelegramResponse {
  success: boolean;
  error?: { description?: string } | string;
}

// Відповідь від Booking API
export interface BookingResponse {
  success: boolean;
  message: string;
}
