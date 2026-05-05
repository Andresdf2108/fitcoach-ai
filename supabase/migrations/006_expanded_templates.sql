-- ============================================================
-- FitCoach AI — Expanded Program Template Library (24 total)
-- Run after 005_f45_templates.sql
-- Adds 16 new programs across all major fitness goals
-- ============================================================

INSERT INTO public.program_templates (name, description, duration_weeks, level, category) VALUES

-- ── Weight Loss ───────────────────────────────────────────────

(
  '6-Week Summer Shred',
  'Full-body HIIT and resistance circuit program designed to maximize calorie burn in 45-minute sessions. 5 training days per week alternating upper and lower body resistance with metabolic conditioning circuits. Weeks 5–6 introduce an optional 20-minute fasted morning cardio session to push final results. Best run alongside a moderate caloric deficit.',
  6, 'intermediate', 'weight_loss'
),
(
  '10-Week Metabolic Reset',
  'Gentle on-ramp for clients returning from long periods of inactivity or injury. Starts with 30-minute low-impact circuit sessions and progressively builds to 45-minute mixed cardio-resistance workouts. Heart rate zones are strictly managed — Zone 2 base building in weeks 1–4, Zone 3–4 intervals added in weeks 5–10 — to optimize fat oxidation without overtraining or injury.',
  10, 'beginner', 'weight_loss'
),
(
  '8-Week Total Body Transformation',
  'Structured 8-week program combining resistance training, cardio circuits, and targeted nutrition habits. Four training days per week: two full-body resistance sessions, one HIIT day, one steady-state cardio day. Progressive volume increase every two weeks. Weekly habit tracker included for sleep, water, and step count. Suitable for clients with a basic gym foundation.',
  8, 'intermediate', 'weight_loss'
),

-- ── Strength ─────────────────────────────────────────────────

(
  '8-Week Powerlifting Intro',
  'Structured introduction to the three competition lifts: squat, bench press, and deadlift. Runs a 4-day Upper/Lower split using RPE-based loading to build both technical proficiency and raw strength. Week 7 is a practice-intensity week; week 8 is a test week for estimated 1-rep max across all three lifts. Requires a barbell, rack, and bench.',
  8, 'intermediate', 'strength'
),
(
  '16-Week Advanced Strength Block',
  'Periodized powerlifting program for experienced lifters who have hit plateaus on linear progression. Runs two full 8-week waves: accumulation (high volume, 70–80% 1RM) → intensification (lower volume, 85–95% 1RM) → realization (peak week) → deload. Wave-loading keeps the central nervous system fresh and drives new strength adaptations across the full cycle.',
  16, 'advanced', 'strength'
),
(
  '6-Week Kettlebell Fundamentals',
  'Progressive mastery of the five foundational kettlebell movements: Turkish get-up, swing, goblet squat, press, and single-arm row. Each movement is taught quality-first with video cue breakdowns before load is added. Sessions are 35–40 minutes, running 3 days per week with minimal rest periods to build work capacity alongside strength. No prior kettlebell experience required.',
  6, 'beginner', 'strength'
),

-- ── Muscle Building ───────────────────────────────────────────

(
  '12-Week Classic Hypertrophy',
  'Traditional bodybuilding split (Chest/Back · Arms/Shoulders · Legs) running 4 training days per week. Applies progressive overload through volume progression — adding one working set per exercise per month. Weeks 9–12 introduce mechanical drop sets and 3-second eccentric contractions to push past adaptation plateaus. Designed to produce visible muscle gain in 90 days.',
  12, 'intermediate', 'muscle_building'
),
(
  '8-Week Push/Pull/Legs Split',
  'Classic PPL split running 6 days per week so each movement pattern is trained twice. Heavy compound lifts (bench press, barbell row, squat, Romanian deadlift) are paired with two isolation exercises per session. Week 7 introduces intensity techniques — supersets and rest-pause sets — before a deload week to lock in gains. Requires a full rack and cable station.',
  8, 'intermediate', 'muscle_building'
),
(
  '6-Week Arms & Aesthetics',
  'Bicep, tricep, and shoulder specialization program layered on top of a 3-day full-body maintenance base. Six targeted arm sessions per week using varied angles, grips, and rep ranges (6–8 for strength, 12–15 for pump, 20+ for endurance-hypertrophy). Cable isolation finishers in every session maximize muscle activation and visible vascularity. Best paired with a mild caloric surplus.',
  6, 'intermediate', 'muscle_building'
),

-- ── Endurance ────────────────────────────────────────────────

(
  '12-Week 5K Runner\'s Plan',
  'Start-to-finish plan taking complete beginners to confidently running a 5K. Three run sessions per week: an easy aerobic base run, a tempo interval session (e.g. 6×400m with 90sec rest), and a long slow distance run. Two cross-training sessions (cycling or rowing) and one daily mobility session for injury prevention. Weekly mileage increases follow the 10% rule.',
  12, 'beginner', 'endurance'
),
(
  '16-Week Half Marathon Prep',
  'Structured 16-week plan building weekly mileage from 25km to 55km using the 10% rule. Includes weekly long runs, speed intervals (track 1000m repeats), tempo hill repeats, and strength work to protect knees and hips. Nutrition and hydration guidance for long-run days included. Full taper protocol in weeks 15–16 for race-day readiness.',
  16, 'intermediate', 'endurance'
),

-- ── Performance ──────────────────────────────────────────────

(
  '4-Week Combat Sport Conditioning',
  'High-density conditioning program mimicking the energy demands of MMA, boxing, and Muay Thai. Rounds-based circuit training (3 min on / 1 min off) with shadow boxing combinations, heavy bag rounds, sprawl-and-brawl transitions, explosive burpee variations, and grip work. Designed to be stacked on top of existing martial arts training. Not for complete beginners.',
  4, 'advanced', 'performance'
),
(
  '8-Week Sport-Specific Agility',
  'Reactive agility program for team-sport athletes in soccer, basketball, rugby, and football. Combines ladder drills, 4-cone agility patterns, reactive light training, deceleration mechanics, and lateral speed work. Measurable testing every two weeks: T-test, 10m sprint, 505 agility test, and vertical jump. Designed to produce meaningful game-ready speed improvements.',
  8, 'intermediate', 'performance'
),

-- ── Body Recomp ───────────────────────────────────────────────

(
  '12-Week Complete Body Recomp',
  'Long-form simultaneous fat loss and muscle gain program using caloric cycling. Training days target maintenance calories with high protein (2.2g/kg bodyweight); rest days run a 300-calorie deficit. Three resistance training days, two HIIT days, and two active recovery days per week. Progressive overload on compound lifts ensures muscle retention while the caloric strategy drives fat reduction.',
  12, 'intermediate', 'recomp'
),

-- ── Mobility & Recovery ───────────────────────────────────────

(
  '8-Week Yoga Strength Fusion',
  'Bridges the gap between traditional resistance training and yoga practice. Each 50-minute session opens with 15 minutes of sun salutations and hip-opening flows, moves into 25 minutes of loaded resistance exercises (goblet squats, hip thrusts, push-ups, rows), and closes with 10 minutes of targeted restorative stretching. Builds functional strength and deep flexibility simultaneously.',
  8, 'intermediate', 'mobility'
),

-- ── Special Populations ───────────────────────────────────────

(
  '8-Week Prenatal Fitness',
  'Trimester-safe fitness program for pregnant clients cleared for exercise by their OB-GYN. Focuses on pelvic floor activation, safe deep-core stability, glute and hip strength, posture correction for the shifting center of gravity, and breathwork. All high-impact movements replaced with low-impact alternatives. Includes trimester-specific modifications for weeks 1–8 and guidance notes for trainers.',
  8, 'beginner', 'prenatal'
),
(
  '8-Week Active Aging',
  'Functional fitness program for adults 55+ prioritizing fall prevention, joint mobility, balance, and everyday strength. Movements include chair-assisted squats, wall push-ups, resistance band rows, balance board progressions, and gentle loaded carries. All sessions are 30–40 minutes with extended rest periods. Weekly walking targets complement each training session. Designed to preserve independence and improve quality of life.',
  8, 'beginner', 'longevity'
);
