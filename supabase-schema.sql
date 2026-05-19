-- Запусти это в Supabase → SQL Editor

create table if not exists submissions (
  id          uuid        default gen_random_uuid() primary key,
  email       text        unique not null,
  answers     jsonb       not null default '[]',
  analysis    text,
  created_at  timestamptz default now()
);

-- Индекс для быстрого поиска по email
create index if not exists submissions_email_idx on submissions(email);

-- RLS: запрещаем прямой доступ с клиента (только через service role)
alter table submissions enable row level security;

-- Никаких публичных политик — только server-side через service role key
