<!-- GENERATED FILE — DO NOT EDIT BY HAND.
     This file is rendered from the corresponding .yaml artifact and will be
     overwritten the next time it is regenerated. Edit the .yaml source instead. -->

# Implementation Plan: Дублирование входящей обратной связи в Telegram и на email

**Branch**: `002-feedback-notifications`

## Summary

Backend-only: единый IFeedbackNotifier в Arsenal.Application, вызываемый из handlers создания заявок после SaveChangesAsync; композитная реализация в Arsenal.Infrastructure с каналами Telegram (Bot API sendMessage через HttpClient) и Email (SMTP smtp.mail.ru:465 SSL). Fire-and-forget с таймаутом 10с и логированием; конфигурация целиком через переменные окружения.

## Technical Context

- **Language/Version**: C# / .NET 9
- **Primary Dependencies**: ASP.NET Core (существующий Arsenal.API), EF Core + PostgreSQL (существующие), System.Net.Http.HttpClient (Telegram Bot API), MailKit (SMTP SSL 465)
- **Storage**: PostgreSQL (существующие таблицы ContactMessage/TryoutRequest; новых таблиц нет)
- **Testing**: xUnit: Arsenal.Application.Tests (unit, моки каналов), Arsenal.API.IntegrationTests (WebApplicationFactory, перехват транспортов)
- **Target Platform**: Linux server (Docker, docker-compose на VPS)
- **Project Type**: web_application
- **Performance Goals**: Ответ посетителю не замедляется уведомлениями (fire-and-forget); доставка уведомления ≤ 1 мин
- **Constraints**: Таймаут 10с на канал; сбой/отсутствие конфигурации канала не влияет на приём заявки; секреты только в env/GitHub Secrets; VPS RAM ~1GB — без новых фоновых сервисов/очередей
- **Scale/Scope**: Единицы-десятки заявок в день, один получатель на канал

## Constitution Check

| Principle | Status | Justification |
|---|---|---|
| `P1` | not_applicable | Конституция проекта не ратифицирована (шаблон-заглушка); реальных принципов для проверки нет. |

## Project Structure

**Layout**: web_application

Существующая DDD-структура backend: интерфейс и вызов в Application-слое, реализации каналов и DI-регистрация в Infrastructure/API; тесты в существующих тестовых проектах. Frontend не затрагивается.

**Directories**:

- `src/backend/src/Arsenal.Application/`
- `src/backend/src/Arsenal.Infrastructure/`
- `src/backend/src/Arsenal.API/`
- `src/backend/tests/Arsenal.Application.Tests/`
- `src/backend/tests/Arsenal.API.IntegrationTests/`
- `config/ (docker-compose, deploy workflow)`
