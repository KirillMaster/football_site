<!-- GENERATED FILE — DO NOT EDIT BY HAND.
     This file is rendered from the corresponding .yaml artifact and will be
     overwritten the next time it is regenerated. Edit the .yaml source instead. -->

# Implementation Plan: Яндекс.Метрика и сквозная веб-аналитика воронки заявок fcarsenal92.ru

**Branch**: `001-yandex-metrika-analytics`

## Summary

Активировать счётчик Яндекс.Метрики (Вебвизор + карты кликов/скроллинга + аналитика форм) и повесить 7 целей reachGoal с гарантией срабатывания submit-событий только при подтверждённом сервером успехе. Захватывать UTM первого касания и ym clientId на фронте, пробрасывать в payload заявок и сохранять в PostgreSQL (TryoutRequest, ContactMessage) с показом в админке. Фронт (Next.js) — тонкий слой аналитики (lib/analytics.ts, lib/utm.ts, PhoneLink, кнопки карт), бэк (.NET/EF Core) — новые поля + миграция.


## Technical Context

- **Language/Version**: TypeScript 5 / Next.js 15 (App Router) фронт; C# / .NET 9 бэк
- **Primary Dependencies**: Next.js 15 (next/script для загрузки счётчика), react-hook-form + zod (существующие формы), Яндекс.Метрика (ym API: init, reachGoal, getClientID), .NET 9, EF Core (Npgsql), CQRS/MediatR, FluentValidation
- **Storage**: PostgreSQL (таблицы TryoutRequest, ContactMessage — добавление UTM/clientId полей через EF-миграцию)
- **Testing**: Ручная проверка целей в кабинете Метрики; unit/integration на утилиты UTM и success-only логику; e2e-прогон форм
- **Target Platform**: Веб (прод: Docker + nginx на 147.45.229.110), кросс-браузерный клиент
- **Project Type**: web_application
- **Performance Goals**: Загрузка счётчика асинхронно (afterInteractive), без влияния на LCP/CLS; отправка заявки не блокируется аналитикой
- **Constraints**: Submit-события — только при res.ok; сайт работает при заблокированном счётчике; UTM first-touch не перетирается; номер счётчика приходит от заказчика (активация через env NEXT_PUBLIC_YM_ID без пересборки логики)

- **Scale/Scope**: Небольшой сайт детской футбольной школы; поток заявок десятки/мес; single-tenant

## Constitution Check

| Principle | Status | Justification |
|---|---|---|
| `P1` | not_applicable | Конституция проекта — незаполненный стаб (плейсхолдер P1); реальные принципы не ратифицированы, поэтому гейт неприменим. Заполняется отдельно через /yamlkit-constitution. |

## Project Structure

**Layout**: web_application

Фронтенд Next.js в src/frontend/src (app-роуты, components, lib, types); бэкенд .NET по слоям DDD в src/backend/src (Domain-сущности, Application-команды/DTO, Infrastructure-EF/миграции, API-контроллеры). Аналитика добавляется как тонкий клиентский слой во фронте + новые поля/миграция в бэке; новых сервисов не вводится.


**Directories**:

- `src/frontend/src/components/ (Analytics.tsx, TryoutForm.tsx, ContactForm.tsx, SponsorSection.tsx, Footer.tsx, новый PhoneLink)`
- `src/frontend/src/lib/ (api.ts + новые analytics.ts, utm.ts)`
- `src/frontend/src/app/ (kontakty, zapisatsya, страницы с телефонами/формой)`
- `src/backend/src/Arsenal.Domain/ (TryoutRequest, ContactMessage — новые поля)`
- `src/backend/src/Arsenal.Application/ (Commands/DTO — проброс UTM/clientId)`
- `src/backend/src/Arsenal.Infrastructure/ (EF-конфигурация + новая миграция)`
- `src/backend/src/Arsenal.API/ (ContactController — приём UTM/clientId, отдача в админку)`
