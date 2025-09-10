# API Відгуків

Цей документ описує API для роботи з відгуками.

## Ендпоінти

### GET /api/reviews
Отримує всі відгуки.

**Відповідь:**
```json
{
  "reviews": [
    {
      "id": "1703123456789abc123",
      "text": "Текст відгуку",
      "createdAt": "2023-12-21T10:30:00.000Z"
    }
  ]
}
```

### POST /api/reviews
Додає новий відгук.

**Запит:**
```json
{
  "text": "Текст нового відгуку"
}
```

**Відповідь:**
```json
{
  "review": {
    "id": "1703123456789abc123",
    "text": "Текст нового відгуку",
    "createdAt": "2023-12-21T10:30:00.000Z"
  }
}
```

## Структура даних

### Review
```typescript
interface Review {
  id: string;           // Унікальний ідентифікатор
  text: string;         // Текст відгуку
  createdAt: string;    // Дата створення (ISO string)
}
```

## Зберігання даних

Відгуки зберігаються в файлі `reviews.json` у корені проекту.

## Розробка

### Запуск в режимі розробки

1. **Запуск Express сервера (API):**
   ```bash
   node dev-server.js
   ```
   Сервер буде доступний на `http://localhost:3001`

2. **Запуск Vite (фронтенд):**
   ```bash
   npm run dev
   ```
   Фронтенд буде доступний на `http://localhost:8080`

3. **Запуск обох одночасно (якщо встановлено concurrently):**
   ```bash
   npm run dev:full
   ```

### Налаштування проксі

Vite налаштований для проксування API запитів з `/api/*` на `http://localhost:3001`, тому фронтенд може робити запити до `/api/reviews` без вказівки повного URL.

## Продакшн

Для деплою на Netlify використовується serverless function в `netlify/functions/api.ts`.

## Тестування

Для тестування API можна використати файл `test-reviews.js`:
```bash
node test-reviews.js
```

## Структура файлів

- `server/index.ts` - основний Express сервер
- `server/routes/reviews.ts` - роути для відгуків
- `shared/api.ts` - типи TypeScript
- `dev-server.js` - файл для запуску сервера розробки
- `reviews.json` - файл з даними відгуків
