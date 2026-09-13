<!-- GENERATED FILE — DO NOT EDIT BY HAND.
     This file is rendered from the corresponding .yaml artifact and will be
     overwritten the next time it is regenerated. Edit the .yaml source instead. -->

# Implementation Plan: Надёжная сессия админки (обновление токена и корректный выход)

**Branch**: `003-admin-session-refresh`

## Summary

Frontend-only: сохранение пары access+refresh токенов при логине, единая обёртка admin-запросов в src/frontend/src/lib/api.ts с single-flight refresh при 401 и повтором запроса, очистка сессии + редирект на /admin/login с returnTo при неудаче refresh, возврат на исходный путь после входа. Backend не меняется.

## Technical Context

- **Language/Version**: TypeScript 5 / Next.js 15 (App Router), React 18, client components
- **Primary Dependencies**: next 15 (useRouter из next/navigation), fetch API (нативный), jest + ts-jest (unit-тесты фронтенда, существующая конфигурация src/frontend)
- **Storage**: localStorage браузера: ключи admin_token (access) и admin_refresh_token (refresh)
- **Testing**: jest (unit на adminFetch-обёртку: 401→refresh→retry, refresh-fail→clear+redirect, single-flight, network-error)
- **Target Platform**: Браузер (админка сайта), деплой в существующем Docker-образе nextjs
- **Project Type**: web_application
- **Performance Goals**: Продление сессии добавляет один запрос POST /api/admin/auth/refresh на факт истечения (раз в ~15 минут), не на каждый запрос
- **Constraints**: Backend (Arsenal.API AuthController: POST /api/admin/auth/login, POST /api/admin/auth/refresh) не меняется; хранение в localStorage как сейчас; публичная часть сайта не затрагивается
- **Scale/Scope**: 1-2 администратора; ~30 admin-функций в api.ts переводятся на общую обёртку

## Constitution Check

| Principle | Status | Justification |
|---|---|---|
| `P1` | not_applicable | constitution.yaml проекта — незаполненный шаблон (плейсхолдеры), реальных принципов не зарегистрировано |

## Project Structure

**Layout**: web_application

Изменения только во фронтенде Next.js: центральная обёртка admin-запросов в lib (adminAuth.ts + правки api.ts), обновление логина и layout админки; unit-тесты рядом в __tests__ по существующей конвенции src/frontend

**Directories**:

- `src/frontend/src/lib/ (adminAuth.ts — токены, refresh, adminFetch; api.ts — admin-функции поверх adminFetch)`
- `src/frontend/src/app/admin/login/ (сохранение пары токенов, возврат на returnTo)`
- `src/frontend/src/components/ (AdminLayout.tsx — guard и выход через adminAuth)`
- `src/frontend/src/lib/__tests__/ (unit-тесты обёртки)`
