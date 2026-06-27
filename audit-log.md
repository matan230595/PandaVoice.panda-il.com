# PandaVoice — Export/Import Audit Log

Generated: 2026-06-28

---

## src/shared/

**types.ts** — Zod validation schemas shared between client and server.

| Symbol | Kind | Consumers |
|--------|------|-----------|
| `AIRequestSchema` | export const (Zod) | `src/server/routes/ai.ts` |
| `TranslateRequestSchema` | export const (Zod) | `src/server/routes/translate.ts` |
| `AIRequest` | export type | unused (available for client use) |
| `TranslateRequest` | export type | unused |

**Imports in types.ts:** `zod`

**Notes:** No circular deps. Client-side code does NOT import from `@/shared/types` — it constructs request bodies ad-hoc in modals. The types are only enforced server-side.

---

## src/server/

### db.ts

| Symbol | Kind | Consumers |
|--------|------|-----------|
| `initDB()` | export function | `src/server/index.ts` |
| `getDB()` | export function | `src/server/routes/recordings.ts` |

**Imports:** `better-sqlite3`, `path`, `fs`

**Schema created:**
```sql
users(id, name, email, created_at)
sessions(id, user_id, created_at, expires_at)
recordings(id, user_id, title, audio_key, duration_seconds, file_size_bytes, created_at)
```

**Notes:** `users` and `sessions` tables are created but never written to — legacy schema from Mocha auth era. Only `recordings` is used.

---

### index.ts

| Symbol | Kind | Consumers |
|--------|------|-----------|
| (default export) | Hono app → node server | entrypoint |

**Imports:**
- `hono`, `@hono/node-server` (serveStatic, serve)
- `@/server/db` (initDB)
- `@/server/routes/ai`, `translate`, `recordings`

**Routes registered:**
```
GET  /api/users/me        → static local user
GET  /api/health          → timestamp
POST /api/ai              → aiRoutes
POST /api/translate       → translateRoutes
*    /api/recordings/*    → recordingsRoutes
/*   (static)             → serveStatic from dist/
/*   (fallback)           → index.html SPA
```

**Notes:** `serveStatic` added to fix critical asset-serving bug (assets/ dir was returning index.html for every JS/CSS request).

---

## src/server/routes/

### ai.ts

| Symbol | Kind | Consumers |
|--------|------|-----------|
| `default` (Hono app) | export | `src/server/index.ts` |

**Imports:** `hono`, `@/shared/types` (AIRequestSchema)

**Routes:** `POST /ai`

**Providers supported:** gemini, groq, openai

**Security notes:**
- ✅ Zod validation on all inputs
- ✅ 30s AbortSignal timeout
- ⚠️ API key passes through server in request body (vs. client calling AI directly)
- ❌ No rate limiting

---

### translate.ts

| Symbol | Kind | Consumers |
|--------|------|-----------|
| `default` (Hono app) | export | `src/server/index.ts` |

**Imports:** `hono`, `@/shared/types` (TranslateRequestSchema)

**Routes:** `POST /translate`

**Providers:** gemini, groq (OpenAI not wired here despite being in types)

**Security notes:** Same as ai.ts — API key in request body, no rate limiting.

---

### recordings.ts

| Symbol | Kind | Consumers |
|--------|------|-----------|
| `default` (Hono app) | export | `src/server/index.ts` |

**Imports:** `hono`, `fs` (readFileSync, writeFileSync, unlinkSync, existsSync, mkdirSync), `path`, `@/server/db` (getDB)

**Routes:**
```
POST   /upload     → save audio to data/audio/ + DB insert
GET    /list       → query SQLite, return array
GET    /:id/audio  → read file, return binary
DELETE /:id        → delete file + DB row
```

**Security notes:**
- ✅ `user_id = 'local'` on all queries — prevents cross-user access (in a single-user system, not relevant but correct)
- ✅ DB lookup before filesystem access — prevents arbitrary file reads
- ⚠️ Sequential integer IDs are enumerable (not exploitable in single-user setup)
- ❌ No file size limit on upload
- ❌ No mime-type validation on upload

---

## src/react-app/store/

### useAppStore.ts

| Symbol | Kind | Consumers |
|--------|------|-----------|
| `useAppStore` | export const (Zustand) | Header, Footer, Editor, Toolbar, all modal components |

**Imports:** `zustand`, `zustand/middleware` (persist)

**State shape:**
```typescript
config: AppConfig          // brand, fonts, legal text, feature flags
content: string            // current editor text
isDarkMode: boolean
isRecording: boolean
isSpeaking: boolean
apiKeys: { gemini, groq, hf, openai, claude, fbKey, fbProj }
ttsSettings: { rate, pitch, voice, langFilter }
seenOnboarding: boolean
```

**Persisted:** All state via `localStorage['pandavoice-storage']`

**Notes:**
- API keys stored in localStorage — passes through server request body to AI APIs (contradiction with privacy policy which says keys never leave browser)
- `hf` (HuggingFace), `claude`, `fbKey`, `fbProj` keys exist in state but no corresponding API route uses them — dead state

---

## src/react-app/hooks/

### useAuth.tsx

| Symbol | Kind | Consumers |
|--------|------|-----------|
| `AuthProvider` | export function | `src/react-app/App.tsx` |
| `useAuth()` | export function | Header, AdminModal, LoginModal, AuthCallback, Home |

**Imports:** React (createContext, useContext, useState, useEffect, useCallback)

**Behavior:**
- On mount: `GET /api/users/me` → sets user state
- If null → `LoginModal` renders (blocks app)
- `login()` → calls `GET /api/oauth/google/redirect_url` (NOT implemented — dead code)
- `logout()` → sets user to null (no server call)

**Notes:**
- Auth is now bypass-mode: `/api/users/me` returns static user, so login never blocks
- `AuthCallbackPage` (`/auth/callback`) is unused (Google OAuth never configured)
- `login()` function is dead but still rendered in LoginModal — should be removed or replaced

---

## src/react-app/pages/

### Home.tsx

**Imports:** React, react-hot-toast, useAuth, useAppStore, Header, Toolbar, Editor, Footer, all 9 modals

**Responsibilities:** Modal state orchestration, font loading (Google Fonts via useEffect), onboarding logic

**Notes:** Large component (modal-coordinator pattern). Consider extracting modal state to useAppStore if it grows.

### AuthCallback.tsx

**Imports:** React, react-router, useAuth

**Notes:** Dead page — `/auth/callback` route exists but Google OAuth was never configured. Safe to delete or keep as stub.

---

## src/react-app/components/

### Editor.tsx

**Imports:** React hooks, lucide-react, useAppStore, react-hot-toast

**Responsibilities:** MediaRecorder for audio capture, upload to `/api/recordings/upload`, text editor (contenteditable div)

**Notes:** Uses `navigator.mediaDevices.getUserMedia` — browser API, not available in SSR. Text content stored in Zustand (`setContent`).

### RecordingsModal.tsx

**Imports:** React hooks, lucide-react, react-hot-toast

**Responsibilities:** Fetch `/api/recordings/list`, play/download/delete recordings

**Notes:** Does NOT use Zustand — makes direct fetch calls. Inconsistent with other modals.

### modals/Modal.tsx

**Imports:** React, lucide-react

**Base modal component.** All other modals wrap this. Has `size` prop: `'sm'|'md'|'lg'|'xl'`.

---

## Dependency Graph — Critical Paths

```
User Input
  ↓ mediaRecorder (Editor.tsx)
  → POST /api/recordings/upload
    → getDB() → SQLite INSERT
    → writeFileSync → data/audio/

  ↓ text editor (Editor.tsx)
  → useAppStore.setContent()
  → Zustand persist → localStorage

  ↓ AI modal submit (AIModal.tsx)
  → POST /api/ai { text, prompt, apiKey, provider }
    → fetch() → Gemini/Groq/OpenAI
    → response → modal display

  ↓ Translate (TranslateModal.tsx)
  → POST /api/translate { text, sourceLang, targetLang, apiKey, provider }
    → fetch() → Gemini/Groq

  ↓ TTS (TTSModal.tsx)
  → window.speechSynthesis (browser native, no server call)
```

---

## Circular Dependency Check

None found. Dependency graph is a clean DAG:
```
shared/types ← server/routes/* ← server/index
react-app/store ← react-app/components/* ← react-app/pages/* ← react-app/App
```

---

## Dead Code Inventory

| File | Dead Symbol | Reason |
|------|-------------|--------|
| `server/db.ts` | `users` table | Written by initDB but never used |
| `server/db.ts` | `sessions` table | Same |
| `store/useAppStore.ts` | `hf`, `claude`, `fbKey`, `fbProj` keys | No API route consumes them |
| `hooks/useAuth.tsx` | `login()` function | Calls nonexistent Google OAuth route |
| `pages/AuthCallback.tsx` | Entire file | OAuth callback route unused |
