# FitCoach AI — Status & Next Steps

Last updated: 2026-05-12. Companion docs: [`SECURITY-URGENT.md`](./SECURITY-URGENT.md) for the security cleanup; this file covers product/feature state.

---

## 1. What ships in this branch (deployed to prod)

Live at https://fitcoach-ai-beryl.vercel.app, on `main` at commit `5f3a420`.

### Mindset module — the Sarah-validated differentiator
- **`/api/mindset/reflect`** — POST endpoint. Generates a 3–4 sentence reflection via Claude Sonnet 4.6 (`anthropic/claude-sonnet-4.6` through the Vercel AI SDK). Works for authed trainees and anonymous `/free` visitors with the same payload shape.
- **`/trainee/mindset`** — daily check-in: 3 sliders (mood/energy/focus 1–10) + 3 optional free-text prompts (win / challenge / intention). Shows today's reflection if already submitted, 14-day rolling averages, and reflection history.
- **`/trainer/mindset`** — client mindset overview. Rows are sorted by recent-mood drop so coaches see clients needing attention first. Each row shows 14-day average mood/energy/focus and the trend delta.
- **Migration:** `supabase/migrations/010_mindset.sql` — `mindset_checkins` (RLS: trainee owns, trainer reads via assignment) + `public_mindset_checkins` (insert-only for anon).

### Coach-filmed exercise videos
- **`/trainer/videos`** — exercise library grouped by name. Per-exercise upload, replace, preview (modal), and remove. Browser-side direct upload to Supabase Storage bucket `exercise-videos` (100MB cap; mp4/quicktime/webm).
- **`setExerciseVideoByName`** server action — one upload propagates the URL across every `program_exercises` row for that exercise name in this trainer's programs.
- **Trainee surface** — `/trainee/workouts` shows "▶ Watch your coach's demo" link when a video is attached.
- **Migration:** `supabase/migrations/011_exercise_videos.sql` — adds `video_url`, `video_thumbnail_url`, `video_uploaded_at` columns + storage bucket policies (per-trainer folder writes, public read).

### Public surfaces
- **`/free`** — anonymous mindset check-in. No signup. After reflection: "Try again" + "Save to your journal — sign up" CTAs.
- **`/landing`** — alternate marketing page citing Sarah's four feedback pillars (mindset / coach video / structure / templates).
- **`/`** — hero now has a third CTA linking to `/free`.

### Templates discoverability
- **Trainer dashboard banner** — shows when `programCount === 0`. Surfaces the existing 24-template library (migrations 005–006) to new coaches before they build from scratch.

### Password recovery
- **`/forgot-password`** (in `(auth)` route group) — email form, calls `supabase.auth.resetPasswordForEmail` with `redirectTo=/auth/callback?next=/reset`.
- **`/reset`** (in `(auth)` route group) — set new password, requires session from the callback's code exchange.
- **`/auth/callback`** — now honors `?next=` after `exchangeCodeForSession` (with `/`-prefix guard against open redirects).
- **`/login`** — "Forgot?" link wired next to the password field.

### Security hardening
- **`next.config.ts`** — global response headers: HSTS preload, X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy strict-origin-when-cross-origin, Permissions-Policy locking camera/mic/geolocation, X-DNS-Prefetch.
- **`/api/mindset/reflect`** — input clamping (1–10 score range), 500-char cap per free-text field, 5/IP/hour anon rate limit to block Anthropic cost abuse. Authed callers uncapped.
- **`scripts/scan-malware.sh`** — re-runnable signature scan for the npm postcss worm, sketchy `temp_*push*.bat` scripts, and embedded GitHub tokens in any `~/**/.git/config`.
- **`.gitignore`** — excludes `*.INFECTED-BACKUP`, `*.QUARANTINED`, `fix-*.mjs`, `run-migrations.mjs`.
- See **`SECURITY-URGENT.md`** for the malware findings + action list.

### Sidebar wiring
- Trainer: added **Mindset** + **Videos**.
- Trainee: added **Mindset**.

### Commits in this work
```
5f3a420  security: harden headers, rate-limit anon AI, add scan utility
632f4c6  feat: forgot-password + reset flow
0bed0d3  feat: mindset module, coach video upload, /free + /landing pages
1ade981  feat: add nutrition, onboarding, program builder, trainer invites + UI polish
```

---

## 2. What still needs human action (priority order)

### P0 — Security cleanup (≤15 min, see SECURITY-URGENT.md for details)
- [ ] **Revoke leaked GitHub token** at https://github.com/settings/tokens — single most important action.
- [ ] **Clear embedded tokens from 3 remaining `.git/config` files** (`~/social-listener`, `~/social-listener-ai`, `~/personal-site`). Commands in `SECURITY-URGENT.md`.
- [ ] **Rotate every credential that has lived on this Mac**: Supabase service-role + anon, Anthropic key, anything else in `.env*`. Update Vercel env vars after rotation.
- [ ] After all rotations: `bash scripts/scan-malware.sh` should print all-green.

### P1 — Run the new Supabase migrations (features won't work without these)
- [ ] **Run `supabase/migrations/010_mindset.sql`** in Supabase Dashboard → SQL Editor. Creates `mindset_checkins` + `public_mindset_checkins`.
- [ ] **Run `supabase/migrations/011_exercise_videos.sql`** — adds video columns to `program_exercises` and creates the `exercise-videos` storage bucket with RLS policies.
- [ ] **Confirm `ANTHROPIC_API_KEY` is set** in Vercel → Project Settings → Environment Variables. Without it, mindset reflection returns 503.
- [ ] **Add reset redirect URLs to Supabase Auth allow-list** (Authentication → URL Configuration → Redirect URLs):
  - `https://fitcoach-ai-beryl.vercel.app/auth/callback`
  - `https://fitcoach-ai-beryl.vercel.app/auth/callback?next=/reset`
  - `http://localhost:3000/auth/callback` (dev)

### P2 — Test the new flows in prod (after P1)
- [ ] Open `/free` → submit a check-in → confirm reflection renders + signup CTA shows.
- [ ] On `/login` click **Forgot?** → submit email → click reset link in inbox → set new password → land in `/auth/redirect`.
- [ ] Sign in as a trainer → `/trainer/videos` → upload a short mp4 → confirm preview works.
- [ ] Sign in as a trainee assigned to a program → `/trainee/workouts` → confirm "▶ Watch your coach's demo" appears.
- [ ] Trainee → `/trainee/mindset` → submit check-in → confirm reflection.
- [ ] Trainer → `/trainer/mindset` → confirm the trainee's check-in shows up in the table.
- [ ] Trainer with `programCount === 0` → confirm the "Copy a starter program template" banner appears on `/trainer/dashboard`.

### P3 — Followups from Sarah's feedback (build after she tests the app)
- [ ] **Pull her in-app feedback** — Sarah said she'd download and test. Capture concrete UX issues, then prioritize fixes.
- [ ] **Inline video upload in the program-builder UI** — currently `/trainer/videos` is a separate page; ideally trainers upload right where they add exercises in `/trainer/programs/[id]`.
- [ ] **Trainer weekly digest email** — auto-summarize each client's mindset trend at end of week (uses the existing `/trainer/mindset` data).
- [ ] **Push/email nudge for trainees to do today's mindset check-in** — only if they haven't already.
- [ ] **Template usage tracking** — count clones per template, surface most-popular to new trainers.

---

## 3. Backlog / nice-to-have (not blocking)

- **Persistent rate limit** — current in-memory limiter on `/api/mindset/reflect` resets on serverless cold start. If anonymous abuse becomes real, swap to a Supabase-counter-backed limiter (one row per IP per hour bucket).
- **Content Security Policy** — currently omitted because the app uses inline styles + inline `<style>` tags in the landing page. Audit and add a CSP header (probably `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'`) once we trim inline scripts.
- **Email confirmation copy** — signup flow lands users on `/signup?confirm=<email>` but there's no styled confirmation screen yet; right now they just see a query param.
- **Mindset visualizations** — sparkline of mood over 14 days on `/trainer/mindset` rows, instead of just numbers.
- **Coach video thumbnails** — schema column exists (`video_thumbnail_url`); auto-generation not built. Could ffmpeg-extract first frame on upload.
- **Brand consistency on `/free` and `/landing`** — both already match the home page, but a final visual pass would help conversion.

---

## 4. Where things live (file map)

```
src/app/
├── (auth)/
│   ├── forgot-password/page.tsx        ← password reset request
│   ├── reset/page.tsx                  ← set new password (requires recovery session)
│   ├── login/page.tsx                  ← updated with "Forgot?" link
│   └── signup/page.tsx
├── api/
│   └── mindset/reflect/route.ts        ← AI reflection + rate limit
├── auth/callback/route.ts              ← honors ?next= for password recovery
├── free/
│   ├── page.tsx                        ← public anon mindset tool
│   └── FreeMindsetClient.tsx
├── landing/page.tsx                    ← four-pillar marketing surface
├── trainee/mindset/
│   ├── page.tsx
│   └── MindsetCheckinClient.tsx
├── trainer/mindset/page.tsx            ← client trends overview
├── trainer/videos/
│   ├── page.tsx
│   └── VideoUploadClient.tsx
├── trainer/dashboard/page.tsx          ← +templates nudge banner
└── actions/
    ├── auth.ts                         ← +requestPasswordReset, updatePassword
    └── trainer.ts                      ← +setExerciseVideo, setExerciseVideoByName

src/components/sidebar.tsx              ← +Mindset (both roles), +Videos (trainer)
src/proxy.ts                            ← +/free, /landing, /forgot-password, /reset

supabase/migrations/
├── 010_mindset.sql                     ← RUN THIS in Supabase
└── 011_exercise_videos.sql             ← RUN THIS in Supabase

next.config.ts                          ← security headers
scripts/scan-malware.sh                 ← re-runnable malware/token scan
SECURITY-URGENT.md                      ← P0 security action list
STATUS.md                               ← this file
```

---

## 5. Production smoke check (one-liners)

```bash
# All security headers live?
curl -sI https://fitcoach-ai-beryl.vercel.app | grep -iE 'strict-transport|x-frame|x-content|referrer-policy|permissions-policy'

# Public routes serving?
for path in / /free /landing /login /forgot-password; do
  echo -n "$path → "
  curl -s -o /dev/null -w '%{http_code}\n' "https://fitcoach-ai-beryl.vercel.app$path"
done

# Disk clean?
bash ~/Projects/fitcoach-ai/scripts/scan-malware.sh
```
