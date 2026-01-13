create extension if not exists "pgcrypto";

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  user_id text not null unique,
  height_cm numeric,
  weight_kg numeric,
  age integer,
  sex text,
  activity_level text,
  goal_weight numeric,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists recipes (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  name text not null,
  servings text,
  method text,
  tags text,
  ingredients text not null,
  calories numeric,
  protein numeric,
  carbs numeric,
  fat numeric,
  created_at timestamptz default now()
);

create table if not exists meal_logs (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  meal text not null,
  items jsonb not null default '[]',
  calories numeric,
  protein numeric,
  carbs numeric,
  fat numeric,
  log_date date not null default current_date,
  created_at timestamptz default now()
);

create table if not exists body_entries (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  log_date date not null default current_date,
  weight numeric,
  body_fat numeric,
  waist numeric,
  sleep numeric,
  created_at timestamptz default now()
);

create index if not exists recipes_user_id_idx on recipes (user_id);
create index if not exists meal_logs_user_id_idx on meal_logs (user_id);
create index if not exists meal_logs_date_idx on meal_logs (log_date);
create index if not exists body_entries_user_id_idx on body_entries (user_id);
create index if not exists body_entries_date_idx on body_entries (log_date);

alter table if exists meal_logs
  add column if not exists protein numeric;

alter table if exists meal_logs
  add column if not exists carbs numeric;

alter table if exists meal_logs
  add column if not exists fat numeric;
