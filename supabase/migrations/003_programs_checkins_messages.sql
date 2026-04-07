-- ============================================================
-- FitCoach AI — Programs, Check-ins, Messages
-- Run this in Supabase SQL Editor
-- ============================================================

-- ── Programs ─────────────────────────────────────────────────
create table public.programs (
  id uuid default gen_random_uuid() primary key,
  trainer_id uuid references public.trainers(id) on delete cascade not null,
  name text not null,
  description text,
  duration_weeks integer,
  level text check (level in ('beginner', 'intermediate', 'advanced')),
  status text default 'draft' check (status in ('draft', 'active', 'archived')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── Program assignments (which trainee is on which program) ──
create table public.program_assignments (
  id uuid default gen_random_uuid() primary key,
  program_id uuid references public.programs(id) on delete cascade not null,
  trainee_id uuid references public.trainees(id) on delete cascade not null,
  trainer_id uuid references public.trainers(id) on delete cascade not null,
  start_date date default current_date,
  end_date date,
  status text default 'active' check (status in ('active', 'completed', 'paused')),
  created_at timestamptz default now(),
  unique(program_id, trainee_id)
);

-- ── Check-ins ────────────────────────────────────────────────
create table public.checkins (
  id uuid default gen_random_uuid() primary key,
  trainee_id uuid references public.trainees(id) on delete cascade not null,
  trainer_id uuid references public.trainers(id) on delete cascade not null,
  weight_kg decimal(5,2),
  energy_level integer check (energy_level between 1 and 10),
  sleep_quality integer check (sleep_quality between 1 and 10),
  stress_level integer check (stress_level between 1 and 10),
  workouts_completed integer default 0,
  notes text,
  trainer_feedback text,
  reviewed boolean default false,
  week_start date default current_date,
  created_at timestamptz default now()
);

-- ── Messages ─────────────────────────────────────────────────
create table public.messages (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  recipient_id uuid references public.profiles(id) on delete cascade not null,
  body text not null,
  read boolean default false,
  created_at timestamptz default now()
);

-- ── Updated_at triggers ──────────────────────────────────────
create trigger programs_updated_at before update on public.programs
  for each row execute procedure public.handle_updated_at();

-- ── RLS ──────────────────────────────────────────────────────
alter table public.programs enable row level security;
alter table public.program_assignments enable row level security;
alter table public.checkins enable row level security;
alter table public.messages enable row level security;

-- Programs: trainer manages own; trainees read assigned
create policy "programs_trainer_all" on public.programs
  for all using (auth.uid() = trainer_id);

create policy "programs_trainee_read" on public.programs
  for select using (
    exists (
      select 1 from public.program_assignments pa
      where pa.program_id = programs.id and pa.trainee_id = auth.uid()
    )
  );

-- Program assignments: trainer manages; trainee reads own
create policy "assignments_trainer_all" on public.program_assignments
  for all using (auth.uid() = trainer_id);

create policy "assignments_trainee_read" on public.program_assignments
  for select using (auth.uid() = trainee_id);

-- Check-ins: trainee inserts own; trainer reads/updates their trainees'
create policy "checkins_trainee_insert" on public.checkins
  for insert with check (auth.uid() = trainee_id);

create policy "checkins_trainee_read_own" on public.checkins
  for select using (auth.uid() = trainee_id or auth.uid() = trainer_id);

create policy "checkins_trainer_update" on public.checkins
  for update using (auth.uid() = trainer_id);

-- Messages: users read/send their own messages
create policy "messages_read" on public.messages
  for select using (auth.uid() = sender_id or auth.uid() = recipient_id);

create policy "messages_insert" on public.messages
  for insert with check (auth.uid() = sender_id);

create policy "messages_update_read" on public.messages
  for update using (auth.uid() = recipient_id);
