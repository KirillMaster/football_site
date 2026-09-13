# Architect review — S1 admin-session-wrapper

Verdict: pass (mechanical fix applied in place).

## Finding
`src/frontend/src/lib/adminAuth.ts` (the low-level session/token primitive) imported
`type { AuthResponse }` from `./api`, which itself imports `adminFetch` from `./adminAuth`.
This is a backwards, cyclic dependency: the lower-level module reached up into the
higher-level module for a type it does not own.

## Fix (mechanical)
- Introduced `AdminSessionTokens` (`{ accessToken, refreshToken }`) in `adminAuth.ts` —
  the shape `adminAuth` actually needs.
- `saveSession` and the refresh handler now type against `AdminSessionTokens` instead of
  `api.ts`'s `AuthResponse`.
- `api.ts`'s `AuthResponse` now `extends AdminSessionTokens`, imported as a type from
  `./adminAuth`. Public shape/name unchanged for existing consumers (`admin/login/page.tsx`).
- `adminAuth.ts` now has zero imports — a pure module, dependency direction restored
  (`api.ts` → `adminAuth.ts`, never the reverse).

## Verified
- Components (`AdminLayout.tsx`, `admin/login/page.tsx`) use only `adminAuth`'s public
  functions (`getAccessToken`, `clearSession`, `saveSession`, `sanitizeReturnTo`) — no
  reach into internals.
- Admin-only helpers (`adminGetJson`/`adminMutate`) stay isolated in `api.ts`; public
  (non-admin) fetch functions are untouched by admin auth concerns — no leakage (A-4).
- No other cross-module cycles found.

## Gates
- `npm test -- --run`: 10 files / 39 tests passed.
- `npm run build`: compiled + typechecked + all routes generated successfully.
- `npm run lint`: no ESLint warnings or errors.
