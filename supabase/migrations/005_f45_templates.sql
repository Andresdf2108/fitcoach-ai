-- ============================================================
-- FitCoach AI — F45-Inspired Program Templates
-- Safe to run after 004_sessions_templates.sql
-- Replaces generic templates with proper F45-style programs
-- ============================================================

-- Remove the generic templates from migration 004
DELETE FROM public.program_templates;

-- Insert 8 F45-inspired templates
INSERT INTO public.program_templates (name, description, duration_weeks, level, category) VALUES
(
  '8-Week Athletic Training',
  'Full-body circuit training inspired by the F45 Athletic format. Each 45-minute session alternates between cardio machine stations (rowers, assault bikes, ski erg) and resistance stations (kettlebell swings, box jumps, battle ropes, TRX rows). 4 sessions per week with progressive intensity across four two-week blocks. Builds cardio endurance and functional strength simultaneously.',
  8, 'intermediate', 'performance'
),
(
  '6-Week Panthers Speed & Power',
  'Explosive lower-body and athleticism program inspired by F45 Panthers. Each 45-minute session cycles through 27 stations of plyometric and speed work: lateral hurdles, broad jumps, banded hip drives, sled pushes, single-leg bounds, and timed sprint intervals. Built for competitive athletes targeting measurable gains in first-step acceleration, vertical jump height, and reactive agility.',
  6, 'advanced', 'performance'
),
(
  '4-Week Cardio Blast',
  'High-intensity interval cardio program for beginners stepping into structured fitness. Circuits rotate through rowing machine intervals, stationary cycling sprints, treadmill running drills, and low-impact jumping jacks. Sessions are 45 minutes using a 20 seconds on / 10 seconds rest format inspired by F45 Firestorm. No prior gym experience required — all movements are coach-demonstrated.',
  4, 'beginner', 'weight_loss'
),
(
  '8-Week Hybrid Strength',
  'Body recomposition program combining 3 resistance days (barbell compound lifts with accessory supersets) and 2 cardio circuit days per week, inspired by the F45 Lionheart hybrid format. Resistance days run progressive overload on squat, deadlift, bench, and row. Cardio days are moderate-intensity HIIT keeping heart rate at 65–80% max. Requires a barbell, dumbbells, and a pull-up bar.',
  8, 'intermediate', 'recomp'
),
(
  '12-Week Warrior Foundation',
  'Foundational strength program for beginners inspired by F45 Warrior. Builds proficiency and confidence across the five movement patterns: squat, hinge, push, pull, and loaded carry. Uses light-to-moderate resistance with progressive rep schemes each month (Month 1: 3×12, Month 2: 4×10, Month 3: 5×8). Includes a mandatory deload week every 4 weeks. Ideal for first-time gym-goers.',
  12, 'beginner', 'strength'
),
(
  '6-Week Athletica Performance',
  'Olympic-lifting and functional training hybrid inspired by F45 Athletica. Sessions include power cleans, hang snatches, push jerks, and overhead squats combined with functional conditioning circuits. Requires proficient coaching on Olympic technique — not appropriate for complete beginners. Develops explosive power, coordination, and full-body athleticism for experienced strength athletes.',
  6, 'advanced', 'performance'
),
(
  '8-Week Lean Hollywood',
  'Upper-body focused resistance circuit program inspired by F45 Hollywood. Each 45-minute session targets chest, back, shoulders, and arms through time-under-tension supersets (3-second negatives), drop sets, and isolation circuits. Runs 5 days per week with 2 active recovery days. Optional 10-minute AMRAP finisher circuits for added calorie burn. Produces lean, defined upper-body muscle without adding bulk.',
  8, 'intermediate', 'muscle_building'
),
(
  '4-Week Eagle Mobility',
  'Full-body mobility and movement quality program inspired by F45 Eagle. Daily 45-minute sessions cover hip 90/90 transitions, thoracic rotation drills, ankle mobility circles, shoulder CARs (controlled articular rotations), dynamic stretching flows, and breath work. Ideal as a standalone recovery program or active rest phase between training blocks. Zero equipment required — can be done anywhere.',
  4, 'beginner', 'mobility'
);
