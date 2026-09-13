<!-- GENERATED FILE — DO NOT EDIT BY HAND.
     This file is rendered from the corresponding .yaml artifact and will be
     overwritten the next time it is regenerated. Edit the .yaml source instead. -->

# Tasks: Надёжная сессия админки (обновление токена и корректный выход)

## `T001` Создать модуль сессии adminAuth.ts (хранилище токенов + adminFetch с single-flight refresh) [US1]

Новый модуль src/frontend/src/lib/adminAuth.ts: saveSession/clearSession/getAccessToken/getRefreshToken (localStorage: admin_token, admin_refresh_token) и обёртка adminFetch(path, init) — Bearer из хранилища, при 401 single-flight POST /api/admin/auth/refresh и один повтор; refresh 401/403/400 → clearSession + location.assign('/admin/login?returnTo=<pathname>'); сетевая ошибка/5xx refresh → сессия сохраняется, исходная ошибка возвращается.

**Context**: Корень бага «0 тренеров»: 401 глотается каждой admin-функцией, refresh-токен не используется. Централизованная обёртка чинит все запросы разом.

- **Depends on**: —
- **Requirements**: FR-001, FR-002, FR-003, FR-004, FR-008
- **Entities**: admin_session, return_path
- **Contracts**: admin_fetch, session_store, refresh_flow

**Steps**:

1. **Реализовать хранилище сессии** — src/frontend/src/lib/adminAuth.ts: ключи localStorage 'admin_token' и 'admin_refresh_token'; saveSession(auth: AuthResponse) пишет оба, clearSession() удаляет оба; все обращения к localStorage через try/catch (SSR-safe: typeof window check).
2. **Реализовать adminFetch с retry** — adminFetch(path, init?): fetch с Authorization: Bearer <access>; res.status===401 → await ensureRefreshed() → при успехе один повтор с новым токеном; повторный 401 после refresh → terminateSession() без второго refresh (EC-1).
3. **Реализовать single-flight refresh** — Модульная let refreshPromise: Promise<boolean>|null; ensureRefreshed() переиспользует существующий промис; POST /api/admin/auth/refresh c JSON {refreshToken}; 200 → saveSession(новая пара) → true; 401/403/400 → terminateSession() → false; fetch reject/5xx → false БЕЗ очистки (FR-008); finally: refreshPromise=null.
4. **Реализовать terminateSession** — clearSession() + window.location.assign('/admin/login?returnTo='+encodeURIComponent(window.location.pathname)); guard от повторного вызова.

**Technical Notes**:

- `src/frontend/src/lib/api.ts`: adminLogin() (строка ~567) возвращает AuthResponse {accessToken, refreshToken, expiresAt, email, role} — тип переиспользовать, не дублировать.
- `src/frontend/src/lib/adminAuth.ts`: Новый файл; без React-зависимостей (используется и вне компонентов).

**Acceptance Criteria**:

- [ ] `AC-1` adminFetch при 401 выполняет ровно один refresh и один повтор; при валидном refresh возвращает успешный Response
- [ ] `AC-2` Конкурентные 401 порождают один POST /refresh; неудачный refresh (401/403/400) очищает оба ключа и редиректит с returnTo; сетевая ошибка refresh сессию не трогает

**Test Scenarios**:

- `TS-1` (unit)
  - Given: localStorage содержит просроченный access и валидный refresh (моки fetch)
  - When: adminFetch получает 401, refresh отвечает 200 с новой парой
  - Then: выполнен один POST /api/admin/auth/refresh; исходный запрос повторён с новым Bearer и вернул данные; новая пара в localStorage
  - Verification: automated
- `TS-2` (unit)
  - Given: три параллельных adminFetch, все получают 401
  - When: все стартуют одновременно
  - Then: fetch-мок зафиксировал ровно один вызов /refresh; все три запроса завершились успешно
  - Verification: automated

## `T002` Unit-тесты adminAuth (vitest) [US1]

Тесты src/frontend/src/lib/__tests__/adminAuth.test.ts на все ветки обёртки: 401→refresh→retry, single-flight, refresh-fail→clear+redirect c returnTo, повторный 401 без цикла, сетевая ошибка refresh без разлогина, save/clear session.

**Context**: Требование пользователя: unit-тесты на обёртку; vitest уже настроен в src/frontend (npm test = vitest run).

- **Depends on**: T001
- **Requirements**: FR-002, FR-003, FR-004, FR-007, FR-008
- **Entities**: admin_session
- **Contracts**: admin_fetch, refresh_flow

**Steps**:

1. **Написать тесты веток adminFetch** — vi.stubGlobal('fetch', мок); window.location.assign мокается (vi.spyOn/Object.defineProperty); сценарии TS-1..TS-4 задачи T001 и данной + EC-1, EC-2.
2. **Прогнать npm test** — cd src/frontend && npm test — все тесты зелёные, существующие не сломаны.

**Technical Notes**:

- `src/frontend/vitest.config.ts`: Конфигурация существует; окружение jsdom — localStorage доступен.

**Acceptance Criteria**:

- [ ] `AC-1` npm test зелёный; покрыты ветки: успешный refresh, single-flight, отклонённый refresh, повторный 401, сетевая ошибка

**Test Scenarios**:

- `TS-1` (unit)
  - Given: refresh отвечает 401
  - When: adminFetch получает 401
  - Then: оба ключа удалены из localStorage; location.assign вызван с /admin/login?returnTo=<путь>
  - Verification: automated
- `TS-2` (unit)
  - Given: refresh падает сетевой ошибкой (fetch reject)
  - When: adminFetch получает 401
  - Then: токены остались в localStorage; редиректа нет; исходный вызов вернул ошибку
  - Verification: automated

## `T003` Перевести admin-функции api.ts на adminFetch [US1]

Заменить в src/frontend/src/lib/api.ts все admin-вызовы (getAdminPages, getAdminCoaches, createAdminCoach, updateAdminPage, upload и остальные ~30, включая чтение admin_token на строке ~692) с fetch+authHeaders() на adminFetch из adminAuth.ts; authHeaders() удалить или свести к делегату.

**Context**: Пока функции ходят мимо обёртки, 401 по-прежнему глотается — FR-007 не выполняется.

- **Depends on**: T001
- **Requirements**: FR-002, FR-007, FR-009
- **Entities**: admin_session
- **Contracts**: admin_fetch

**Steps**:

1. **Заменить все использования authHeaders()/localStorage admin_token** — grep 'authHeaders\|admin_token' по api.ts; каждый fetch admin-эндпоинта → adminFetch(path, init); для FormData-upload не задавать Content-Type вручную.
2. **Проверить сборку и типы** — cd src/frontend && npm run build && npm run lint — без ошибок.

**Technical Notes**:

- `src/frontend/src/lib/api.ts`: authHeaders() на строке ~483; публичные (не-admin) функции не трогать (A-4).

**Acceptance Criteria**:

- [ ] `AC-1` В api.ts не осталось прямых чтений admin_token/authHeaders вне adminAuth.ts; build и lint зелёные

**Test Scenarios**:

- `TS-1` (integration)
  - Given: сборка фронтенда
  - When: npm run build && npm run lint
  - Then: exit 0
  - Verification: automated

## `T004` Логин: сохранить пару токенов и вернуть на returnTo; выход и guard через adminAuth [P] [US2]

login/page.tsx: после adminLogin() вызывать saveSession(result) (вместо setItem только access) и router.push(валидный returnTo из useSearchParams — только префикс /admin, иначе /admin). AdminLayout.tsx: handleLogout → clearSession() + push('/admin/login'); guard в useEffect → getAccessToken().

**Context**: Сейчас refreshToken выбрасывается на строке login/page.tsx:34, а выход удаляет только один ключ.

- **Depends on**: T001
- **Requirements**: FR-001, FR-005, FR-006
- **Entities**: admin_session, return_path
- **Contracts**: login_return, session_store

**Steps**:

1. **Обновить страницу логина** — src/frontend/src/app/admin/login/page.tsx: saveSession(result); const rt=useSearchParams().get('returnTo'); router.push(rt && rt.startsWith('/admin') ? rt : '/admin'); useSearchParams требует Suspense-boundary в Next 15 — обернуть при необходимости.
2. **Обновить AdminLayout** — src/frontend/src/components/AdminLayout.tsx: handleLogout → clearSession(); guard useEffect → if (!getAccessToken()) router.replace('/admin/login').
3. **Добавить unit-тест валидации returnTo** — Тест функции валидации пути (вынести sanitizeReturnTo в adminAuth.ts): '/admin/news' → '/admin/news'; 'https://evil.example' и '/pricing' → '/admin' (EC-3).

**Technical Notes**:

- `src/frontend/src/app/admin/login/page.tsx`: Строка ~34: localStorage.setItem('admin_token', result.accessToken) — заменить на saveSession.
- `src/frontend/src/components/AdminLayout.tsx`: handleLogout уже существует — переиспользовать кнопку «Выйти», менять только реализацию.

**Acceptance Criteria**:

- [ ] `AC-1` После логина в localStorage оба ключа; с ?returnTo=/admin/news вход ведёт в /admin/news; внешний/не-admin returnTo заменяется на /admin
- [ ] `AC-2` «Выйти» удаляет оба ключа и ведёт на /admin/login

**Test Scenarios**:

- `TS-1` (unit)
  - Given: sanitizeReturnTo реализована
  - When: вызов с '/admin/news', '/pricing', 'https://evil.example'
  - Then: '/admin/news'; '/admin'; '/admin'
  - Verification: automated
- `TS-2` (unit)
  - Given: пользователь залогинен (моки)
  - When: clearSession()
  - Then: admin_token и admin_refresh_token отсутствуют в localStorage
  - Verification: automated

