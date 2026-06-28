# Deploy ל-Coolify — PandaVoice
# דומיין סופי: book.panda-il.online

## שלב 1: GitHub — ה-repo מוכן

ה-remote כבר מוגדר: `https://github.com/matan230595/PandaVoice.panda-il.com.git`
ה-branch הנכון: `main`

---

## שלב 2: הוסף Resource ב-Coolify

1. פתח **Coolify** → Project → **+ New Resource**
2. בחר **Public Repository** (או Private עם token)
3. הדבק: `https://github.com/matan230595/PandaVoice.panda-il.com.git`
4. Branch: `main`
5. Build Pack: **Dockerfile** (Coolify יזהה אוטומטית)

---

## שלב 3: Environment Variables

ב-Coolify → Resource → **Environment Variables**, הוסף:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `3000` |
| `DATA_DIR` | `/app/data` |
| `AUDIO_DIR` | `/app/data/audio` |
| `GOOGLE_CLIENT_ID` | ← מ-Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | ← מ-Google Cloud Console |
| `GOOGLE_REDIRECT_URI` | `https://book.panda-il.online/api/oauth/google/callback` |

---

## שלב 4: Persistent Volume (חובה לפני Deploy!)

ב-Coolify → Resource → **Storages**, הוסף:

| Source (Host) | Destination (Container) |
|---------------|------------------------|
| `/data/pandavoice` | `/app/data` |

> **⚠️ חובה לפני Deploy הראשון!** בלי זה — כל restart מוחק את כל הנתונים והקלטות.

---

## שלב 5: Domain

- **Port**: `3000`
- **Domain**: `book.panda-il.online`
- Coolify יגדיר SSL אוטומטית דרך Let's Encrypt

---

## שלב 6: Deploy

לחץ **Deploy** — Coolify יעשה:
1. `git clone` מה-repo
2. `docker build` לפי ה-`Dockerfile`
3. הרצת container עם ה-env vars + volume

---

## Health Check

הapp מגדיר health check אוטומטי:
`GET /api/health` → `{ "status": "ok" }`

---

## עדכון גרסה

```bash
git add .
git commit -m "feat: ..."
git push origin main
```

ב-Coolify → **Redeploy** (או הגדר Auto-Deploy על push).

---

## Troubleshooting

| בעיה | פתרון |
|------|-------|
| `better-sqlite3` fails to compile | וודא שה-Docker image הוא `node:22-slim` (כבר מוגדר) |
| נתונים נמחקו | וודא שה-Volume `/data/pandavoice → /app/data` מוגדר לפני Deploy הראשון |
| 500 error | Coolify → Logs |
| Port conflict | שנה `PORT` ל-`3001` אם `3000` תפוס |
| OAuth לא עובד | וודא ש-`GOOGLE_REDIRECT_URI` ב-Coolify = `https://book.panda-il.online/api/oauth/google/callback` |
