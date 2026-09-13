# QA-процедуры — фича 003: Надёжная сессия админки

Все проверки — unit-тесты (vitest) над `src/frontend/src/lib/adminAuth.ts` (и его
потребителями) плюс сборка/линт. E2E против прод-окружения — вне рамок, не входит
в эти процедуры.

Общие предпосылки для запуска:
```
cd src/frontend
```
`fetch` мокается через `vi.stubGlobal('fetch', vi.fn(...))`;
`window.location.assign` — через `vi.spyOn`/`Object.defineProperty`;
`localStorage` — реальный (jsdom), очищается в `beforeEach`.

---

## US1 — Прозрачное продление сессии

### @US1-AS-1 / @US1-TS-1 — один refresh + один повтор
1. В `localStorage` задать `admin_token` = просроченный/произвольный, `admin_refresh_token` = валидный.
2. Смокать `fetch`: 1-й вызов (исходный запрос) → `Response(401)`; 2-й вызов (`POST /api/admin/auth/refresh`) → `Response(200, {accessToken, refreshToken, ...})`; 3-й вызов (повтор исходного запроса) → `Response(200, <данные>)`.
3. Вызвать `adminFetch('/api/admin/...')`.
4. Проверить: `fetch` вызван ровно 3 раза; 2-й вызов — на `/api/admin/auth/refresh`; результат `adminFetch` — успешный `Response` с данными из 3-го вызова.
5. Проверить `localStorage`: `admin_token`/`admin_refresh_token` заменены на новые значения из ответа refresh.
Ожидаемый результат: тест зелёный, счётчик `fetch` = 3, ровно один вызов `/refresh`.

### @US1-AS-2 / @US1-TS-2 — single-flight при параллельных запросах
1. Смокать `fetch` так, чтобы любой запрос к произвольному admin-эндпоинту первым вызовом отвечал 401, а `/refresh` — 200 (задержка, напр. `setTimeout`/`Promise` внутри мока, чтобы гонка была реальной).
2. Вызвать `Promise.all([adminFetch(a), adminFetch(b), adminFetch(c)])` без ожидания между вызовами.
3. Проверить: `fetch` зафиксировал ровно один вызов на `/api/admin/auth/refresh` (фильтр по URL в моке).
4. Проверить: все три промиса резолвятся успешным `Response`.
Ожидаемый результат: `refresh`-вызовов = 1, все 3 запроса успешны.

### @US1-EC-1 — защита от бесконечного цикла (повторный 401 после refresh)
1. Настроить `localStorage`: оба ключа заданы.
2. Смокать `fetch`: исходный запрос → 401; `/refresh` → 200 (новая пара); повтор исходного запроса → снова 401.
3. Вызвать `adminFetch(...)`.
4. Проверить: `fetch` вызван ровно 3 раза (не более — второй refresh не запускается).
5. Проверить: `localStorage.getItem('admin_token')` и `admin_refresh_token` → `null`.
6. Проверить: `location.assign` вызван ровно один раз с `/admin/login?returnTo=...`.
Ожидаемый результат: ровно 3 fetch-вызова, сессия очищена, один редирект.

### @US1-EC-2 — сетевая ошибка refresh не разрушает сессию
1. `localStorage`: оба ключа заданы (валидные значения).
2. Смокать `fetch`: исходный запрос → 401; `/refresh` → `Promise.reject(new Error('network'))` (или `Response(503)`).
3. Вызвать `adminFetch(...)` и поймать результат/ошибку.
4. Проверить: `localStorage.getItem('admin_token')` и `admin_refresh_token` — прежние значения, НЕ `null`.
5. Проверить: `location.assign` НЕ вызван.
6. Проверить: `adminFetch` вернул отклонённый промис/ошибку (исходный запрос завершился неудачей, но сессия не тронута).
Ожидаемый результат: ключи в `localStorage` не изменились, редиректа нет.

### @US1-EC-4 — общее хранилище между вкладками (unit-эмуляция)
1. Вызвать `saveSession({accessToken: 'A1', refreshToken: 'R1', ...})`.
2. Прочитать напрямую `localStorage.getItem('admin_token')` === `'A1'`, `admin_refresh_token` === `'R1'` (эмуляция «другой вкладки», читающей то же хранилище).
3. Вызвать `saveSession({accessToken: 'A2', refreshToken: 'R2', ...})` (эмуляция продления в другой вкладке).
4. Проверить, что `getAccessToken()`/`getRefreshToken()` (или прямое чтение `localStorage`) возвращают уже `'A2'`/`'R2'`.
Ожидаемый результат: чтение хранилища после `saveSession` всегда отражает последнюю сохранённую пару — общий источник правды.

---

## US2 — Честное завершение сессии

### @US2-AS-3 / @US2-TS-3 — отклонённый refresh → очистка + returnTo
1. `localStorage`: `admin_token` — произвольное значение, `admin_refresh_token` — произвольное значение.
2. Смокать `fetch`: исходный запрос → 401; `/refresh` → `Response(401)` (также прогнать варианты 403 и 400 — параметризованный тест).
3. Смокать `window.location.assign` (шпион, без реальной навигации) и текущий `window.location.pathname` (например, `/admin/news`).
4. Вызвать `adminFetch('/api/admin/news')`.
5. Проверить: `localStorage.getItem('admin_token')` и `admin_refresh_token` → `null`.
6. Проверить: `location.assign` вызван с `'/admin/login?returnTo=%2Fadmin%2Fnews'` (или эквивалентным закодированным путём).
Ожидаемый результат: сессия очищена, редирект содержит корректный `returnTo`.

### @US2-AS-4 / @US2-TS-4 — возврат на returnTo после входа
1. В тесте страницы логина (`login/page.tsx`) сымитировать `useSearchParams().get('returnTo')` = `/admin/news`.
2. Смокать `adminLogin()` → успешный ответ с парой токенов.
3. Вызвать обработчик отправки формы логина.
4. Проверить: `router.push` (или эквивалент навигации) вызван с `/admin/news`.
5. Проверить: `saveSession` вызван/оба ключа в `localStorage` заполнены.
Ожидаемый результат: навигация на `/admin/news`, сессия сохранена.

### @US2-AS-5 — выход очищает обе сессии
1. `localStorage`: оба ключа заданы валидными значениями.
2. В тесте `AdminLayout` вызвать `handleLogout` (клик по кнопке «Выйти» либо прямой вызов обработчика).
3. Проверить: `localStorage.getItem('admin_token')` и `admin_refresh_token` → `null`.
4. Проверить: навигация/редирект на `/admin/login`.
5. Отдельно проверить guard: рендер защищённой admin-страницы при отсутствующем `admin_token` (`getAccessToken()` → `null`) → `router.replace('/admin/login')` вызывается (эмуляция «кнопки назад» — компонент не рендерит данные, а сразу уходит в редирект).
Ожидаемый результат: оба ключа удалены, редирект на логин; при отсутствии токена защищённая страница не показывает данные.

### @US2-EC-3 — подделанный returnTo заменяется на /admin
1. Вызвать функцию валидации (`sanitizeReturnTo` либо эквивалент) с входами: `'https://evil.example'`, `'/pricing'`.
2. Проверить: оба вызова возвращают `'/admin'`.
Ожидаемый результат: оба некорректных пути нормализуются в `/admin`.

### @US2-EC-3b — корректный returnTo внутри /admin принимается
1. Вызвать `sanitizeReturnTo('/admin/news')`.
2. Проверить: результат === `'/admin/news'`.
Ожидаемый результат: путь внутри `/admin` возвращается без изменений.

---

## Сквозные проверки (не привязаны к одному сценарию, обязательны для слайса)

1. `cd src/frontend && npm test` — все тесты `adminAuth.test.ts` (и обновлённые тесты `login/page`, `AdminLayout`, если есть) зелёные, ни один существующий тест не сломан.
2. `cd src/frontend && npm run build` — exit 0, без TypeScript-ошибок.
3. `cd src/frontend && npm run lint` — exit 0.
4. Статическая проверка (grep): в `src/frontend/src/lib/api.ts` не осталось прямых обращений к `localStorage`/`admin_token` вне `adminAuth.ts` (`grep -n "authHeaders\|admin_token" src/frontend/src/lib/api.ts` — единственные совпадения либо отсутствуют, либо находятся внутри делегирующего вызова к `adminAuth`).
