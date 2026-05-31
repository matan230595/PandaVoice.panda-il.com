# Todo

## הושלם (Production Readiness Improvements)
- 🔒 אבטחה: אימות מנהל ל-AdminModal + ולידציה לשדות קלט (API keys, אימייל, טלפון)
- 🧹 ניקוי: הוסר `.gitignore`, הוחלפו כל `as any` בטיפוסים אמיתיים
- 📦 תשתית: נוסף `worker-configuration.d.ts` (Env types), ErrorBoundary
- ♻️ UX: Undo/Redo לעורך, Auto-detect שפת מקור בתרגום, Progress Bar ל-TTS
- 📜 משפטי: הצהרת נגישות, תנאי שימוש ומדיניות פרטיות מלאים
- 🧪 בדיקות: Vitest setup + טסטים ל-types, store, Modal
- 🔄 CI/CD: GitHub Actions workflow (lint, typecheck, test, build)
- 🐛 תקונים: `onKeyPress` → `onKeyDown`, תיקון `BrowserRouter` import deprecated

## לביצוע
- [#16] הוספת onboarding flow למשתמשים חדשים
- [#17] הוספת יכולת עריכת כותרות הקלטות
- [#18] הצגת משך הקלטה (duration)
- [#21] תיקון בעיית עצירה אוטומטית בהקלטות
- [#22] קיבוץ הקלטות לפי שיחה
- [#23] תמיכה בזיהוי דיבור מעורב עברית/אנגלית
