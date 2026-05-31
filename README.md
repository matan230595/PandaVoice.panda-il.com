# Pandavoice 🐼

מערכת חכמה לתמלול דיבור לטקסט בזמן אמת עם עיבוד AI, תרגום לשפות ודיבור סינטטי.

## תכונות עיקריות

- 🎤 **הקלטת קול והמרה לטקסט** – תמלול דיבור בזמן אמת בעברית
- ✨ **עיבוד חכם עם AI** – תיקון, שיפור, סיכום, פרפרזה (Gemini, Groq, OpenAI)
- 🌐 **תרגום ל-8 שפות** – כולל זיהוי אוטומטי של שפת מקור
- 🔊 **הקראת טקסט (TTS)** – בקרה על מהירות, גובה צליל, סינון לפי שפה
- ↩️ **Undo/Redo** – 50 רמות היסטוריה, קיצור מקשים Ctrl+Z
- 💾 **שמירה אוטומטית בענן** + הקלטות נשמרות בשרת
- 📱 **שיתוף** – ווטסאפ, טלגרם, העתקה, הורדה
- 🌙 **מצב לילה** + ♿ **נגישות** + 🔤 **שליטה בגודל טקסט**

## טכנולוגיות

| שכבה | טכנולוגיה |
|---|---|
| Frontend | React 19, TypeScript 5.8, Tailwind CSS 3, Zustand 5 |
| Backend | Hono (Cloudflare Workers / Node.js) |
| Build | Vite 7, Wrangler 4 |
| Speech | Web Speech API (Recognition + Synthesis) |
| AI | Google Gemini, Groq, OpenAI |
| Database | Cloudflare D1 (SQLite) |
| Storage | Cloudflare R2 |
| Auth | Google OAuth (Mocha Users Service) |
| Tests | Vitest, @testing-library/react |

## מבנה הפרויקט

```
├── src/
│   ├── api/                  # API endpoints (ai, auth, recordings, translate)
│   ├── react-app/            # Frontend React
│   │   ├── components/       # רכיבים (Editor, Header, Footer, Toolbar, modals)
│   │   ├── pages/            # דפים (Home, AuthCallback)
│   │   ├── store/            # Zustand store עם persist
│   │   └── test/             # תשתית בדיקות
│   ├── worker/               # Cloudflare Worker entry point
│   └── shared/               # טיפוסים משותפים + Zod validation schemas
├── docs/
│   ├── todo.md               # רשימת משימות
│   └── qa-report.md          # דוח QA מפורט
├── public/                   # קבצים סטטיים (manifest.json, service-worker.js)
├── .github/workflows/ci.yml  # CI/CD
├── .gitignore
├── package.json
├── vite.config.ts
├── tsconfig.json             # 3 tsconfig targets: app, node, worker
├── wrangler.json             # Cloudflare Worker config
└── worker-configuration.d.ts # טיפוסי Environment/Bindings
```

## התקנה והרצה מקומית

```bash
# דרישות: Node.js 22+, npm
npm install

# הרצת שרת פיתוח (Vite dev server + Cloudflare Worker)
npm run dev

# בדיקות
npm test              # מצב watch
npm run test:run      # הרצה חד-פעמית

# בנייה לייצור
npm run build

# בדיקה מלאה (typecheck + build + dry-run deploy)
npm run check

# יצירת טיפוסי Worker מחדש (לאחר שינוי wrangler.json)
npm run cf-typegen
```

---

## 🚀 העלאה לשרת VPS עם Hestia

### אפשרות א': Frontend על VPS + Backend על Cloudflare Workers (מומלץ)

#### שלב 1: בניית הקבצים הסטטיים

```bash
npm ci
npm run cf-typegen    # טיפוסי Worker
npm run build         # dist/ נוצר בתיקיית
```

#### שלב 2: העלאה ל-Hestia

1. **Hestia → Web → Add Web Domain** → `pandavoice.panda-il.com`
2. **חיבור DNS**: תן ל-Hestia לנהל DNS (תקדימית A/AAAA ל-IP השרת)
3. **HTTPS**: Hestia → Web → Edit → Enable SSL (Let's Encrypt אוטומטי)
4. **העלאת הקבצים**: העלה את תוכן תיקיית `dist/` אל `/home/pandavoice/web/pandavoice.panda-il.com/public_html/`
5. **צור קובץ `.htaccess`** בתיקיית `public_html/`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

#### שלב 3: פריסת ה-Worker (Backend) ל-Cloudflare

```bash
# הגדר ב-wrangler.json את התצורה הנכונה
npm run cf-typegen
npx wrangler deploy
```

> **שים לב**: ה-API endpoints חייבים להיות נגישים מה-VPS. הוספנו CORS headers ב-`src/worker/index.ts` שיאפשרו גישה מ-`pandavoice.panda-il.com`.

---

### אפשרות ב': העברה מלאה ל-VPS (Node.js)

אפשרות זו דורשת התאמת ה-backend לריצה על Node.js במקום Cloudflare Workers.

#### שינויים נדרשים:

| רכיב | Cloudflare Workers | VPS (Node.js) |
|---|---|---|
| Web server | Hono (Worker) | Hono + `@hono/node-server` |
| Database | D1 (Cloudflare) | SQLite (`better-sqlite3`) |
| Storage | R2 (Cloudflare) | תיקייה מקומית |
| Auth | Mocha Users Service | JWT + Google OAuth |
| Environment | `c.env.BINDING` | `process.env` |

#### התקנת תלויות נוספות:

```bash
npm install @hono/node-server better-sqlite3 jsonwebtoken google-auth-library
npm install -D @types/better-sqlite3 @types/jsonwebtoken
```

#### קובץ server.ts (Node.js entry point):

```typescript
import { serve } from "@hono/node-server";
import { readFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import app from "./src/worker/index";

// SQLite במקום D1
import Database from "better-sqlite3";
const db = new Database(join(__dirname, "data", "pandavoice.db"));
if (!existsSync(join(__dirname, "data"))) mkdirSync(join(__dirname, "data"));

// צור טבלה במידה ולא קיימת
db.exec(`
  CREATE TABLE IF NOT EXISTS recordings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    title TEXT,
    audio_key TEXT NOT NULL,
    duration_seconds REAL,
    file_size_bytes INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// ... הוסף middleware להזרקת DB ו-R2 ל-c.env

serve({ fetch: app.fetch, port: 3001 });
```

#### ניהול תהליך עם PM2:

```bash
npm install -g pm2
pm2 start dist/server.js --name pandavoice
pm2 save
pm2 startup
```

#### קביעת Hestia Proxy:

ב-Hestia:
1. **Web → pandavoice.panda-il.com → Advanced Settings**
2. **Proxy Template**: Node.js
3. **Proxy Port**: `3001`
4. **Document Root**: `/home/pandavoice/web/pandavoice.panda-il.com/public_html`

או, הגדר Nginx proxy manually ב-`/home/pandavoice/conf/web/nginx.pandavoice.panda-il.com.conf`:

```nginx
location /api/ {
  proxy_pass http://127.0.0.1:3001;
  proxy_http_version 1.1;
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection 'upgrade';
  proxy_set_header Host $host;
  proxy_cache_bypass $http_upgrade;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Forwarded-Proto $scheme;
}
```

---

## 🧪 בדיקות

```bash
npm run test:run          # הרצת כל הבדיקות
npm test                  # מצב watch
npm run lint              # ESLint
npm run knip              # בדיקת dead code
npm run check             # typecheck + build + dry-run deploy
```

### סוגי בדיקות קיימים:
- **types.test.ts** – Zod validation schemas (15 tests)
- **useAppStore.test.ts** – State management (10 tests)
- **Modal.test.tsx** – Component rendering (2 tests)

---

## 🔐 הגדרות API נדרשות

יש להגדיר לפחות מפתח API אחד לשימוש ב-AI ותרגום דרך ממשק ההגדרות:

- **Google Gemini** – [חינמי, מומלץ](https://makersuite.google.com/app/apikey)
- **Groq** – [חינמי, המהיר ביותר](https://console.groq.com/keys)
- **OpenAI** – [בתשלום](https://platform.openai.com/api-keys)

---

## 📋 Status: Production Ready 🟢

- [x] `.gitignore` מלא
- [x] TypeScript strict mode (ZERO `as any`)
- [x] Error Boundary לכל האפליקציה
- [x] Undo/Redo + Ctrl+Z/Shift+Ctrl+Z
- [x] Auto-detect שפת מקור בתרגום
- [x] Progress Bar ל-TTS
- [x] API Key validation + Test Connection
- [x] Admin panel מוגן באימות
- [x] ולידציה: אימייל, טלפון, API keys
- [x] מסמכים משפטיים מלאים (נגישות, תקנון, פרטיות)
- [x] CORS headers לפריסה על דומיין מותאם אישית
- [x] AbortSignal timeout ל-AI requests
- [x] Service Worker + PWA manifest
- [x] CI/CD (GitHub Actions: lint, typecheck, test, build)
- [x] Vitest + @testing-library/react (27+ tests)

---

## רישיון

כל הזכויות שמורות ל-פנדה סוכנות דיגיטל © 2026 מתן אלקיים

**מפותח על ידי פנדה סוכנות דיגיטל 🐼**
