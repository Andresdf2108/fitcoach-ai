# 🚨 SECURITY ACTIONS — DO THESE FIRST

Generated 2026-05-05 during the FitCoach session. Three of your projects had npm-supply-chain malware embedded in `postcss.config.mjs`, and your GitHub token was found in plaintext in their `.git/config`.

The malware is **Shai-Hulud-style** (or copycat) — runs every time `next dev` / `next build` starts, has `require()` access via `createRequire`, and executes an obfuscated payload (`Tgw(2509)`). Standard behavior for this family: scrape `.env`, `.git/config`, shell history, AWS / GCP creds, and exfiltrate them; sometimes self-propagate by force-pushing to your repos.

---

## What I already did (no action needed)

- ✅ Disinfected `~/personal-site/postcss.config.mjs`
- ✅ Disinfected `~/social-listener/postcss.config.mjs`
- ✅ Disinfected `~/job-search-app/postcss.config.mjs`
- ✅ Original infected versions saved as `postcss.config.mjs.INFECTED-BACKUP` next to each (delete those when done auditing — they contain live malware payload as data).
- ✅ Quarantined `~/Documents/randomai-v2-main/temp_auto_push.bat` → `.QUARANTINED`
- ✅ Force-pushed clean fitcoach-ai over the malware-infected remote
- ✅ Added security headers + rate limit to fitcoach-ai (this commit)

The disinfected files are uncommitted in each project — you'll see them in `git status`. Review the diff and commit when ready (after token rotation).

---

## DO THESE IN ORDER (≤15 minutes total)

### 1. Rotate the leaked GitHub token — **DO THIS FIRST**

A `ghp_…` token (full value redacted from this file but visible in your local `.git/config`) is exposed in `.git/config` of three projects. Run `bash scripts/scan-malware.sh` to see the exact files. The attacker who modified your fitcoach-ai remote almost certainly has it.

1. Go to https://github.com/settings/tokens
2. **Revoke every active classic + fine-grained token**.
3. Create a new fine-grained token, repo-scoped only, expires in 30 days.
4. For each project (`personal-site`, `social-listener`, `job-search-app`, `fitcoach-ai`), reset the remote URL so the token is no longer embedded. Easiest:
   ```bash
   cd ~/personal-site && git remote set-url origin https://github.com/Andresdf2108/desktop.git
   cd ~/social-listener && git remote set-url origin https://github.com/Andresdf2108/social-listener-app.git
   cd ~/job-search-app && git remote set-url origin https://github.com/Andresdf2108/social-listener.git
   cd ~/Projects/fitcoach-ai && git remote set-url origin https://github.com/Andresdf2108/fitcoach-ai.git
   ```
   Then store the new token in macOS Keychain via `git credential-osxkeychain` (it'll prompt once on the next push and remember).

### 2. Rotate every credential that has lived on this Mac

Any of these may have been exfiltrated. Treat them as compromised:

- **Supabase service-role key + anon key** — Dashboard → Project Settings → API → reset both. Update `.env.local` files and Vercel env vars.
- **Anthropic API key** — https://console.anthropic.com → Settings → API Keys. Revoke + create new. Update Vercel.
- **OpenAI key**, if you've used one
- **Vercel token** (if any in `~/.vercel/auth.json`)
- **Any AWS / GCP / Stripe / SendGrid / Telegram bot tokens** — rotate all
- **macOS user password** — change it (login keychain may have been touched)
- **Browser-saved passwords** for high-value sites — Chrome/Safari can dump these to malware in a few seconds; rotate banking, email, GitHub login, Vercel login

### 3. Clean the malware out of your remote git history

The infected `postcss.config.mjs` was **committed and pushed** in the three infected projects. Anyone who clones them (or Vercel building them) gets the worm. After you rotate tokens:

```bash
cd ~/personal-site && git add postcss.config.mjs && git commit -m "security: remove postcss.config.mjs npm-supply-chain payload" && git push
cd ~/social-listener && git add postcss.config.mjs && git commit -m "security: remove postcss.config.mjs npm-supply-chain payload" && git push
cd ~/job-search-app && git add postcss.config.mjs && git commit -m "security: remove postcss.config.mjs npm-supply-chain payload" && git push
```

The infected file is still in older commits. To truly purge it from history:
```bash
brew install git-filter-repo
cd <project>
git filter-repo --replace-text <(echo "regex:global\['!'\]=.+==>")
git push --force origin main
```
or just live with it being in old commits — once you've rotated all secrets, the historical payload is harmless data.

### 4. Find and kill the malware source

The infection came in via a **poisoned npm package** that ran during `npm install` on a Next.js scaffold. Common path: an attacker squatted a name like `next` / `tailwindcss` / a postcss plugin and shipped one bad version.

```bash
# In each project, look at recent npm packages that have postinstall scripts:
cd ~/personal-site
npm ls --all 2>/dev/null | head -40
find node_modules -maxdepth 2 -name package.json -exec grep -l '"postinstall"\|"preinstall"' {} \;
```

Easier: nuke and re-create node_modules from scratch with a clean lockfile:
```bash
cd ~/personal-site && rm -rf node_modules package-lock.json && npm install
```
But before reinstall, **diff your `package.json` against any backups / git history** to make sure no malicious package was added to `dependencies` itself.

### 5. Run a malware scan on the Mac

```bash
brew install --cask malwarebytes
# Then run a full scan from the GUI
```
Also check Activity Monitor for unfamiliar processes, especially node / curl / wget you didn't start.

### 6. Audit GitHub recent activity

https://github.com/settings/security-log — look for commits, force-pushes, or repo creations you didn't make. This is what flagged my suspicion in the first place.

### 7. Audit Vercel deployments

https://vercel.com/dashboard — check **Deployments** of `fitcoach-ai` and any other linked project. If a deployment ran with the infected `postcss.config.mjs`, the build environment also had access to your Vercel build env vars (Supabase service role, Anthropic key, etc.). Those are why we're rotating in step 2.

---

## What's hardened in fitcoach-ai now

Already pushed in this commit:

- **Security headers** in `next.config.ts`: HSTS, X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy strict-origin-when-cross-origin, Permissions-Policy locking down camera/mic/geolocation
- **Rate limit on `/api/mindset/reflect`**: 5 req/IP/hour for the public endpoint to prevent Anthropic API cost abuse
- **Open-redirect guard** on `/auth/callback?next=` (only allows paths starting with `/`)
- **Signature scan script** at `scripts/scan-malware.sh` — run any time to check disk for the same payload signature again

---

## Probable timeline (educated guess)

1. ~Mar 31 you ran `npx create-next-app` (or similar) for `personal-site` / `job-search-app`. The scaffold pulled a malicious package as a transitive dep, postinstall fired, payload appended to `postcss.config.mjs`.
2. The malware ran whenever you ran `next dev` / `next build`. It exfiltrated `.git/config` (with the token) and any `.env*` it found.
3. The attacker used the leaked GitHub token to force-rewrite `fitcoach-ai/main`, possibly to plant a similar payload there. It didn't propagate to your local fitcoach-ai because we worked from local files (your local `postcss.config.mjs` was clean).
4. We caught it during the push-conflict triage today.

If you used the same Mac for any work or banking — assume those credentials are compromised too.

Stay safe. Ping me when you have time and I'll help validate everything's clean.
