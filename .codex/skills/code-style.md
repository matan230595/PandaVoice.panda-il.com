# PandaVoice — Code Style Guide

## TypeScript

- Strict TypeScript throughout. No `any` without a comment.
- Interfaces for props and state shapes; `type` for unions and aliases.
- Zod for all request validation at API boundaries — defined in `src/shared/types.ts`.
- `z.infer<typeof Schema>` for derived types — don't duplicate manually.

## File Naming

- React components: `PascalCase.tsx`
- Hooks: `use{Name}.tsx`
- Server routes: `lowercase.ts`
- Test files: `{filename}.test.{ts|tsx}` adjacent to the file under test

## React Patterns

- Functional components only. No class components (except ErrorBoundary).
- All shared state via `useAppStore` (Zustand). No prop drilling beyond 2 levels.
- `useAuth()` for user context — never access `/api/users/me` directly in components.
- Modals follow the `Modal.tsx` base component pattern: `isOpen` + `onClose` props.
- Toast notifications: `import toast from 'react-hot-toast'` → `toast.success()`, `toast.error()`.

## Server Patterns (Hono)

- One Hono `app` per route file, exported as default.
- Always validate with `Schema.safeParse()` before touching request data.
- Error responses: `c.json({ error: 'string' }, statusCode)`.
- DB access: call `getDB()` at handler time (not module load) — DB must be initialized first.
- External API calls: always include `signal: AbortSignal.timeout(30000)`.

## RTL / Hebrew

- Root HTML: `lang="he" dir="rtl"`.
- Use Tailwind's `rtl:` and `ltr:` prefixes for directional overrides.
- Fonts: `Rubik` (headings) and `Heebo` (body) loaded from Google Fonts via Home.tsx useEffect.
- Hebrew strings in UI are defined in `useAppStore.defaultConfig` (brand, placeholder, legal text).

## Styling

- Tailwind utility classes only. No custom CSS unless absolutely necessary.
- Dark mode: Tailwind `dark:` prefix. `isDarkMode` from `useAppStore` toggles `document.documentElement.classList`.
- Primary color: CSS var `--primary` set from `config.primary` (default: `#10b981` emerald).

## Comments

Only when the WHY is non-obvious. `// ponytail:` prefix for deliberate simplifications.
