<!-- GENERATED FILE — DO NOT EDIT BY HAND.
     This file is rendered from the corresponding .yaml artifact and will be
     overwritten the next time it is regenerated. Edit the .yaml source instead. -->

# Tasks: Яндекс.Метрика и сквозная веб-аналитика воронки заявок fcarsenal92.ru

## `T001` Создать обёртку reachGoal (lib/analytics.ts) [P] [US1]

Единая безопасная точка отправки целей в Яндекс.Метрику с guard'ом на отсутствие счётчика и хелперами под 7 согласованных целей.

**Context**: Нужна одна точка, чтобы имена целей не расходились и сайт не падал при заблокированном счётчике.

- **Depends on**: —
- **Requirements**: FR-004, FR-018, FR-019
- **Entities**: analytics_goal
- **Contracts**: reach_goal

**Steps**:

1. **Создать файл lib/analytics.ts** — src/frontend/src/lib/analytics.ts — экспортировать reachGoal(name, params?) и getYmClientId(cb).
2. **Реализовать guard** — Проверять наличие window.ym и NEXT_PUBLIC_YM_ID; при отсутствии — молча выходить (contract reach_goal → counter_unavailable), не бросать исключений.
3. **Добавить типизированные имена целей** — Литеральный union из enum analytics_goal.name: trial_form_submit, trial_form_open, phone_click, map_click, other_lead_submit, sponsor_click, sponsor_form_submit.
4. **Реализовать getYmClientId** — window.ym(YM_ID,'getClientID',cb) с fallback на пустую строку, если счётчик не готов (EC-4).

**Technical Notes**:

- `src/frontend/src/components/Analytics.tsx`: Источник YM_ID из NEXT_PUBLIC_YM_ID — переиспользовать ту же переменную окружения.

**Acceptance Criteria**:

- [ ] `AC-1` reachGoal вызывает window.ym только при наличии счётчика; при его отсутствии — no-op без ошибок.
- [ ] `AC-2` Экспортированы имена всех 7 целей, совпадающие с enum analytics_goal.name.

**Test Scenarios**:

- `TS-1` (unit)
  - Given: window.ym не определён (счётчик заблокирован)
  - When: Вызвана reachGoal('phone_click', {place:'footer'})
  - Then: Исключение не выброшено; Никаких сетевых вызовов не произведено
  - Verification: automated

## `T002` Захват UTM первого касания (lib/utm.ts) [P] [US3]

Считывать utm_* из адреса при первом визите, хранить в cookie (~90 дней, first-touch) и отдавать getStoredUtm() для payload заявок.

**Context**: Без сохранённого источника невозможно связать рекламу с заявкой; first-touch не должен перетираться.

- **Depends on**: —
- **Requirements**: FR-011, FR-012, FR-017
- **Entities**: utm_first_touch
- **Contracts**: get_utm_first_touch

**Steps**:

1. **Создать файл lib/utm.ts** — src/frontend/src/lib/utm.ts — экспортировать captureUtmFirstTouch() и getStoredUtm().
2. **Реализовать first-touch запись** — При наличии utm_* в location.search и отсутствии cookie записать cookie 'utm_ft' (JSON: utmSource/Medium/Campaign/Content/Term + capturedAt), max-age ~90 дней, path=/, SameSite=Lax.
3. **Реализовать чтение** — getStoredUtm() парсит cookie → объект UTM (contract get_utm_first_touch → found); при отсутствии → пустой объект (→ empty, EC-3).
4. **Вызвать захват при загрузке** — Вызвать captureUtmFirstTouch() из клиентского слоя (например, в Analytics.tsx useEffect или отдельном client-компоненте в layout).

**Technical Notes**:

- `src/frontend/src/app/layout.tsx`: Место монтирования клиентского захвата на всех страницах.

**Acceptance Criteria**:

- [ ] `AC-1` Первый визит с utm_* создаёт cookie; повторный визит с другими метками cookie не перезаписывает (FR-012).
- [ ] `AC-2` getStoredUtm() возвращает пустой объект при прямом заходе без ошибок.

**Test Scenarios**:

- `TS-1` (unit)
  - Given: Cookie utm_ft уже установлен со source=A
  - When: Визит с ?utm_source=B и повторный getStoredUtm()
  - Then: Возвращается source=A (первое касание сохранено)
  - Verification: automated

## `T003` Добавить поля UTM и YmClientId в доменные сущности [US3]

Расширить TryoutRequest и ContactMessage nullable-полями UtmSource/UtmMedium/UtmCampaign/UtmContent/UtmTerm и YmClientId.

**Context**: Хранилище должно фиксировать источник каждой заявки, допуская пустые значения для прямых заходов.

- **Depends on**: —
- **Requirements**: FR-014
- **Entities**: tryout_request, contact_message
- **Contracts**: —

**Steps**:

1. **Добавить свойства в TryoutRequest** — src/backend/src/Arsenal.Domain — string? UtmSource/UtmMedium/UtmCampaign/UtmContent/UtmTerm, string? YmClientId; учесть неизменяемость/фабричные методы, если сущность их использует.
2. **Добавить те же свойства в ContactMessage** — Аналогично в сущности ContactMessage.

**Technical Notes**:

- `src/backend/src/Arsenal.Domain/`: Соблюсти существующий стиль сущностей (конструкторы/фабрики DDD).

**Acceptance Criteria**:

- [ ] `AC-1` Обе сущности содержат 5 UTM-полей и YmClientId, все nullable.

**Test Scenarios**:

- `TS-1` (unit)
  - Given: Проект Arsenal.Domain
  - When: dotnet build src/backend
  - Then: Сборка успешна с новыми полями
  - Verification: automated

## `T004` Проброс UTM/ymClientId через Application (Commands/DTO) [US3]

Расширить команды создания заявок и DTO приёма полями UTM и YmClientId, передать их в сущности.

**Context**: Слой приложения должен переносить метки из запроса в доменную сущность при сохранении.

- **Depends on**: T003
- **Requirements**: FR-013, FR-014
- **Entities**: tryout_request, contact_message
- **Contracts**: post_tryout, post_contact

**Steps**:

1. **Расширить команды** — src/backend/src/Arsenal.Application — в Command/Handler создания TryoutRequest и ContactMessage добавить UTM + YmClientId и присвоить сущностям.
2. **Расширить DTO** — Добавить поля в request-DTO согласно contracts post_tryout/post_contact (utmSource..utmTerm, ymClientId), все optional.

**Technical Notes**:

- `src/backend/src/Arsenal.Application/`: Commands/DTO; FluentValidation — новые поля необязательные, без строгой валидации.

**Acceptance Criteria**:

- [ ] `AC-1` Команды и DTO принимают UTM/ymClientId и передают их в сохраняемую сущность.

**Test Scenarios**:

- `TS-1` (integration)
  - Given: Команда создания заявки с UTM
  - When: Handler выполнен
  - Then: Сущность сохранена с переданными метками
  - Verification: automated

## `T005` EF-конфигурация и миграция AddUtmAndYmClientId [US3]

Настроить маппинг новых полей и создать одну EF Core миграцию, добавляющую колонки в обе таблицы.

**Context**: Новые поля должны появиться в PostgreSQL без потери существующих данных.

- **Depends on**: T003
- **Requirements**: FR-014
- **Entities**: tryout_request, contact_message
- **Contracts**: —

**Steps**:

1. **Обновить EF-конфигурацию** — src/backend/src/Arsenal.Infrastructure — в конфигурациях сущностей отметить новые колонки nullable (при явном маппинге).
2. **Создать миграцию** — dotnet ef migrations add AddUtmAndYmClientId --project src/backend/src/Arsenal.Infrastructure.
3. **Проверить SQL миграции** — Убедиться, что генерируются nullable-колонки для обеих таблиц; применить dotnet ef database update локально.

**Technical Notes**:

- `src/backend/src/Arsenal.Infrastructure/`: DbContext + Migrations; на проде миграция применяется при деплое/DbInitializer.

**Acceptance Criteria**:

- [ ] `AC-1` Миграция добавляет 6 nullable-колонок в TryoutRequests и ContactMessages, существующие строки сохраняются.

**Test Scenarios**:

- `TS-1` (integration)
  - Given: БД с прежней схемой
  - When: Применена миграция AddUtmAndYmClientId
  - Then: Колонки UTM/YmClientId присутствуют; Старые записи не потеряны
  - Verification: manual

## `T006` Приём UTM/ymClientId в ContactController [US3]

Принять новые поля в POST /api/tryout и POST /api/contact и передать в команды; сохранить возврат { id } как сигнал успеха.

**Context**: API — граница, через которую метки попадают в хранилище; контракт успеха (GUID) остаётся прежним.

- **Depends on**: T004
- **Requirements**: FR-013, FR-014, FR-016
- **Entities**: tryout_request, contact_message
- **Contracts**: post_tryout, post_contact

**Steps**:

1. **Расширить модели запроса контроллера** — src/backend/src/Arsenal.API/Controllers/ContactController.cs — добавить UTM/ymClientId в обе request-модели.
2. **Передать в команды** — Прокинуть новые поля в MediatR-команды создания; ответ created по-прежнему { id, message }.

**Technical Notes**:

- `src/backend/src/Arsenal.API/Controllers/ContactController.cs`: POST api/tryout и api/contact; id = GUID заявки (сигнал успеха для клиента).

**Acceptance Criteria**:

- [ ] `AC-1` Оба эндпоинта принимают UTM/ymClientId и возвращают { id } при created.

**Test Scenarios**:

- `TS-1` (e2e)
  - Given: POST /api/tryout с UTM-полями
  - When: Запрос обработан успешно
  - Then: Ответ содержит id (GUID); Заявка в БД содержит UTM
  - Verification: manual

## `T007` Показ UTM-меток в админке [US3]

Отобразить сохранённые UTM (и ym clientId) рядом с каждой заявкой в админ-интерфейсе.

**Context**: Владелец должен видеть источник заявки, чтобы вручную довести воронку до продажи.

- **Depends on**: T006
- **Requirements**: FR-015
- **Entities**: tryout_request, contact_message
- **Contracts**: —

**Steps**:

1. **Пробросить UTM в admin API/response** — Добавить UTM/ymClientId в DTO/ответ списка заявок, используемый админкой.
2. **Отрисовать в админ-таблице/карточке** — Показать utm_source/medium/campaign (и остальные при наличии) рядом с заявкой во фронтовой админке.

**Technical Notes**:

- `src/frontend/src/app/`: Страница/раздел админки со списком заявок — добавить колонки/поля UTM.

**Acceptance Criteria**:

- [ ] `AC-1` В админке для заявки с UTM метки видны; для прямого захода поля пусты без ошибок.

**Test Scenarios**:

- `TS-1` (e2e)
  - Given: Заявка с utm_source=test в БД
  - When: Администратор открывает список заявок
  - Then: UTM отображаются рядом с заявкой
  - Verification: manual

## `T008` Проброс UTM/ymClientId в payload заявок (api.ts) [US1]

Дополнить submitTryoutRequest и submitContactMessage метками из getStoredUtm() и ym clientId перед отправкой.

**Context**: Метки, захваченные на фронте, должны уходить на сервер вместе с заявкой.

- **Depends on**: T002
- **Requirements**: FR-013
- **Entities**: tryout_request, contact_message
- **Contracts**: post_tryout, post_contact

**Steps**:

1. **Дополнить payload** — src/frontend/src/lib/api.ts — в submitTryoutRequest и submitContactMessage добавить в тело getStoredUtm() и ym clientId (getYmClientId из lib/analytics.ts).
2. **Не блокировать отправку** — Если clientId недоступен — отправлять пустую строку, заявку не задерживать (EC-4, FR-018).

**Technical Notes**:

- `src/frontend/src/lib/api.ts`: Функции возвращают boolean(res.ok) — контракт успеха сохранить.

**Acceptance Criteria**:

- [ ] `AC-1` Payload обоих запросов содержит UTM-поля и ymClientId (возможно пустые).

**Test Scenarios**:

- `TS-1` (integration)
  - Given: Cookie utm_ft со source=test
  - When: Вызвана submitTryoutRequest
  - Then: Тело запроса содержит utmSource=test
  - Verification: automated

## `T009` Событие trial_form_submit (success-only) в TryoutForm [US1]

Вызывать reachGoal('trial_form_submit', {leadId}) строго в ветке успеха отправки заявки на пробную.

**Context**: Главная конверсия должна считаться только при реальном сохранении заявки на сервере.

- **Depends on**: T001, T008
- **Requirements**: FR-003, FR-004, FR-016
- **Entities**: analytics_goal, tryout_request
- **Contracts**: post_tryout, reach_goal

**Steps**:

1. **Вернуть id из api.ts** — При необходимости расширить submitTryoutRequest, чтобы отдать { ok, id } (leadId) для params цели.
2. **Вызвать reachGoal в if(ok)** — src/frontend/src/components/TryoutForm.tsx — внутри существующей ветки успеха (setSuccess(true)) вызвать reachGoal('trial_form_submit', { leadId: id }).
3. **Гарантировать один вызов** — Событие ровно один раз на одну успешную отправку; блокировать повторный сабмит при in-flight (EC-5).

**Technical Notes**:

- `src/frontend/src/components/TryoutForm.tsx`: Уже есть if(ok) setSuccess(true) — точка вставки события.

**Acceptance Criteria**:

- [ ] `AC-1` Цель trial_form_submit срабатывает только после успеха сервера и несёт leadId.
- [ ] `AC-2` При ошибке сервера/клике по кнопке цель не срабатывает.

**Test Scenarios**:

- `TS-1` (e2e)
  - Given: Валидная форма на /zapisatsya
  - When: Отправка успешна (res.ok)
  - Then: trial_form_submit достигнута один раз; В params есть leadId
  - Verification: manual
- `TS-2` (integration)
  - Given: Сервер возвращает ошибку
  - When: Форма отправлена
  - Then: trial_form_submit не достигнута
  - Verification: manual

## `T010` Включить Вебвизор и карты в инициализации счётчика (Analytics.tsx) [P] [US2]

Добавить webvisor:true к init счётчика, сохранив clickmap/trackLinks/accurateTrackBounce; рендер только при заданном NEXT_PUBLIC_YM_ID.

**Context**: Счётчик подключён, но без Вебвизора; на проде активируется заданием идентификатора в окружении.

- **Depends on**: —
- **Requirements**: FR-001, FR-002
- **Entities**: —
- **Contracts**: —

**Steps**:

1. **Добавить webvisor в init** — src/frontend/src/components/Analytics.tsx — в объект инициализации ym добавить webvisor:true (clickmap/trackLinks/accurateTrackBounce уже есть).
2. **Подтвердить условный рендер** — Компонент рендерится/инициализируется только при непустом NEXT_PUBLIC_YM_ID (strategy afterInteractive).

**Technical Notes**:

- `src/frontend/src/components/Analytics.tsx`: next/script afterInteractive; карта скроллинга и аналитика форм включаются в кабинете (A-5).

**Acceptance Criteria**:

- [ ] `AC-1` Init счётчика содержит webvisor:true и clickmap:true.
- [ ] `AC-2` При пустом NEXT_PUBLIC_YM_ID счётчик не рендерится.

**Test Scenarios**:

- `TS-1` (e2e)
  - Given: Задан NEXT_PUBLIC_YM_ID
  - When: Загружается страница
  - Then: Скрипт счётчика присутствует; webvisor включён в init
  - Verification: manual

## `T011` Компонент PhoneLink и замена tel:-ссылок [US4]

Создать <PhoneLink place> с событием phone_click и заменить прямые tel:-ссылки в Footer/kontakty/zapisatsya/stazhirovki.

**Context**: Клики по телефону нужно считать с указанием места на сайте.

- **Depends on**: T001
- **Requirements**: FR-006
- **Entities**: analytics_goal
- **Contracts**: reach_goal

**Steps**:

1. **Создать компонент** — src/frontend/src/components/PhoneLink.tsx — props place: 'header'|'contacts'|'footer'|'other'; onClick → reachGoal('phone_click', {place}).
2. **Заменить tel: в Footer** — src/frontend/src/components/Footer.tsx (settings.phones.map) — place='footer'.
3. **Заменить tel: на страницах** — /kontakty (place='contacts'), /zapisatsya (place='other'), /prodvizhenie/stazhirovki (place='other').

**Technical Notes**:

- `src/frontend/src/components/Footer.tsx`: tel:-ссылки формируются из settings.phones.

**Acceptance Criteria**:

- [ ] `AC-1` Клик по любому телефону фиксирует phone_click с корректным place.

**Test Scenarios**:

- `TS-1` (e2e)
  - Given: Страница контактов с PhoneLink place='contacts'
  - When: Клик по номеру
  - Then: phone_click достигнута с place='contacts'
  - Verification: manual

## `T012` Событие trial_form_open при показе формы [US4]

Вызывать reachGoal('trial_form_open') один раз при монтировании формы пробной тренировки.

**Context**: Заказчик определил показ формы как её отображение на странице (mount).

- **Depends on**: T001
- **Requirements**: FR-005
- **Entities**: analytics_goal
- **Contracts**: reach_goal

**Steps**:

1. **Добавить useEffect на mount** — src/frontend/src/components/TryoutForm.tsx — useEffect([], ...) с reachGoal('trial_form_open'); guard от повторного вызова в StrictMode (ref).

**Technical Notes**:

- `src/frontend/src/components/TryoutForm.tsx`: Форма отображается сразу (выше сгиба) — mount = показ.

**Acceptance Criteria**:

- [ ] `AC-1` trial_form_open фиксируется один раз за просмотр страницы с формой.

**Test Scenarios**:

- `TS-1` (e2e)
  - Given: Открыта /zapisatsya
  - When: Форма смонтирована
  - Then: trial_form_open достигнута один раз
  - Verification: manual

## `T013` Кнопки карт (Яндекс.Карты, 2ГИС) на /kontakty [US4]

Добавить две ссылки-кнопки с координатами клуба и событием map_click {service}.

**Context**: Прямых ссылок на карты нет, только iframe — нужен явный переход для измеримой цели.

- **Depends on**: T001
- **Requirements**: FR-007
- **Entities**: analytics_goal
- **Contracts**: reach_goal

**Steps**:

1. **Добавить кнопки на страницу контактов** — src/frontend/src/app/kontakty — две ссылки target=_blank: Яндекс.Карты и 2ГИС с координатами клуба.
2. **Повесить событие** — onClick → reachGoal('map_click', { service: 'yandex' | '2gis' }).

**Technical Notes**:

- `src/frontend/src/app/kontakty/`: Рядом с существующим iframe-эмбедом карты.

**Acceptance Criteria**:

- [ ] `AC-1` Обе кнопки присутствуют; клик фиксирует map_click с service=yandex/2gis.

**Test Scenarios**:

- `TS-1` (e2e)
  - Given: Страница /kontakty
  - When: Клик по кнопке 2ГИС
  - Then: map_click достигнута с service='2gis'
  - Verification: manual

## `T014` Событие other_lead_submit (success-only) в ContactForm [US5]

Вызывать reachGoal('other_lead_submit', {leadId}) в ветке успеха отправки общей формы.

**Context**: Заявки на прочие направления (PRO, сборы, стажировки) нужно считать отдельной целью.

- **Depends on**: T001, T008
- **Requirements**: FR-004, FR-008
- **Entities**: analytics_goal, contact_message
- **Contracts**: post_contact, reach_goal

**Steps**:

1. **Вызвать reachGoal в if(ok)** — src/frontend/src/components/ContactForm.tsx — в существующей ветке успеха вызвать reachGoal('other_lead_submit', { leadId: id }).

**Technical Notes**:

- `src/frontend/src/components/ContactForm.tsx`: success уже только при if(ok) — точка вставки события.

**Acceptance Criteria**:

- [ ] `AC-1` other_lead_submit срабатывает только при подтверждённом успехе сервера.

**Test Scenarios**:

- `TS-1` (e2e)
  - Given: Общая форма прочего направления
  - When: Форма успешно отправлена
  - Then: other_lead_submit достигнута один раз
  - Verification: manual

## `T015` Фикс SponsorModal (success-only) + sponsor_click и sponsor_form_submit [US5]

Исправить показ успеха без проверки res.ok, повесить sponsor_click на кнопку и sponsor_form_submit на реальный успех.

**Context**: Сейчас спонсорская форма показывает успех даже при ошибке сервера — это баг; клики и заявки не считаются.

- **Depends on**: T001, T008
- **Requirements**: FR-004, FR-009, FR-010
- **Entities**: analytics_goal, contact_message
- **Contracts**: post_contact, reach_goal

**Steps**:

1. **Исправить проверку успеха** — src/frontend/src/components/SponsorSection.tsx — в SponsorModal.handleSubmit ставить setSubmitted(true) только если res.ok (сейчас — всегда в try).
2. **Повесить sponsor_click** — На кнопку '🤝 Стать генеральным спонсором' — onClick → reachGoal('sponsor_click').
3. **Повесить sponsor_form_submit** — После подтверждённого res.ok — reachGoal('sponsor_form_submit', { leadId: id }).
4. **Пробросить UTM/ymClientId** — Отправку через submitContactMessage (source='sponsor-modal'), чтобы метки уходили из T008.

**Technical Notes**:

- `src/frontend/src/components/SponsorSection.tsx`: handleSubmit (баг success-detection); кнопка спонсорства ~строка 189.

**Acceptance Criteria**:

- [ ] `AC-1` Экран успеха и sponsor_form_submit только при res.ok; при ошибке — ни того, ни другого.
- [ ] `AC-2` Клик по кнопке спонсорства фиксирует sponsor_click.

**Test Scenarios**:

- `TS-1` (integration)
  - Given: Сервер возвращает ошибку
  - When: Спонсорская форма отправлена
  - Then: Экран успеха не показан; sponsor_form_submit не достигнута
  - Verification: manual
- `TS-2` (e2e)
  - Given: Кнопка 'Стать генеральным спонсором'
  - When: Клик по кнопке
  - Then: sponsor_click достигнута
  - Verification: manual

## `T016` Сборка, линт, тесты и проверка деградации при заблокированном счётчике [US1]

Прогнать frontend build+lint, backend build+test, применить миграцию и убедиться, что сайт работает без счётчика.

**Context**: Перед сдачей нужно подтвердить, что аналитика не ломает отправку заявок и всё собирается.

- **Depends on**: T005, T007, T009, T010, T011, T012, T013, T014, T015
- **Requirements**: FR-018
- **Entities**: —
- **Contracts**: —

**Steps**:

1. **Frontend проверки** — cd src/frontend && npm run build && npm run lint.
2. **Backend проверки** — dotnet build src/backend && dotnet test src/backend.
3. **Проверить деградацию** — С пустым NEXT_PUBLIC_YM_ID отправить заявку — сохранение работает, ошибок нет (EC-1).

**Technical Notes**:

- `src/frontend/`: Единый прогон качества перед коммитом.

**Acceptance Criteria**:

- [ ] `AC-1` Все проверки зелёные; заявка отправляется при отсутствии счётчика без ошибок.

**Test Scenarios**:

- `TS-1` (e2e)
  - Given: NEXT_PUBLIC_YM_ID пуст
  - When: Отправлена заявка на пробную
  - Then: Заявка сохранена; Ошибок в консоли/на сайте нет
  - Verification: manual

## `T017` Настройка кабинета Метрики и 7 целей (после получения доступа) [US2]

Задать NEXT_PUBLIC_YM_ID, включить Вебвизор/карты/аналитику форм и создать 7 JS-целей с именами = enum analytics_goal.name.

**Context**: Финальная активация выполняется по кредам заказчика; имена целей должны совпасть с событиями для сдачи.

- **Depends on**: T010
- **Requirements**: FR-002, FR-019
- **Entities**: analytics_goal
- **Contracts**: —

**Steps**:

1. **Задать идентификатор счётчика** — Прописать NEXT_PUBLIC_YM_ID в окружении прода (GitHub Secret / env), пересобрать/задеплоить фронт.
2. **Включить опции в кабинете** — Вебвизор, карта кликов, карта скроллинга, аналитика форм (A-5).
3. **Создать 7 целей типа JS-событие** — Идентификаторы: trial_form_submit, trial_form_open, phone_click, map_click, other_lead_submit, sponsor_click, sponsor_form_submit.

**Technical Notes**:

- `specs/001-yandex-metrika-analytics/quickstart.md`: Чек-лист сдачи заказчику (номер счётчика, скриншоты достижений).

**Acceptance Criteria**:

- [ ] `AC-1` Счётчик активен на проде, 7 целей созданы и срабатывают в сценариях.

**Test Scenarios**:

- `TS-1` (e2e)
  - Given: Счётчик активирован, цели созданы
  - When: Прогон 7 сценариев из quickstart
  - Then: Каждая цель фиксируется в отчёте Метрики
  - Verification: manual

