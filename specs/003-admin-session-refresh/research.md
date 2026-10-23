# Research — 003-admin-session-refresh

## R1. Точка перехвата 401
- **Decision**: Единая обёртка `adminFetch(path, init)` в новом модуле `src/frontend/src/lib/adminAuth.ts`; все ~30 admin-функций в `api.ts` меняют `fetch(..., { headers: authHeaders() })` на `adminFetch(...)`. Обёртка сама подставляет Bearer, при 401 делает refresh и один повтор.
- **Rationale**: Сейчас каждая admin-функция глотает `!res.ok` в `[]/null/false` — «0 тренеров». Централизация в одной функции покрывает все существующие и будущие вызовы; axios-интерцепторы тянут новую зависимость ради того же.
- **Alternatives**: axios + interceptors (новая зависимость); проактивное обновление по expiresAt-таймеру (не покрывает рассинхрон часов и ревокацию — 401-реактивный путь всё равно нужен).

## R2. Single-flight refresh
- **Decision**: Модульная переменная `let refreshPromise: Promise<boolean> | null`; первый 401 создаёт промис POST `/api/admin/auth/refresh` (body: `{refreshToken}`), конкуренты ждут его же; по завершении промис сбрасывается в `finally`.
- **Rationale**: Страницы админки грузят несколько списков параллельно — без single-flight будет шторм refresh-запросов, а бэкенд при ротации refresh-токена примет только первый.
- **Alternatives**: Мьютекс/очередь запросов (избыточно для SPA-админки); web-lock API (не нужен между вкладками — localStorage общий, лишний refresh из второй вкладки безвреден, но single-flight внутри вкладки обязателен).

## R3. Классификация исхода refresh (EC-2)
- **Decision**: Только HTTP-ответ 401/403/400 от refresh-эндпоинта считается «сессия невалидна» → очистка токенов + редирект. Сетевая ошибка (fetch reject) / 5xx → сессия сохраняется, исходный запрос возвращает ошибку как сейчас.
- **Rationale**: FR-008 спеки: временная недоступность API не должна разлогинивать администратора.
- **Alternatives**: любой сбой → logout (ложные разлогины при перезапуске контейнера dotnet-api).

## R4. Редирект и возврат (returnTo)
- **Decision**: При очистке сессии — `window.location.assign('/admin/login?returnTo=' + encodeURIComponent(pathname))` (полная перезагрузка сбрасывает состояние страниц). Логин читает `returnTo` через `useSearchParams`, валидирует: используется только значение, начинающееся с `/admin` (EC-3), иначе `/admin`.
- **Rationale**: Обёртка живёт вне React-дерева — router недоступен; location.assign надёжен из любого контекста. Валидация префикса закрывает open-redirect.
- **Alternatives**: событие + обработчик в AdminLayout с router.push (сложнее, гонки с рендером под невалидной сессией).

## R5. Хранение и выход
- **Decision**: localStorage: существующий ключ `admin_token` + новый `admin_refresh_token`. Функции `saveSession(auth)`, `clearSession()`, `getAccessToken()` в adminAuth.ts; login-страница и handleLogout в AdminLayout используют их (выход = clearSession + push('/admin/login')).
- **Rationale**: A-1 спеки — остаёмся на localStorage; общий модуль исключает рассинхрон ключей. Многовкладочность (EC-4) получается бесплатно: localStorage общий.
- **Alternatives**: httpOnly cookies (правки backend — вне скоупа, FR-009).

## R6. Unit-тесты обёртки
- **Decision**: jest в src/frontend (конфигурация уже есть, 002 не добавляла фронт-тестов — проверить наличие; если jest не настроен, coder настраивает по образцу Next.js + ts-jest/babel-jest). Мокаются `global.fetch` и `window.location.assign`; localStorage — jsdom. Сценарии: TS-1 (401→refresh→retry→data), TS-2 (3 конкурентных 401 → 1 refresh), TS-3 (refresh 401 → clearSession + redirect с returnTo), TS-4 (login с returnTo), EC-1 (повторный 401 после refresh → без цикла), EC-2 (network error → сессия жива).
- **Rationale**: Требование пользователя — unit на обёртку; jsdom-окружение покрывает localStorage/location.

## Открытые внешние зависимости
- Нет: фича frontend-only, бэкенд-эндпоинты login/refresh уже в проде.
