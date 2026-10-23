# Quickstart — 003-admin-session-refresh

## Prerequisites
- Node 20+, `cd src/frontend && npm ci`
- Прод: https://fcarsenal92.ru, креды админа — GitHub Secrets ADMIN_EMAIL/ADMIN_PASSWORD.

## Unit-тесты обёртки (contracts.yaml#admin_fetch, #session_store, #refresh_flow)
```bash
cd src/frontend && npm test
```
Ожидаемо: зелёные тесты на 401→refresh→retry (TS-1), single-flight (TS-2), refresh-fail→clear+redirect (TS-3), returnTo на логине (TS-4), EC-1 (нет цикла), EC-2 (сетевая ошибка не разлогинивает).

## Сборка
```bash
cd src/frontend && npm run build && npm run lint
```

## Ручная валидация (SC-001, SC-002)
1. Войти в /admin/login → в DevTools Application/localStorage появились `admin_token` И `admin_refresh_token` (FR-001).
2. Подменить `admin_token` на мусор → открыть «Тренеры»: данные видны (прозрачный refresh, US1), в Network один POST /api/admin/auth/refresh.
3. Подменить оба токена на мусор → открыть раздел: редирект на `/admin/login?returnTo=/admin/coaches`; после входа — возврат в «Тренеры» (US2, FR-005).
4. Нажать «Выйти» → оба ключа удалены, форма входа (FR-006).
5. `/admin/login?returnTo=https://evil.example` → после входа попадаем на /admin, не наружу (EC-3).
