<!-- GENERATED FILE — DO NOT EDIT BY HAND.
     This file is rendered from the corresponding .yaml artifact and will be
     overwritten the next time it is regenerated. Edit the .yaml source instead. -->

# Implementation Plan: Полноценный редактор новостей в админке

**Branch**: `004-admin-news-rich-editor`

## Summary

Frontend-ориентированная фича с точечными доработками backend: расширение tiptap-редактора /admin/news кастомными нодами (figure-изображение с alt, grid-галерея, video), панелью загрузки медиа и боковыми полями (обложка, теги, slug, meta, публикация); на backend — приём CoverImage в CreateNewsCommand и отдельный эндпоинт загрузки медиа новостей (изображения + video/mp4), не создающий записей в публичной фотогалерее.

## Technical Context

- **Language/Version**: TypeScript 5 / Next.js 15 (App Router, React 19) + C# / .NET 9
- **Primary Dependencies**: @tiptap/react + @tiptap/starter-kit 2.7 (уже в зависимостях), @tiptap/extension-image 2.7 (уже в зависимостях, база для figure-ноды), Tailwind CSS (brand-blue #1e3a5f, brand-red #c0392b, классы btn-primary/btn-outline), ASP.NET Core 9 + FluentValidation (существующие контроллеры и валидаторы), AWSSDK.S3 через существующий IStorageService (S3 Timeweb)
- **Storage**: PostgreSQL — существующая таблица News (поле CoverImage и Tags уже есть, миграции не требуются); файлы — S3 Timeweb через IStorageService
- **Testing**: vitest + @testing-library (frontend unit: сериализация/парсинг нод, slugify); xUnit: Arsenal.Application.Tests, Arsenal.API.IntegrationTests; e2e — Playwright-скрипт по проду через SOCKS5
- **Target Platform**: Linux server (Docker, docker-compose на VPS), браузеры desktop/mobile
- **Project Type**: web_application
- **Performance Goals**: Загрузка файла ≤20 МБ завершается за время сетевой передачи без блокировки редактора; открытие новости на редактирование ≤2 с
- **Constraints**: Лимит 20 МБ на файл; HTML контента рендерится на публичной странице через dangerouslySetInnerHTML — разметка нод должна быть самодостаточной (inline-стили, как в эталонных новостях); англоязычные поля новости не редактируются; VPS RAM ~1GB — без серверной перекодировки видео; секреты только в env
- **Scale/Scope**: 1-2 администратора, единицы новостей в неделю, до ~10 медиафайлов на новость

## Constitution Check

| Principle | Status | Justification |
|---|---|---|
| `P1` | not_applicable | Конституция проекта не ратифицирована (шаблон-заглушка с placeholder-принципом); реальных принципов для проверки нет. |

## Project Structure

**Layout**: web_application

Основная работа во frontend: страница админки новостей, tiptap-расширения и API-клиент. На backend — правка команды создания новости с валидатором и новый контроллер загрузки медиа новостей поверх существующего IStorageService. Тесты в существующих тестовых проектах обеих сторон.

**Directories**:

- `src/frontend/src/app/admin/news/`
- `src/frontend/src/components/admin/ (tiptap-расширения и панели редактора)`
- `src/frontend/src/lib/ (api.ts, slugify)`
- `src/frontend/src/__tests__/ (vitest)`
- `src/backend/src/Arsenal.API/Controllers/`
- `src/backend/src/Arsenal.Application/Validators/`
- `src/backend/tests/Arsenal.API.IntegrationTests/`
