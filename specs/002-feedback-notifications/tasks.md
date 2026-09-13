<!-- GENERATED FILE — DO NOT EDIT BY HAND.
     This file is rendered from the corresponding .yaml artifact and will be
     overwritten the next time it is regenerated. Edit the .yaml source instead. -->

# Tasks: Дублирование входящей обратной связи в Telegram и на email

## `T001` Добавить пакет MailKit в Arsenal.Infrastructure [P] [US2]

Подключить NuGet-пакет MailKit к проекту Arsenal.Infrastructure для SMTP-отправки через smtp.mail.ru:465 (SslOnConnect).

**Context**: Штатный System.Net.Mail.SmtpClient устарел и плохо работает с implicit SSL 465; решение R1 из research.md.

- **Depends on**: —
- **Requirements**: FR-002
- **Entities**: —
- **Contracts**: —

**Steps**:

1. **Добавить пакет** — dotnet add src/backend/src/Arsenal.Infrastructure/Arsenal.Infrastructure.csproj package MailKit
2. **Проверить сборку** — dotnet build src/backend — без ошибок

**Technical Notes**:

- `src/backend/src/Arsenal.Infrastructure/Arsenal.Infrastructure.csproj`: Закрепить актуальную стабильную версию MailKit.

**Acceptance Criteria**:

- [ ] `AC-1` MailKit присутствует в csproj, dotnet build проходит.

**Test Scenarios**:

- `TS-1` (unit)
  - Given: чистый checkout
  - When: dotnet build src/backend
  - Then: сборка успешна, MailKit восстанавливается
  - Verification: automated

## `T002` Модель FeedbackNotification и форматирование текста уведомления [P] [US1]

Создать в Arsenal.Application модель FeedbackNotification (kind, title, createdAtMoscow, fields, utm) и форматтер, собирающий plain-text текст: тип заявки, непустые поля, дата/время Europe/Moscow, UTM.

**Context**: Единое транспортно-нейтральное представление заявки, которое используют оба канала (FR-003).

- **Depends on**: —
- **Requirements**: FR-003
- **Entities**: feedback_notification
- **Contracts**: —

**Steps**:

1. **Создать модель** — src/backend/src/Arsenal.Application/Notifications/FeedbackNotification.cs — record с Kind (enum ContactMessage/TryoutRequest), Title, CreatedAtMoscow, упорядоченными парами Fields, опциональным Utm
2. **Создать форматтер** — FeedbackNotificationFormatter.Format(notification) → string: заголовок, затем «Метка: значение» построчно только для непустых полей, дата dd.MM.yyyy HH:mm (TimeZoneInfo 'Europe/Moscow' с fallback 'Russian Standard Time' для Windows), затем UTM-блок при наличии
3. **Добавить фабрики** — Методы FromContactMessage(entity)/FromTryoutRequest(entity), включающие только непустые поля

**Technical Notes**:

- `src/backend/src/Arsenal.Application/Commands/ContactCommands.cs`: Поля сущностей ContactMessage/TryoutRequest (включая UTM/ymClientId) смотреть в Arsenal.Domain.

**Acceptance Criteria**:

- [ ] `AC-1` Текст содержит тип заявки, все непустые поля, время Europe/Moscow; пустые поля не выводятся.

**Test Scenarios**:

- `TS-1` (unit)
  - Given: заявка с частично заполненными полями и UTM
  - When: Format()
  - Then: непустые поля присутствуют; пустые отсутствуют; время в Europe/Moscow
  - Verification: automated

## `T003` IFeedbackNotifier, IFeedbackNotificationChannel и композитный notifier [US3]

Интерфейсы в Arsenal.Application; композитная реализация FeedbackNotifier: fire-and-forget (Task.Run), для каждого канала CancellationTokenSource 10с, try/catch с логированием; несконфигурированный канал — warning и пропуск.

**Context**: Единая расширяемая точка интеграции (FR-008); сбой или отсутствие конфигурации не влияет на приём заявки (US3).

- **Depends on**: T002
- **Requirements**: FR-004, FR-005, FR-006, FR-008
- **Entities**: feedback_notification, notification_channel_config
- **Contracts**: feedback_notifier, notification_channel

**Steps**:

1. **Создать интерфейсы** — Arsenal.Application/Notifications/: IFeedbackNotifier.Notify(FeedbackNotification), IFeedbackNotificationChannel { string Name; bool IsConfigured; Task SendAsync(FeedbackNotification, CancellationToken) }
2. **Реализовать композит** — FeedbackNotifier: Notify() запускает Task.Run; внутри для каждого канала: если !IsConfigured → LogWarning и continue; иначе SendAsync с CTS(10s) в try/catch → LogError при сбое
3. **Зарегистрировать в DI** — Arsenal.API/Program.cs (или существующий метод регистрации Infrastructure): AddSingleton<IFeedbackNotifier, FeedbackNotifier> + каналы

**Technical Notes**:

- `src/backend/src/Arsenal.API/Program.cs`: Следовать существующему стилю DI-регистраций.

**Acceptance Criteria**:

- [ ] `AC-1` Notify() возвращается немедленно; исключение канала не выходит наружу; несконфигурированный канал даёт warning.

**Test Scenarios**:

- `TS-1` (unit)
  - Given: канал-мок, бросающий исключение
  - When: Notify()
  - Then: вызов не бросает; ошибка залогирована
  - Verification: automated
- `TS-2` (unit)
  - Given: канал с IsConfigured=false
  - When: Notify()
  - Then: SendAsync не вызван; warning в логе
  - Verification: automated

## `T004` Вызов notifier из handlers создания заявок [US1]

В CreateContactMessageCommandHandler и CreateTryoutRequestCommandHandler после успешного SaveChangesAsync построить FeedbackNotification и вызвать IFeedbackNotifier.Notify().

**Context**: Уведомление отправляется только после фактического сохранения заявки (FR-001/FR-002), не задерживая ответ (FR-006).

- **Depends on**: T003
- **Requirements**: FR-001, FR-002, FR-006, FR-008
- **Entities**: feedback_notification
- **Contracts**: feedback_notifier

**Steps**:

1. **Внедрить зависимость** — Добавить IFeedbackNotifier в конструкторы обоих handlers в src/backend/src/Arsenal.Application/Commands/ContactCommands.cs
2. **Вызвать после сохранения** — После SaveChangesAsync: _notifier.Notify(FeedbackNotification.FromContactMessage(entity) / FromTryoutRequest(entity)); результат handler не меняется

**Technical Notes**:

- `src/backend/src/Arsenal.Application/Commands/ContactCommands.cs`: Handlers на строках ~9 и ~33; не менять контракт ответа API.

**Acceptance Criteria**:

- [ ] `AC-1` Оба handler вызывают Notify() ровно один раз после сохранения; ответ API не изменился.

**Test Scenarios**:

- `TS-1` (unit)
  - Given: мок IFeedbackNotifier
  - When: handler выполняет команду
  - Then: Notify вызван с корректным Kind после SaveChangesAsync
  - Verification: automated

## `T005` TelegramNotificationChannel [P] [US1]

Канал Telegram в Arsenal.Infrastructure: POST sendMessage через IHttpClientFactory, chat_id и токен из env TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID, plain text без parse_mode.

**Context**: Основной канал уведомлений (US1); plain text исключает ошибки экранирования разметки (EC-3).

- **Depends on**: T003
- **Requirements**: FR-001, FR-007
- **Entities**: feedback_notification, notification_channel_config
- **Contracts**: telegram_channel

**Steps**:

1. **Реализовать канал** — src/backend/src/Arsenal.Infrastructure/Notifications/TelegramNotificationChannel.cs: IsConfigured = оба env непустые; SendAsync → POST https://api.telegram.org/bot{token}/sendMessage с JSON {chat_id, text}; не-2xx или ok=false → исключение
2. **Зарегистрировать HttpClient** — services.AddHttpClient<TelegramNotificationChannel>() + регистрация как IFeedbackNotificationChannel
3. **Исключить токен из логов** — В сообщениях лога не выводить URL с токеном — только имя канала и статус

**Technical Notes**:

- `src/backend/src/Arsenal.Infrastructure/`: Токен только из env; в git не попадает (FR-007).

**Acceptance Criteria**:

- [ ] `AC-1` При заданных env сообщение уходит в Bot API; токен не встречается в логах и коде.

**Test Scenarios**:

- `TS-1` (unit)
  - Given: мок HttpMessageHandler, возвращающий ok=true
  - When: SendAsync()
  - Then: запрос на корректный URL с chat_id и текстом
  - Verification: automated

## `T006` EmailNotificationChannel (MailKit) [P] [US2]

Канал email в Arsenal.Infrastructure: MailKit SmtpClient, SMTP_HOST/SMTP_PORT (default smtp.mail.ru:465, SslOnConnect), auth SMTP_USER/SMTP_PASSWORD, получатель FEEDBACK_EMAIL_TO (default ars2011sev@mail.ru).

**Context**: Второй канал (US2); работает независимо от Telegram.

- **Depends on**: T001, T003
- **Requirements**: FR-002, FR-007
- **Entities**: feedback_notification, notification_channel_config
- **Contracts**: email_channel

**Steps**:

1. **Реализовать канал** — src/backend/src/Arsenal.Infrastructure/Notifications/EmailNotificationChannel.cs: IsConfigured = SMTP_USER и SMTP_PASSWORD непустые; SendAsync собирает MimeMessage (From=SMTP_USER, To=FEEDBACK_EMAIL_TO, Subject='[fcarsenal92.ru] '+title, TextBody=текст) и шлёт через SmtpClient с SslOnConnect
2. **Зарегистрировать в DI** — как IFeedbackNotificationChannel рядом с Telegram-каналом

**Technical Notes**:

- `src/backend/src/Arsenal.Infrastructure/Notifications/`: Пароль приложения mail.ru появится позже — до этого IsConfigured=false и канал пропускается (A-2).

**Acceptance Criteria**:

- [ ] `AC-1` При полном SMTP-конфиге письмо отправляется; без него канал пропускается с warning.

**Test Scenarios**:

- `TS-1` (unit)
  - Given: SMTP_USER/SMTP_PASSWORD не заданы
  - When: композит вызывает канал
  - Then: IsConfigured=false; SendAsync не вызван
  - Verification: automated

## `T007` Unit-тесты форматирования и устойчивости [US3]

xUnit-тесты в Arsenal.Application.Tests: форматтер (FR-003, пустые поля EC-2, спецсимволы EC-3), композит (сбой канала не бросает FR-004, skip+warning FR-005, вызов после сохранения).

**Context**: Автоматическое подтверждение acceptance-критериев US1/US3 без внешних сервисов.

- **Depends on**: T004, T005, T006
- **Requirements**: FR-003, FR-004, FR-005, FR-006
- **Entities**: feedback_notification
- **Contracts**: feedback_notifier, notification_channel

**Steps**:

1. **Тесты форматтера** — src/backend/tests/Arsenal.Application.Tests/Notifications/FeedbackNotificationFormatterTests.cs: непустые/пустые поля, Europe/Moscow, UTM, текст с * _ [ ] < > остаётся как есть
2. **Тесты композита** — FeedbackNotifierTests.cs: канал бросает → нет исключения + LogError; IsConfigured=false → LogWarning + SendAsync не вызван; таймаут отменяет отправку
3. **Тесты handlers** — Notify вызывается после SaveChangesAsync с корректным Kind (моки)

**Technical Notes**:

- `src/backend/tests/Arsenal.Application.Tests/`: Если тестового проекта нет — создать xUnit-проект и добавить в solution.

**Acceptance Criteria**:

- [ ] `AC-1` dotnet test src/backend зелёный; сценарии TS-1/TS-2/TS-4/TS-5 спеки покрыты.

**Test Scenarios**:

- `TS-1` (unit)
  - Given: набор unit-тестов
  - When: dotnet test src/backend
  - Then: все тесты проходят
  - Verification: automated

## `T008` Integration-тесты POST /api/contact и /api/tryout [US3]

WebApplicationFactory-тесты: заявка сохраняется и возвращает успех при (а) настроенных каналах с перехваченными транспортами, (б) сбое обоих каналов, (в) полностью пустой конфигурации.

**Context**: Сквозное подтверждение US3: приём заявки не зависит от судьбы уведомлений.

- **Depends on**: T007
- **Requirements**: FR-001, FR-002, FR-004, FR-005, FR-006
- **Entities**: feedback_notification
- **Contracts**: feedback_notifier

**Steps**:

1. **Создать/дополнить integration-проект** — src/backend/tests/Arsenal.API.IntegrationTests/: WebApplicationFactory с подменой каналов на фейки (in-memory запись отправок) и тестовой БД
2. **Написать сценарии** — POST /api/contact и /api/tryout: 2xx + запись в БД; фейк-каналы получили уведомление с корректным текстом; вариант с бросающими фейками — ответ всё равно 2xx

**Technical Notes**:

- `src/backend/tests/Arsenal.API.IntegrationTests/`: Реальные Telegram/SMTP в тестах не вызывать.

**Acceptance Criteria**:

- [ ] `AC-1` Integration-тесты зелёные; сбой каналов не меняет код ответа API.

**Test Scenarios**:

- `TS-1` (integration)
  - Given: каналы-фейки бросают исключения
  - When: POST /api/contact
  - Then: ответ 2xx; заявка в БД
  - Verification: automated

## `T009` Прокинуть env в docker-compose и deploy workflow [US1]

Добавить TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, FEEDBACK_EMAIL_TO в environment сервиса dotnet-api в docker-compose.yml (подстановка ${VAR}) и в GitHub Actions deploy (запись в /opt/football_site/.env из GitHub Secrets).

**Context**: Секреты живут только в env/GitHub Secrets (FR-007); значения на сервер кладутся вне git.

- **Depends on**: T005, T006
- **Requirements**: FR-007
- **Entities**: notification_channel_config
- **Contracts**: —

**Steps**:

1. **docker-compose.yml** — В environment dotnet-api добавить семь переменных как ${TELEGRAM_BOT_TOKEN} и т.д. (пустые по умолчанию допустимы — каналы деградируют)
2. **Deploy workflow** — .github/workflows/*deploy*: по образцу ADMIN_EMAIL/ADMIN_PASSWORD прокинуть новые переменные из GitHub Secrets в серверный .env
3. **Серверный .env** — Добавить TELEGRAM_BOT_TOKEN (уже известен) в /opt/football_site/.env по SSH; TELEGRAM_CHAT_ID/SMTP_* — после получения от владельца

**Technical Notes**:

- `docker-compose.yml`: Значения переменных в git не коммитить — только имена.

**Acceptance Criteria**:

- [ ] `AC-1` docker compose config показывает переменные у dotnet-api; workflow пишет их в серверный .env; секретов в git нет.

**Test Scenarios**:

- `TS-1` (e2e)
  - Given: env задан в .env на сервере
  - When: docker compose up -d dotnet-api
  - Then: контейнер видит переменные (docker exec ... printenv)
  - Verification: manual

