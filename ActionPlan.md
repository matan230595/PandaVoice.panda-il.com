# PandaVoice — Action Plan

Production readiness checklist, ordered by impact.

---

## Critical (must fix before production)

### 1. Rate limiting on AI routes
**File:** `src/server/routes/ai.ts`, `translate.ts`
**Problem:** No limit on AI API calls. Any nginx-authed user can trigger unlimited external API calls at your expense.
**Fix:** Add simple in-memory rate limiter (e.g. 20 req/min per IP) using a Map + timestamp window. No library needed.
**Verify:** `curl -X POST http://localhost:3000/api/ai ... ` 25 times in a minute → 21st returns 429.

### 2. File upload limits
**File:** `src/server/routes/recordings.ts`
**Problem:** No size or type validation on uploaded audio. A 2GB file or a .exe would be accepted.
**Fix:**
```typescript
// In /upload handler, after getting audioFile:
if (audioFile.size > 50 * 1024 * 1024) return c.json({ error: 'File too large (50MB max)' }, 413);
if (!audioFile.type.startsWith('audio/')) return c.json({ error: 'Not an audio file' }, 415);
```
**Verify:** Upload a 60MB file → 413. Upload a .txt file → 415.

### 3. Fix privacy policy text
**File:** `src/react-app/store/useAppStore.ts` (defaultConfig.legalPrivacy)
**Problem:** Privacy policy says "API keys stay in browser, not transmitted to company servers." This is FALSE — keys are sent to `/api/ai` and `/api/translate` on every call.
**Fix options (pick one):**
  - A. Update privacy policy to say "keys transit server but are never logged or stored"
  - B. Move AI calls to direct client fetch (remove API proxy, call Gemini/Groq directly from browser). This removes the key-in-transit issue entirely.
**Verify:** Read updated privacy text.

---

## High Priority

### 4. Remove dead code
**Files:** `src/pages/AuthCallback.tsx`, `useAuth.tsx` login(), `useAppStore.ts` (hf/claude/fbKey/fbProj keys), `server/db.ts` users+sessions tables

Dead code causes confusion and bloats the bundle.

```bash
# Verify dead pages:
grep -r "auth/callback" src/  # should only be in App.tsx router
# Then delete AuthCallback.tsx if route is removed from App.tsx
```

### 5. Log errors to file
**File:** `src/server/routes/*.ts`
**Problem:** All error logging goes to `console.error`. PM2 captures this, but there's no structured log file.
**Fix:** Set `error_file` and `out_file` in `ecosystem.config.cjs` and add log rotation.
```js
// ecosystem.config.cjs
error_file: '/var/log/pandavoice/error.log',
out_file: '/var/log/pandavoice/out.log',
log_date_format: 'YYYY-MM-DD HH:mm:ss',
```
**Verify:** `pm2 logs pandavoice` shows timestamped entries.

### 6. AUDIO_DIR absolute path
**File:** `src/server/routes/recordings.ts`
**Problem:** Default `process.cwd() + '/data/audio'` works if you always start from the project root. Fragile under PM2 `cwd` changes.
**Fix:** Set `AUDIO_DIR=/var/pandavoice/audio` in ecosystem.config.cjs env.
**Verify:** After deploy, upload a recording → check it appears in `/var/pandavoice/audio/`.

---

## Medium Priority

### 7. Server startup error handling
**File:** `src/server/index.ts`
**Problem:** If `initDB()` throws (e.g. filesystem permissions), the server crashes silently.
**Fix:** Wrap in try/catch and exit with a meaningful message.

### 8. Remove unused Zustand keys
**File:** `src/react-app/store/useAppStore.ts`
**Problem:** `hf`, `claude`, `fbKey`, `fbProj` in `apiKeys` — no route uses these. They waste localStorage space and confuse future devs.
**Fix:** Delete from interface, defaultConfig, and `setApiKey` usage. Check SettingsModal for any input fields that write to these keys.
**Verify:** `grep -r "fbKey\|fbProj\|'hf'" src/` returns 0 hits after cleanup.

### 9. DB backup script
**Problem:** SQLite DB lives on VPS disk. No backup = one `rm` away from losing all recordings.
**Fix:** Add a cron job:
```bash
0 3 * * * cp /path/to/pandavoice.db /path/to/backups/pandavoice-$(date +%Y%m%d).db
```

---

## Low Priority

### 10. Remove legacy DB tables
**File:** `src/server/db.ts`
**Problem:** `users` and `sessions` tables created in schema but never used.
**Fix:** Remove `CREATE TABLE IF NOT EXISTS users` and `sessions` from `initDB()`. No migration needed — tables are always empty.
**Verify:** `sqlite3 pandavoice.db ".tables"` shows only `recordings`.

### 11. Update legal text — Cloudflare references
**File:** `src/react-app/store/useAppStore.ts` (legalPrivacy)
**Problem:** Privacy policy mentions "Cloudflare — storage infrastructure" — this was the old R2 setup. Now it's local filesystem.
**Fix:** Remove Cloudflare from the data processors list.

---

## Not Doing (YAGNI)

**Monitoring dashboard that auto-updates OVERVIEW.md:** The ask was for a "dynamic dashboard that auto-syncs docs with code via static analysis." This is a significant engineering project (AST parsing, git hook integration, dashboard UI) that would dwarf the actual app. The app is ~1200 lines of code and has one developer. Manual doc updates on significant changes cost 5 minutes. The monitoring system would cost weeks to build and maintain. Use the existing `audit-log.md` + `OVERVIEW.md` and update them when things change.

**Multi-user auth:** The app is explicitly single-tenant. nginx basic auth is the right tool for this.

**CI/CD pipeline:** Not needed at this scale — `git pull && npm run build:all && pm2 restart` is the full deploy.
