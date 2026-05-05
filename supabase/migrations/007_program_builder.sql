-- ============================================================
-- FitCoach AI — Program Builder
-- Creates exercise library per program week/day + workout logs
-- ============================================================

-- ── Per-program exercise content ─────────────────────────────
create table public.program_exercises (
  id uuid default gen_random_uuid() primary key,
  program_id uuid references public.programs(id) on delete cascade not null,
  week_number integer not null check (week_number >= 1),
  day_number integer not null check (day_number between 1 and 7),
  name text not null,
  sets integer,
  reps integer,
  duration_minutes decimal(4,1),
  rest_seconds integer default 60,
  notes text,
  order_index integer default 0,
  created_at timestamptz default now()
);

alter table public.program_exercises enable row level security;

-- Trainer manages exercises for their own programs
create policy "exercises_trainer_all" on public.program_exercises
  for all using (
    exists (
      select 1 from public.programs p
      where p.id = program_exercises.program_id and p.trainer_id = auth.uid()
    )
  );

-- Trainees can read exercises for programs assigned to them
create policy "exercises_trainee_read" on public.program_exercises
  for select using (
    exists (
      select 1 from public.program_assignments pa
      where pa.program_id = program_exercises.program_id
        and pa.trainee_id = auth.uid()
        and pa.status = 'active'
    )
  );

-- ── Trainee workout completion logs ──────────────────────────
create table public.workout_logs (
  id uuid default gen_random_uuid() primary key,
  trainee_id uuid references public.trainees(id) on delete cascade not null,
  exercise_id uuid references public.program_exercises(id) on delete cascade not null,
  completed_at timestamptz default now(),
  actual_sets integer,
  actual_reps integer,
  notes text,
  created_at timestamptz default now(),
  unique(trainee_id, exercise_id)
);

alter table public.workout_logs enable row level security;

-- Trainees manage their own logs
create policy "logs_trainee_all" on public.workout_logs
  for all using (auth.uid() = trainee_id);

-- Trainers can read logs for their trainees
create policy "logs_trainer_read" on public.workout_logs
  for select using (
    exists (
      select 1 from public.trainees t
      where t.id = workout_logs.trainee_id and t.trainer_id = auth.uid()
    )
  );
