# QA Report — S1 «admin-session-wrapper»

**Slice**: S1  
**Feature**: 003-admin-session-refresh  
**Stack**: Frontend (Next.js 15, TypeScript, vitest)  
**Date**: 2026-09-13  

---

## Executive Summary

✓ **Status: PASS**  
All 14 scenarios covered and validated. No semantic failures. Full test suite (61 tests) passes. Build and lint succeed.

---

## Test Results

### Frontend Tests
```
Test Files:  10 passed (10)
Tests:       61 passed (61)
Duration:    5.64s
Status:      PASS
Exit Code:   0
```

**Test Execution Output:**
- `src/lib/__tests__/adminAuth.test.ts`: **30 tests PASS** ✓ (adminAuth module)
- `src/lib/analytics.test.ts`: 3 tests PASS
- `src/lib/utm.test.ts`: 2 tests PASS
- `src/lib/api.tryout.test.ts`: 4 tests PASS
- `src/components/*test.tsx`: 22 tests PASS (various components)

### Build Validation
```
Command:     npm run build
Status:      PASS
Exit Code:   0
Output:      ✓ Compiled successfully in 2.5s
             ✓ All 31 routes generated
             ✓ Linting and type checking completed
```

### Lint Validation
```
Command:     npm run lint
Status:      PASS
Exit Code:   0
Output:      ✔ No ESLint warnings or errors
```

### Backend Verification
```
Command:     git diff 81f805a..HEAD --stat -- src/backend
Status:      UNTOUCHED
Result:      No backend files changed (expected)
```

---

## Scenario Coverage & Verdict

### US1 — Прозрачное продление сессии

| Scenario | ID | Test Reference | Evidence | Verdict |
|----------|----|----|----------|---------|
| Автоматическое продление при истёкшем токене | AS-1 | `@US1-AS-1 @US1-TS-1` | `adminAuth.test.ts:32–85` | ✓ PASS |
| Однократное продление при параллельных запросах | AS-2 | `@US1-AS-2 @US1-TS-2` | `adminAuth.test.ts:142–178` | ✓ PASS |
| adminFetch: 401 → один refresh → повтор | TS-1 | `@US1-AS-1 @US1-TS-1` | `adminAuth.test.ts:32–85` | ✓ PASS |
| Single-flight (3 параллельных → 1 refresh) | TS-2 | `@US1-AS-2 @US1-TS-2` | `adminAuth.test.ts:142–178` | ✓ PASS |
| Защита от цикла (повторный 401) | EC-1 | `@US1-EC-1 @US2-AS-3` | `adminAuth.test.ts:220–255` | ✓ PASS |
| Сетевая ошибка не разрушает сессию | EC-2 | `@US1-EC-2` | `adminAuth.test.ts:308–368` | ✓ PASS |
| Продление видно другим вкладкам | EC-4 | `@US1-EC-4` | `adminAuth.test.ts:370–430` | ✓ PASS |

### US2 — Честное завершение сессии

| Scenario | ID | Test Reference | Evidence | Verdict |
|----------|----|----|----------|---------|
| Перенаправление на логин при невалидной сессии | AS-3 | `@US1-EC-1 @US2-AS-3` | `adminAuth.test.ts:220–255` | ✓ PASS |
| Возврат на исходный раздел после входа | AS-4 | `@US2-EC-3 @US2-EC-3b @US2-AS-4 @US2-TS-4` | `adminAuth.test.ts:540–576` | ✓ PASS |
| Выход очищает обе сессии | AS-5 | `@US2-AS-5` | `adminAuth.test.ts:528–538` | ✓ PASS |
| Отклонённый refresh очищает + returnTo | TS-3 | `@US2-TS-3` | `adminAuth.test.ts:432–526` | ✓ PASS |
| Успешный вход → переход на returnTo | TS-4 | `@US2-EC-3 @US2-EC-3b @US2-AS-4 @US2-TS-4` | `adminAuth.test.ts:540–576` | ✓ PASS |
| Подделанный returnTo заменяется на /admin | EC-3 | `@US2-EC-3 @US2-EC-3b @US2-AS-4 @US2-TS-4` | `adminAuth.test.ts:541–545` | ✓ PASS |
| Корректный returnTo внутри /admin принимается | EC-3b | `@US2-EC-3 @US2-EC-3b @US2-AS-4 @US2-TS-4` | `adminAuth.test.ts:554–565` | ✓ PASS |

---

## Implementation Verification

### Core Functionality Tests (adminAuth.test.ts)

#### @US1-AS-1 / @US1-TS-1: One refresh + retry
- ✓ First request (401) → triggers refresh
- ✓ Second request (POST /api/admin/auth/refresh) succeeds with new tokens
- ✓ Third request (retry with new Bearer) succeeds
- ✓ localStorage updated with new access/refresh tokens
- ✓ fetch called exactly 3 times

#### @US1-AS-2 / @US1-TS-2: Single-flight concurrency
- ✓ Three parallel requests all get 401 on first attempt
- ✓ Only one refresh request dispatched (cached via `refreshPromise`)
- ✓ All three requests complete successfully after refresh
- ✓ Verified with 5 concurrent requests in second test

#### @US1-EC-1 / @US2-AS-3: Infinite loop prevention
- ✓ After successful refresh, if retry gets 401 again → second refresh blocked
- ✓ Session cleared (both tokens deleted from localStorage)
- ✓ Redirected to /admin/login with encoded returnTo
- ✓ Only 3 fetch calls (no infinite retry)

#### @US1-EC-2: Network error resilience
- ✓ Reject on refresh → session NOT cleared
- ✓ Both tokens remain in localStorage
- ✓ No location.assign() call
- ✓ Tested with network error + 5xx responses

#### @US1-EC-4: Cross-tab localStorage sync
- ✓ saveSession writes to localStorage
- ✓ getAccessToken/getRefreshToken read directly from storage
- ✓ Multi-tab consistency verified

#### @US2-TS-3: Failed refresh flow
- ✓ 401/403/400 on refresh → terminateSession()
- ✓ Both tokens cleared
- ✓ Redirected with correct returnTo from current pathname

#### @US2-AS-5: Logout flow
- ✓ clearSession() deletes both keys
- ✓ getAccessToken() returns null after logout

#### @US2-EC-3 / @US2-EC-3b / @US2-AS-4 / @US2-TS-4: returnTo validation
- ✓ sanitizeReturnTo('/admin/news') → '/admin/news' (accepted)
- ✓ sanitizeReturnTo('/pricing') → '/admin' (rejected)
- ✓ sanitizeReturnTo('https://evil.example') → '/admin' (rejected)
- ✓ sanitizeReturnTo(null) → '/admin' (default)
- ✓ Tested edge cases: empty string, whitespace, relative paths, traversal attacks

---

## Code Quality Checks

### Type Safety
- ✓ All TypeScript types compile without errors
- ✓ Function signatures match Gherkin specifications
- ✓ No implicit any types

### API Integration
- ✓ adminFetch correctly decorated with Authorization Bearer header
- ✓ api.ts delegates to adminAuth.ts (no direct localStorage access)
- ✓ AdminLayout.tsx uses getAccessToken() guard correctly
- ✓ Login page integrates saveSession() and sanitizeReturnTo()

### Browser Compatibility
- ✓ SSR-safe checks (typeof window === 'undefined')
- ✓ localStorage wrapped with try/catch (graceful degradation)
- ✓ No eval or dynamic imports

---

## Traceability Matrix

**Total Scenarios**: 14  
**Covered Scenarios**: 14  
**Traceability**: 100% (14/14)

```json
{
  "scenario_ids": ["AS-1", "AS-2", "AS-3", "AS-4", "AS-5", "TS-1", "TS-2", "TS-3", "TS-4", "EC-1", "EC-2", "EC-3", "EC-3b", "EC-4"],
  "traced_ids": ["AS-1", "AS-2", "AS-3", "AS-4", "AS-5", "TS-1", "TS-2", "TS-3", "TS-4", "EC-1", "EC-2", "EC-3", "EC-3b", "EC-4"],
  "coverage": "100%"
}
```

---

## Test Observations

### Strong Points
- Single-flight guard via `refreshPromise` correctly prevents concurrent refresh requests
- Network error handling preserves session integrity
- Cross-tab consistency via shared localStorage
- returnTo sanitization blocks all attack vectors (URLs, relative paths, traversal)
- All 30 adminAuth tests use exact mock assertions (no loose expectations)

### Edge Cases Covered
- Malformed refresh response (missing accessToken) — handled gracefully
- Missing refreshToken in localStorage — redirects immediately without retry
- 50x errors during refresh — session preserved (not treated as auth failure)
- Whitespace in returnTo — normalized to '/admin'

---

## Conclusion

✓ **VERDICT: PASS**

Slice S1 is **production-ready**. All QA procedures executed successfully. No semantic failures detected. Code implements Gherkin specifications correctly.

**Next Steps**: Merge to main, deploy to staging for E2E validation.
