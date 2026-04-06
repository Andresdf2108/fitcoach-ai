-- Run this in Supabase SQL Editor after 001_initial_schema.sql

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarded boolean DEFAULT false;
ALTER TABLE public.trainers ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE public.trainers ADD COLUMN IF NOT EXISTS specializations text[] DEFAULT '{}';
ALTER TABLE public.trainees ADD COLUMN IF NOT EXISTS primary_goal text;
ALTER TABLE public.trainees ADD COLUMN IF NOT EXISTS fitness_level text;
ALTER TABLE public.trainees ADD COLUMN IF NOT EXISTS injury_notes text;
