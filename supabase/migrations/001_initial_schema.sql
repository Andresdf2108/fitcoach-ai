-- ============================================================
-- FitCoach AI — Initial Schema
-- Run this in Supabase SQL Editor: Dashboard → SQL Editor → New query
-- ============================================================

-- ── Subscription plans ───────────────────────────────────────
create table public.subscription_plans (
  id serial primary key,
  name text not null unique,           -- free, gold, platinum, diamond, enterprise
  max_trainees integer not null,
  price_monthly decimal(10,2) default 0,
  created_at timestamptz default now()
);

insert into public.subscription_plans (name, max_trainees, price_monthly) values
  ('free',       5,   0),
  ('gold',       25,  49),
  ('platinum',   75,  99),
  ('diamond',    200, 199),
  ('enterprise', 9999, 499);

-- ── Profiles (extends auth.users) ────────────────────────────
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  role text not null default 'trainee' check (role in ('admin', 'trainer', 'trainee')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── Trainers ─────────────────────────────────────────────────
create table public.trainers (
  id uuid references public.profiles(id) on delete cascade primary key,
  bio text,
  specializations text[] default '{}',
  plan_id integer references public.subscription_plans(id) default 1,
  active_trainee_count integer default 0,
  status text default 'active' check (status in ('active', 'paused', 'suspended')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── Trainees ─────────────────────────────────────────────────
create table public.trainees (
  id uuid references public.profiles(id) on delete cascade primary key,
  trainer_id uuid references public.trainers(id),
  status text default 'onboarding' check (
    status in ('onboarding', 'active', 'paused', 'at_risk', 'completed', 'inactive', 'archived', 'cancelled')
  ),
  goals text,
  fitness_level text check (fitness_level in ('beginner', 'intermediate', 'advanced')),
  injury_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── Leads ────────────────────────────────────────────────────
create table public.leads (
  id uuid default gen_random_uuid() primary key,
  trainer_id uuid references public.trainers(id) on delete cascade not null,
  full_name text not null,
  email text,
  phone text,
  source text,
  stage text default 'new' check (
    stage in ('new', 'attempted_contact', 'qualified', 'consultation_booked', 'consultation_done', 'proposal_sent', 'won', 'lost')
  ),
  notes text,
  goals text,
  budget text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── Auto-create profile on signup ────────────────────────────
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'trainee')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Auto-create trainer record when role = trainer ────────────
create or replace function public.handle_new_trainer()
returns trigger as $$
begin
  if new.role = 'trainer' then
    insert into public.trainers (id)
    values (new.id)
    on conflict do nothing;
  end if;
  if new.role = 'trainee' then
    insert into public.trainees (id)
    values (new.id)
    on conflict do nothing;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_profile_created
  after insert on public.profiles
  for each row execute procedure public.handle_new_trainer();

-- ── Updated_at trigger ───────────────────────────────────────
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at before update on public.profiles
  for each row execute procedure public.handle_updated_at();
create trigger trainers_updated_at before update on public.trainers
  for each row execute procedure public.handle_updated_at();
create trigger trainees_updated_at before update on public.trainees
  for each row execute procedure public.handle_updated_at();
create trigger leads_updated_at before update on public.leads
  for each row execute procedure public.handle_updated_at();

-- ── Row Level Security ────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.trainers enable row level security;
alter table public.trainees enable row level security;
alter table public.leads enable row level security;
alter table public.subscription_plans enable row level security;

-- Subscription plans: everyone can read
create policy "subscription_plans_read" on public.subscription_plans
  for select using (true);

-- Profiles: users read own; admins read all
create policy "profiles_read_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- Trainers: trainers read own; admins read all
create policy "trainers_read_own" on public.trainers
  for select using (auth.uid() = id);

create policy "trainers_update_own" on public.trainers
  for update using (auth.uid() = id);

-- Trainees: trainee reads own; their trainer reads them
create policy "trainees_read_own" on public.trainees
  for select using (
    auth.uid() = id
    or auth.uid() = trainer_id
  );

create policy "trainees_update_trainer" on public.trainees
  for update using (auth.uid() = trainer_id);

-- Leads: trainers manage their own leads
create policy "leads_trainer_all" on public.leads
  for all using (auth.uid() = trainer_id);
