-- ============================================================
-- FitCoach AI — Mindset Module
-- Daily mindset check-ins for trainees, AI-generated reflections,
-- trainer visibility into client mindset trends.
-- Run in Supabase SQL Editor after 009.
-- ============================================================

-- ── Daily mindset check-ins ──────────────────────────────────
create table public.mindset_checkins (
  id uuid default gen_random_uuid() primary key,
  trainee_id uuid references public.trainees(id) on delete cascade not null,
  mood_score integer not null check (mood_score between 1 and 10),
  energy_score integer not null check (energy_score between 1 and 10),
  focus_score integer not null check (focus_score between 1 and 10),
  win_today text,
  challenge_today text,
  intention text,
  ai_reflection text,
  created_at timestamptz default now()
);

create index mindset_checkins_trainee_created_idx
  on public.mindset_checkins (trainee_id, created_at desc);

alter table public.mindset_checkins enable row level security;

-- Trainee owns their own check-ins
create policy "mindset_trainee_all" on public.mindset_checkins
  for all using (auth.uid() = trainee_id);

-- Trainer reads check-ins for their assigned trainees
create policy "mindset_trainer_read" on public.mindset_checkins
  for select using (
    exists (
      select 1 from public.trainees t
      where t.id = mindset_checkins.trainee_id and t.trainer_id = auth.uid()
    )
  );

-- ── Anonymous public check-ins (free tool on /free) ──────────
-- Stored without an auth user; used to show the AI reflection back
-- to the visitor. Ephemeral, cleaned up periodically.
create table public.public_mindset_checkins (
  id uuid default gen_random_uuid() primary key,
  mood_score integer check (mood_score between 1 and 10),
  energy_score integer check (energy_score between 1 and 10),
  focus_score integer check (focus_score between 1 and 10),
  free_text text,
  ai_reflection text,
  visitor_id text,
  created_at timestamptz default now()
);

alter table public.public_mindset_checkins enable row level security;

-- Inserts allowed from anyone (public free tool); reads restricted
-- to admins via service role. No public select policy.
create policy "public_mindset_insert" on public.public_mindset_checkins
  for insert with check (true);
