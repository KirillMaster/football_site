# Research: Яндекс.Метрика и сквозная веб-аналитика

## 1. Success-only срабатывание submit-событий

- **Decision**: `reachGoal` вызывается только внутри ветки `if (ok)` (для TryoutForm/ContactForm) и после проверки `res.ok` (для SponsorModal). Никаких вызовов на `onClick`/`onSubmit` до ответа серв百er.
- **Rationale**: ТЗ прямо требует фиксировать конверсию только при реальном сохранении; клик по кнопке ≠ заявка.
- **Alternatives**: событие по `onSubmit` (отклонено — считает неудачные/невалидные попытки); серверная отправка цели через Measurement Protocol (отклонено — избыточно для базовой воронки, требует токен).

## 2. Загрузка счётчика в Next.js 15 App Router

- **Decision**: сохранить существующий `Analytics.tsx` на `next/script` со `strategy="afterInteractive"`, добавить `webvisor:true` в init. Рендер только при заданном `NEXT_PUBLIC_YM_ID`.
- **Rationale**: afterInteractive не блокирует LCP; условный рендер позволяет активировать счётчик настройкой env без пересборки логики (номер придёт от заказчика).
- **Alternatives**: beforeInteractive (отклонено — вредит метрикам скорости); прямой inline-скрипт в layout (отклонено — дублирование, хуже управляемость).

## 3. reachGoal wrapper (lib/analytics.ts)

- **Decision**: тонкая обёртка `reachGoal(goal, params?)`, которая безопасно вызывает `window.ym(YM_ID, 'reachGoal', goal, params)` с guard'ом на наличие `window.ym` и id. Экспорт хелперов под 7 целей.
- **Rationale**: единая точка, не падает при заблокированном счётчике (EC-1), нормализует имена целей (FR-019).
- **Alternatives**: разрозненные вызовы `window.ym` по компонентам (отклонено — дубли, риск опечаток в именах целей).

## 4. Захват UTM первого касания (lib/utm.ts)

- **Decision**: при первом визите читать `utm_*` из `location.search`, сохранять в cookie (срок ~90 дней) только если cookie ещё нет (first-touch). Хелпер `getStoredUtm()` возвращает объект для payload. `ym clientId` берётся через `ym(id,'getClientID', cb)` в момент отправки.
- **Rationale**: cookie переживает перезагрузки и работает для SSR-независимого клиентского захвата; first-touch не перетирается (FR-012). Срок ~90 дней — стандарт атрибуции (A-4).
- **Alternatives**: localStorage (отклонено — не отправляется автоматически, но приемлемо; cookie предпочтительнее для единообразия и возможного серверного чтения); last-touch (отклонено — ТЗ требует first-touch).

## 5. ym clientID timing

- **Decision**: `getClientID` вызывается асинхронно; при отправке формы использовать уже полученное значение или пустую строку, если счётчик не готов (EC-4). Отправку заявки не блокировать.
- **Rationale**: надёжность важнее полноты — заявка не должна теряться из-за аналитики (FR-018).
- **Alternatives**: ждать clientID перед отправкой (отклонено — риск потери заявки при блокировке счётчика).

## 6. Хранение UTM в БД (.NET/EF Core)

- **Decision**: добавить nullable-поля `UtmSource/UtmMedium/UtmCampaign/UtmContent/UtmTerm` (string?) и `YmClientId` (string?) в сущности `TryoutRequest` и `ContactMessage`; расширить Command/DTO; одна EF-миграция; показать в админке.
- **Rationale**: полноценное хранение по решению заказчика; nullable — для прямых заходов (AC-4/EC-3).
- **Alternatives**: единая таблица атрибуции с FK (отклонено — избыточно для объёма; проще inline-поля); JSON-колонка (отклонено — хуже для фильтрации в админке).

## 7. Кнопки карт на /kontakty

- **Decision**: добавить две ссылки-кнопки (Яндекс.Карты, 2ГИС) с координатами клуба; `onClick` → `reachGoal('map_click', {service})`, `target="_blank"`.
- **Rationale**: прямых ссылок на карты нет, только iframe — нужен явный переход для цели map_click (FR-007).
- **Alternatives**: клик по iframe (отклонено — не отслеживается корректно).

## 8. phone_click с местом

- **Decision**: компонент `<PhoneLink place="header|contacts|footer|other">` оборачивает `tel:`-ссылку и шлёт `reachGoal('phone_click', {place})`. Заменить прямые `tel:` в Footer/kontakty/zapisatsya/stazhirovki.
- **Rationale**: единый параметр места (FR-006), нет дублей логики.
- **Alternatives**: глобальный делегированный listener на `a[href^=tel:]` (отклонено — сложнее задать place; менее явно).

## 9. trial_form_open

- **Decision**: `reachGoal('trial_form_open')` один раз при показе формы (useEffect на mount TryoutForm). Так как форма отображается на странице сразу — mount = показ (решение заказчика).
- **Rationale**: заказчик определил open как показ формы на странице; IntersectionObserver избыточен, форма выше сгиба.
- **Alternatives**: IntersectionObserver по viewport (отклонено — усложнение без выгоды для текущих страниц).

Все NEEDS CLARIFICATION разрешены.
