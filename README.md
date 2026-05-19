# Year Review — Честный анализ года

6 неудобных вопросов → честный анализ от ИИ.

## Быстрый старт

```bash
npm install
cp .env.local.example .env.local
# заполни .env.local (см. ниже)
npm run dev
```

Открой http://localhost:3000

---

## Настройка переменных окружения

### 1. Anthropic API Key (обязательно)

1. Зайди на https://console.anthropic.com
2. API Keys → Create Key
3. Вставь в `.env.local`:
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ```

### 2. Supabase (опционально — для блокировки повторных прохождений)

Если не настроишь — сайт работает, но один человек может пройти несколько раз.

**Создать проект:**
1. Зайди на https://supabase.com → New project
2. Запомни пароль от БД

**Создать таблицу:**
1. Supabase → SQL Editor → вставь содержимое `supabase-schema.sql` → Run

**Получить ключи:**
1. Supabase → Settings → API
2. Скопируй:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `service_role` (secret) → `SUPABASE_SERVICE_ROLE_KEY`

Вставь в `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

---

## Деплой на Vercel

```bash
npm i -g vercel
vercel
```

При первом деплое Vercel спросит настройки — все оставь по умолчанию.

Затем добавь переменные окружения:
- Vercel Dashboard → проект → Settings → Environment Variables
- Добавь `ANTHROPIC_API_KEY`, и опционально Supabase ключи

---

## Структура проекта

```
app/
  page.tsx               — весь UI (лендинг → вопросы → результат)
  globals.css            — дизайн-токены и стили
  api/
    analyze/route.ts     — вызов Claude API
    check-email/route.ts — проверка email в Supabase
lib/
  supabase.ts            — Supabase клиент (работает без настройки)
supabase-schema.sql      — SQL для создания таблицы
.env.local.example       — шаблон переменных окружения
```
