# Quickstart — 002-feedback-notifications

Валидация фичи «дублирование обратной связи в Telegram и на email». Контракты: `contracts.yaml` (feedback_notifier, notification_channel, telegram_channel, email_channel); модель: `data-model.yaml`.

## Предусловия
- .NET 9 SDK; сборка: `dotnet build src/backend`.
- Env (локально/на VPS в `/opt/football_site/.env`, в git не попадают): `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `SMTP_USER`, `SMTP_PASSWORD`, опционально `SMTP_HOST`/`SMTP_PORT`/`FEEDBACK_EMAIL_TO`.

## Сценарий 1 — unit/integration тесты (без внешних сервисов)
```bash
dotnet test src/backend
```
Ожидаемо: зелёные тесты на форматирование текста (FR-003), пропуск несконфигурированного канала с warning (skipped_unconfigured), устойчивость к сбою канала (failed → приём заявки успешен), integration на POST /api/contact и /api/tryout с перехваченными транспортами.

## Сценарий 2 — живой Telegram (нужен TELEGRAM_CHAT_ID)
1. Владелец пишет `/start` боту @fc_arsenal_92_bot; chat_id взять из `getUpdates`.
2. Задать env, запустить API, отправить заявку:
```bash
curl -X POST http://localhost:5000/api/contact -H "Content-Type: application/json" \
  -d '{"name":"Тест","phone":"+79780000000","message":"проверка уведомлений"}'
```
Ожидаемо: HTTP 200 сразу (fire-and-forget), в Telegram-чате в течение минуты сообщение с типом заявки, полями, временем (Europe/Moscow).

## Сценарий 3 — живой email (нужен пароль приложения mail.ru)
Задать `SMTP_USER=ars2011sev@mail.ru`, `SMTP_PASSWORD=<app password>`, `FEEDBACK_EMAIL_TO=krystyk@list.ru`; повторить POST из сценария 2. Ожидаемо: письмо на krystyk@list.ru.

## Сценарий 4 — деградация (US3)
Запустить API без TELEGRAM_*/SMTP_* → POST заявки возвращает 200, в логах warning о пропуске каждого канала, ошибок нет.

## Прод-проверка после деплоя
Форма на https://fcarsenal92.ru/contacts → заявка видна в админке (/admin/messages) + уведомления в настроенных каналах; `docker logs football_site-dotnet-api-1` без ошибок уведомлений.
