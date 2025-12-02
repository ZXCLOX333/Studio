# Fusion Project - Деплой на Render та Netlify

## 🚀 Швидкий старт для деплою

**Важливо:** Всі команди виконуються з кореневої папки проекту `C:\Users\admin\Desktop\Нова папка (4)\`

### Backend (Render)

1. **Підготуйте backend:**
   ```bash
   # Переконайтесь, що ви в кореневій папці проекту
   cd "C:\Users\admin\Desktop\Нова папка (4)"
   
   # Перейдіть в папку backend та встановіть залежності
   cd backend
   pnpm install
   pnpm run build
   ```

2. **Деплой на Render:**
   - Зайдіть на [render.com](https://render.com)
   - Створіть новий Web Service
   - Підключіть ваш GitHub репозиторій
   - Вкажіть наступні налаштування:
     - **Build Command:** `pnpm install && pnpm run build`
     - **Start Command:** `pnpm start`
     - **Environment Variables:**
       - `NODE_ENV=production`
       - `TELEGRAM_BOT_TOKEN=8200610673:AAEn1zQF0VE1y0dSPXBHbKaMtxdJl2gZA2w`
       - `TELEGRAM_CHAT_ID=-1003044138027`
       - `FRONTEND_URL=https://your-frontend.netlify.app`

3. **Отримайте URL backend:**
   - Render надасть URL: `https://your-backend.onrender.com`

### Frontend (Netlify)

1. **Підготуйте frontend:**
   ```bash
   # Переконайтесь, що ви в кореневій папці проекту
   cd "C:\Users\admin\Desktop\Нова папка (4)"
   
   # Перейдіть в папку frontend та встановіть залежності
   cd frontend
   pnpm install
   ```

2. **Деплой на Netlify:**
   - Зайдіть на [netlify.com](https://netlify.com)
   - Створіть новий сайт з GitHub
   - Вкажіть наступні налаштування:
     - **Build command:** `pnpm run build`
     - **Publish directory:** `dist`
     - **Environment Variables:**
       - `VITE_API_URL=https://tatto-nadvirna.onrender.com`

3. **Отримайте URL frontend:**
   - Netlify надасть URL: `https://your-frontend.netlify.app`

### 🔄 Оновлення URLs

Після отримання реальних URLs:

1. **В Render backend:**
   - Оновіть `FRONTEND_URL` на ваш Netlify URL

2. **В Netlify frontend:**
   - Оновіть `VITE_API_URL` на ваш Render URL

## 📱 API Endpoints

Backend надає наступні endpoints:

- `GET /api/ping` - Health check
- `GET /api/reviews` - Отримати відгуки
- `POST /api/reviews` - Додати відгук
- `POST /api/booking` - Забронювати тату
- `POST /api/contact` - Надіслати повідомлення

## 🔧 Локальна розробка

```bash
# Переконайтесь, що ви в кореневій папці проекту
cd "C:\Users\admin\Desktop\Нова папка (4)"

# Встановити залежності для всіх частин проекту
pnpm run install:all

# Запустити backend (порт 5000)
cd backend && pnpm run dev

# Запустити frontend (порт 8080) - в новому терміналі
cd frontend && pnpm run dev

# АБО запустити обидва одночасно з кореневої папки
pnpm run dev
```

## 🌐 Production URLs

- **Backend:** `https://your-backend.onrender.com`
- **Frontend:** `https://your-frontend.netlify.app`

## 📝 Примітки

- Backend автоматично використовує `process.env.PORT` на Render
- Frontend налаштований для SPA routing
- Telegram інтеграція готова до роботи
- CORS налаштований для production URLs

