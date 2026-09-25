-- ==============================================================================
-- WasteWise (Project Go) Supabase Schema
-- Run this script in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- ==============================================================================

-- 1. Profiles Table (Holds dynamic user EcoCoins, scan counts, badges)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  name text,
  eco_coins int default 0,
  scan_count int default 0,
  badges text[] default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);


-- 2. Scans Table (Tracks every scanned item and carbon savings)
create table if not exists public.scans (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  item_name text not null,
  category text not null,
  carbon_percent numeric default 0,
  points int default 10,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.scans enable row level security;

create policy "Users can view their own scans"
  on public.scans for select
  using (auth.uid() = user_id);

create policy "Users can insert their own scans"
  on public.scans for insert
  with check (auth.uid() = user_id);


-- 3. Earnings Table (Tracks kabadiwala scrap dealer sales)
create table if not exists public.earnings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  date text not null,
  buyer_name text,
  total_kg numeric default 0,
  total_earned numeric default 0,
  items jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.earnings enable row level security;

create policy "Users can view their own earnings"
  on public.earnings for select
  using (auth.uid() = user_id);

create policy "Users can insert their own earnings"
  on public.earnings for insert
  with check (auth.uid() = user_id);


-- 4. Redeemed Rewards Table (Tracks real-world EcoCoin redemptions)
create table if not exists public.redeemed (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  reward_id text not null,
  cost int not null,
  date text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.redeemed enable row level security;

create policy "Users can view their own redemptions"
  on public.redeemed for select
  using (auth.uid() = user_id);

create policy "Users can insert their own redemptions"
  on public.redeemed for insert
  with check (auth.uid() = user_id);
