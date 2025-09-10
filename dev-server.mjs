
import "dotenv/config";
import * as dotenv from 'dotenv';
dotenv.config({ path: './Telegram.env' });
console.log('Loaded TELEGRAM_BOT_TOKEN:', process.env.TELEGRAM_BOT_TOKEN);
console.log('Loaded TELEGRAM_CHAT_ID:', process.env.TELEGRAM_CHAT_ID);
import { createServer } from './server/index.ts';

const app = createServer();
const PORT = 3001;

app.listen(PORT, () => {
  console.log(`🚀 Express server running on http://localhost:${PORT}`);
  console.log(`📝 API endpoints:`);
  console.log(`   GET  http://localhost:${PORT}/api/reviews`);
  console.log(`   POST http://localhost:${PORT}/api/reviews`);
  console.log(`   GET  http://localhost:${PORT}/api/ping`);
  console.log(`   GET  http://localhost:${PORT}/api/demo`);
  console.log(`   POST http://localhost:${PORT}/api/telegram/send-message`);
});
