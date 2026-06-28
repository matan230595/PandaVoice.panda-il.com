# Deploy ל-Coolify — PandaVoice

## שלב 1: עדכן את ה-repo ב-GitHub

ה-remote כבר מוגדר: `https://github.com/matan230595/PandaVoice.panda-il.com.git`

```bash
# בתיקיית הפרויקט
git add .
git commit -m "feat: production hardening — Docker, tests, security, docs"
git push origin master
```

---

## שלב 2: הוסף Resource ב-Coolify

1. פתח **Coolify** → Project → **+ New Resource**
2. בחר **Public Repository** (או Private עם token)
3. הדבק: `https://github.com/matan230595/PandaVoice.panda-il.com.git`
4. Branch: `master`
5. Build Pack: **Dockerfile** (Coolify יזהה אוטומטית את `Dockerfile`)

---

## שלב 3: הגדרת Environment Variables

ב-Coolify → Resource → **Environment Variables**, הוסף:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `3000` |
| `DATA_DIR` | `/app/data` |
| `AUDIO_DIR` | `/app/data/audio` |

---

## שלב 4: Persistent Volumes (חובה!)

ב-Coolify → Resource → **Storages**, הוסף:

| Source (Host) | Destination (Container) | תיאור |
|---------------|------------------------|-------|
| `/data/pandavoice` | `/app/data` | SQLite DB + הקלטות |

> **⚠️ חובה לפני Deploy ראשון!** בלי זה, כל restart מוחק את כל הנתונים.

---

## שלב 5: Port ו-Domain

- **Port**: `3000`
- **Domain**: הכנס את הדומיין שלך (למשל: `pandavoice.panda-il.com`)
- Coolify יגדיר SSL אוטומטית דרך Let's Encrypt

---

## שלב 6: Deploy

לחץ **Deploy** — Coolify יעשה:
1. `git clone` מה-repo
2. `docker build` לפי ה-Dockerfile
3. הרצת container עם ה-env vars והvolumes

---

## Health Check

הapp מגדיר health check אוטומטי: `GET /api/health` → `{ "status": "ok" }`  
Coolify ישתמש בזה לניטור זמינות.

---

## עדכון גרסה (לאחר שינויים)

```bash
git add .
git commit -m "feat: ..."
git push
```

ב-Coolify → **Redeploy** (או הגדר Auto-Deploy על push).

---

## Troubleshooting

| בעיה | פתרון |
|------|-------|
| `better-sqlite3` fails | וודא שה-Docker image הוא `node:22-slim` |
| נתונים נמחקו | וודא שה-Volume מוגדר לפני Deploy הראשון |
| 500 error | בדוק logs: Coolify → Logs |
| Port conflict | שנה PORT ל-3001 אם 3000 תפוס |
