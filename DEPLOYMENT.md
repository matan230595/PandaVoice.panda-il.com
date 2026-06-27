# מדריך לפריסה של PandaVoice

## דרישות מוקדמות

- Node.js 22 LTS
- PM2 (התקנה עם `npm install -g pm2`)
- VPS עם Ubuntu/Debian (או systems אחרים)

## הגדרת VPS

1. הפעל את סקריפט ההגדרה:
   ```bash
   bash setup-vps.sh
   ```

2. העלה את קבצי הפרויקט לתיקייה `/var/www/pandavoice.panda-il.com`

3. צור קובץ `.env` עם התוכן:
   ```
   PORT=3000
   NODE_ENV=production
   ```

4. התקן תלויות ובנה:
   ```bash
   npm install
   npm run build:all
   ```

5. הפעל עם PM2:
   ```bash
   npm run pm2:start
   ```

## פיתוח מקומי

```bash
npm run dev          # הפעל את שרת הפיתוח של Vite
npm run dev:server   # בנה והפעל את שרת Node.js
```

## פקודות PM2

```bash
npm run pm2:start    # הפעל את השרת
npm run pm2:stop     # עצור את השרת
npm run pm2:restart  # הפעל מחדש את השרת
npm run pm2:logs     # צפה ביומנים
```

## פלט הבנייה

- Client: `dist/client/`
- Server: `dist/server/`

## הערות

- קבצי טיפוסים של Cloudflare Workers זמינים עדיין ב-`worker-configuration.d.ts`
- מודולים נטיבים (better-sqlite3, esbuild) דורשים כלים לבנייה ב-VPS
- PM2 מנהל את תהליך שרת Node.js באופן אוטומטי
