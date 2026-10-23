# Research — 002-feedback-notifications

## R1. Библиотека отправки SMTP
- **Decision**: MailKit (NuGet), `SecureSocketOptions.SslOnConnect` для smtp.mail.ru:465.
- **Rationale**: `System.Net.Mail.SmtpClient` официально deprecated в .NET; MailKit — рекомендованная Microsoft замена, надёжно работает с implicit SSL 465, который требует mail.ru.
- **Alternatives**: SmtpClient (deprecated, проблемы с 465); внешние API (Sendgrid и т.п.) — лишняя зависимость и регистрация.

## R2. Точка интеграции уведомлений
- **Decision**: Интерфейс `IFeedbackNotifier` в Arsenal.Application; явный вызов из `CreateContactMessageCommandHandler` и `CreateTryoutRequestCommandHandler` после `SaveChangesAsync`. Композитная реализация в Infrastructure перебирает каналы `IFeedbackNotificationChannel`.
- **Rationale**: Минимальная связность, соответствует существующему DDD-разрезу (Application → интерфейс, Infrastructure → транспорт); MediatR pipeline/доменные события — избыточны для двух handlers.
- **Alternatives**: MediatR INotification (больше инфраструктуры ради того же результата); outbox-паттерн (гарантированная доставка не требуется, A-4 спеки).

## R3. Fire-and-forget
- **Decision**: `Task.Run` с `CancellationTokenSource(TimeSpan.FromSeconds(10))` на канал, try/catch + ILogger внутри; никакого await в handler.
- **Rationale**: Требование «ответ не ждёт уведомлений»; объём — единицы заявок в день, очередь/HostedService не оправданы при RAM VPS ~1GB.
- **Alternatives**: BackgroundService + Channel (надёжнее при рестартах, но избыточно); Hangfire (тяжёлая зависимость).

## R4. Telegram Bot API
- **Decision**: `POST https://api.telegram.org/bot{token}/sendMessage` через типизированный HttpClient (`IHttpClientFactory`), `parse_mode` не используем — plain text, чтобы не экранировать MarkdownV2/HTML (EC-3).
- **Rationale**: Одно сообщение одному chat_id; plain text устраняет класс ошибок экранирования.
- **Alternatives**: Telegram.Bot NuGet (лишняя зависимость ради одного метода); MarkdownV2 (хрупкое экранирование).

## R5. Конфигурация
- **Decision**: env: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `SMTP_HOST` (default smtp.mail.ru), `SMTP_PORT` (default 465), `SMTP_USER`, `SMTP_PASSWORD`, `FEEDBACK_EMAIL_TO` (default в коде ars2011sev@mail.ru; на проде задаётся krystyk@list.ru — решение владельца 13.09.2026). Канал считается сконфигурированным при наличии обязательных значений (Telegram: token+chat_id; Email: user+password). Прокинуть через docker-compose (`${VAR}`) и GitHub Actions deploy (append в .env на сервере) как сделано для ADMIN_*.
- **Rationale**: Повторяет существующий механизм секретов проекта (FR-007).
- **Alternatives**: appsettings.json (секреты в git — запрещено).

## Открытые внешние зависимости (не блокируют реализацию)
- chat_id появится после того, как владелец напишет `/start` боту @fc_arsenal_92_bot (getUpdates пуст на 2026-09-13).
- SMTP_PASSWORD — пароль приложения от ящика ars2011sev@mail.ru, ожидается от владельца. До появления канал деградирует в «пропуск с warning» (FR-005).
