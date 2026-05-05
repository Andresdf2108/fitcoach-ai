-- ============================================================
-- FitCoach AI — Coach-filmed Exercise Videos
-- Trainers attach their own video demos to program exercises.
-- Per Sarah's feedback: clients connect more to seeing their
-- own coach do the movement vs. a generic stock demo.
-- Run in Supabase SQL Editor after 010.
-- ============================================================

-- ── Video columns on program_exercises ───────────────────────
alter table public.program_exercises
  add column if not exists video_url text,
  add column if not exists video_thumbnail_url text,
  add column if not exists video_uploaded_at timestamptz;

-- ── Storage bucket for exercise videos ───────────────────────
-- (Run as SQL — Supabase Storage exposes a buckets table.)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'exercise-videos',
  'exercise-videos',
  true,
  104857600, -- 100 MB
  array['video/mp4', 'video/quicktime', 'video/webm']
)
on conflict (id) do nothing;

-- Trainers can upload to their own folder: <trainer_id>/<filename>
create policy "exercise_videos_trainer_upload" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'exercise-videos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "exercise_videos_trainer_update" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'exercise-videos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "exercise_videos_trainer_delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'exercise-videos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Public read on the bucket (videos served via CDN)
create policy "exercise_videos_public_read" on storage.objects
  for select to public
  using (bucket_id = 'exercise-videos');
