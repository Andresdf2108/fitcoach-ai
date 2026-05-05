-- ============================================================
-- FitCoach AI — Sessions, Availability & Program Templates
-- Run this in Supabase SQL Editor
-- ============================================================

-- ── Program Templates (global library, no trainer_id) ────────
create table public.program_templates (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  duration_weeks integer,
  level text check (level in ('beginner', 'intermediate', 'advanced')),
  category text,
  created_at timestamptz default now()
);

alter table public.program_templates enable row level security;
create policy "templates_read_all" on public.program_templates for select using (true);

insert into public.program_templates (name, description, duration_weeks, level, category) values
  ('8-Week Fat Burn', 'High-intensity interval training combined with steady-state cardio to maximize calorie burn and accelerate fat loss. Includes 4 sessions per week with progressive intensity.', 8, 'beginner', 'weight_loss'),
  ('12-Week Strength Foundation', 'Progressive strength training covering the big compound lifts — squat, deadlift, bench press, and row — with structured weekly progression and deload weeks.', 12, 'intermediate', 'strength'),
  ('6-Week Athletic Performance', 'Speed, power, and agility training for athletes looking to improve sport-specific performance. Combines plyometrics, sprint work, and functional strength.', 6, 'advanced', 'performance'),
  ('4-Week Mobility Reset', 'Daily mobility work focusing on joint health, flexibility, and movement quality. Ideal after injury or extended sedentary periods. No gym equipment required.', 4, 'beginner', 'mobility'),
  ('10-Week Body Recomposition', 'Simultaneously builds muscle and reduces body fat through strategic resistance training and cardio programming. Requires consistent nutrition tracking.', 10, 'intermediate', 'recomp'),
  ('16-Week Marathon Prep', 'Structured long-distance running program with integrated strength and mobility support to carry athletes to a full marathon finish line.', 16, 'advanced', 'endurance'),
  ('8-Week Lean Muscle', 'Hypertrophy-focused lifting with optimal volume, rep ranges, and rest periods to build visible muscle without excessive bulk. 5 days per week.', 8, 'intermediate', 'muscle_building'),
  ('6-Week Core & Stability', 'Deep core activation, spinal stability, and functional movement patterns to build a strong foundation for any fitness goal. Perfect starting point.', 6, 'beginner', 'core');

-- ── Sessions table ───────────────────────────────────────────
create table public.sessions (
  id uuid default gen_random_uuid() primary key,
  trainer_id uuid references public.trainers(id) on delete cascade not null,
  trainee_id uuid references public.trainees(id) on delete set null,
  title text not null default 'Training Session',
  session_date date not null,
  session_time time not null,
  duration_minutes integer default 60,
  status text default 'scheduled' check (status in ('scheduled', 'completed', 'cancelled', 'no_show')),
  notes text,
  booked_by text default 'trainer' check (booked_by in ('trainer', 'trainee')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger sessions_updated_at before update on public.sessions
  for each row execute procedure public.handle_updated_at();

alter table public.sessions enable row level security;

create policy "sessions_trainer_all" on public.sessions
  for all using (auth.uid() = trainer_id);

create policy "sessions_trainee_read" on public.sessions
  for select using (auth.uid() = trainee_id);

create policy "sessions_trainee_book" on public.sessions
  for insert with check (auth.uid() = trainee_id);

create policy "sessions_trainee_cancel" on public.sessions
  for update using (auth.uid() = trainee_id);

-- ── Trainer availability slots ───────────────────────────────
create table public.trainer_availability (
  id uuid default gen_random_uuid() primary key,
  trainer_id uuid references public.trainers(id) on delete cascade not null,
  day_of_week integer not null check (day_of_week between 0 and 6), -- 0=Sunday
  start_time time not null,
  end_time time not null,
  created_at timestamptz default now()
);

alter table public.trainer_availability enable row level security;

create policy "availability_trainer_all" on public.trainer_availability
  for all using (auth.uid() = trainer_id);

create policy "availability_trainee_read" on public.trainer_availability
  for select using (
    exists (
      select 1 from public.trainees t
      where t.id = auth.uid() and t.trainer_id = trainer_availability.trainer_id
    )
  );
