# PandaVoice API Documentation

Base URL: `https://dev.panda-il.com` (production) | `http://localhost:3000` (local)

All protected routes require an active session cookie (`session`) obtained via login.

---

## Authentication

### POST /api/auth/register
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "min8chars",
  "name": "שם המשתמש"
}
```

**Responses:**
- `201 Created` — `{ "id": "uuid", "email": "...", "name": "..." }` + sets `session` cookie
- `400 Bad Request` — missing fields / password too short (<8) or too long (>128)
- `409 Conflict` — email already registered

---

### POST /api/auth/login
Authenticate an existing user.

**Rate limit:** 10 attempts per email+IP per 15 minutes.

**Request Body:**
```json
{ "email": "user@example.com", "password": "password123" }
```

**Responses:**
- `200 OK` — `{ "id": "uuid", "email": "...", "name": "..." }` + sets `session` cookie
- `400 Bad Request` — missing fields
- `401 Unauthorized` — wrong email/password
- `429 Too Many Requests` — rate limit exceeded

---

### POST /api/auth/logout
End the current session.

**Responses:**
- `200 OK` — `{ "ok": true }` + clears `session` cookie

---

### GET /api/users/me
Get the authenticated user's profile. 🔒 Protected

**Responses:**
- `200 OK` — `{ "id": "uuid", "email": "...", "name": "...", "avatar": null }`
- `401 Unauthorized`

---

## System

### GET /api/health
Health check (public).

**Response:** `{ "status": "ok", "timestamp": "2026-06-28T..." }`

---

## AI Processing 🔒 Protected

**Rate limit:** 20 requests/minute per IP.

### POST /api/ai
Process text with an AI provider (Gemini / Groq / OpenAI).

**Request Body:**
```json
{
  "prompt": "תקן שגיאות כתיב",
  "text": "הטקסט לעיבוד (עד 50,000 תווים)",
  "apiKey": "המפתח API של המשתמש",
  "provider": "gemini" | "groq" | "openai"
}
```

**Response:** `{ "result": "הטקסט המעובד" }`

**Errors:** `400` (validation) | `401` (not authenticated) | `429` (rate limit) | `502` (upstream AI error)

---

### POST /api/translate
Translate text using an AI provider. 🔒 Protected

**Request Body:**
```json
{
  "text": "Text to translate (up to 50,000 chars)",
  "sourceLang": "auto" | "he" | "en" | "ar" | "ru" | "es" | "fr" | "de" | "it",
  "targetLang": "en",
  "apiKey": "user's API key",
  "provider": "gemini" | "groq" | "openai"
}
```

**Response:** `{ "translation": "הטקסט המתורגם" }`

---

## Recordings 🔒 Protected

### POST /api/recordings/upload
Upload an audio recording.

**Request:** `multipart/form-data`
- `audio` (file) — audio file, max 50MB, must be `audio/*` MIME type
- `title` (string) — recording title

**Response:** `{ "id": 1, "title": "...", "audio_key": "filename.webm" }`

**Errors:** `400` (missing file / invalid MIME) | `413` (file too large)

---

### GET /api/recordings/list
List all recordings for the authenticated user.

**Response:** `{ "recordings": [{ "id", "title", "duration_seconds", "file_size_bytes", "created_at" }] }`

---

### GET /api/recordings/:id/audio
Stream/download an audio recording file.

**Response:** Audio file with `Content-Type: audio/*`

**Errors:** `403` (not owner) | `404` (not found)

---

### DELETE /api/recordings/:id
Delete a recording and its audio file.

**Response:** `{ "ok": true }`

**Errors:** `403` (not owner) | `404` (not found)

---

## Security Notes

- Session cookies: `httpOnly`, `secure` (production), `sameSite=Strict`, 30-day expiry
- All AI API keys are user-supplied — they pass through the server for processing but are **not stored**
- All text inputs validated via Zod schemas with max length constraints
- Path traversal protection on audio file access (basename + resolve boundary check)
