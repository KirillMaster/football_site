# Quickstart: проверка Яндекс.Метрики и сквозной аналитики

Валидация фичи end-to-end. Ссылки на контракты — `contracts.yaml` (`post_tryout`, `post_contact`, `reach_goal`, `get_utm_first_touch`), сущности — `data-model.yaml`.

## Предпосылки

- Номер счётчика от заказчика → `NEXT_PUBLIC_YM_ID` (env прод/локально).
- В кабинете Метрики созданы 7 JS-целей с именами = `analytics_goal.name` enum.
- Включены: Вебвизор, карта кликов, карта скроллинга, аналитика форм.
- БД PostgreSQL доступна; применена EF-миграция с UTM/ymClientId полями.

## Сборка и запуск

```bash
# Frontend
cd src/frontend && npm run build && npm run lint
# Backend
dotnet build src/backend && dotnet test src/backend
# EF-миграция (после добавления полей)
dotnet ef migrations add AddUtmAndYmClientId --project src/backend/src/Arsenal.Infrastructure
dotnet ef database update --project src/backend/src/Arsenal.Infrastructure
```

## Сценарии проверки

### SC-1 — счётчик активен
1. Открыть прод-страницу (главная, /kontakty, /zapisatsya).
2. В DevTools → Network есть загрузка `mc.yandex.ru`; в отчёте Метрики появился визит.
3. Инициализация содержит `webvisor:true`, `clickmap:true`.

### SC-2/SC-4 — trial_form_submit (главная цель, success-only)
1. Зайти на `/zapisatsya?utm_source=test&utm_medium=cpc&utm_campaign=q3`.
2. Отправить валидную заявку → контракт `post_tryout` → `created` с `id`.
3. Цель `trial_form_submit` достигнута один раз, в params — `leadId`.
4. Негатив: смоделировать `server_error` → цель НЕ достигается (FR-004).

### trial_form_open
- При открытии `/zapisatsya` цель `trial_form_open` фиксируется один раз за просмотр.

### phone_click
- Клик по телефону в шапке/контактах/подвале → `phone_click` с `place` = header/contacts/footer.

### map_click
- На `/kontakty` кнопки «Яндекс.Карты» и «2ГИС» → `map_click` с `service` = yandex/2gis.

### other_lead_submit (US5)
- Отправить общую форму `/kontakty` → `post_contact` → `created` → цель `other_lead_submit`.

### sponsor_click / sponsor_form_submit (US5, фикс бага)
1. Клик «Стать генеральным спонсором» → `sponsor_click`.
2. Успешная отправка → `created` → экран успеха + `sponsor_form_submit`.
3. Негатив: `server_error` → экран успеха НЕ показан, цель НЕ фиксируется (FR-010).

### SC-5 — UTM в БД и админке
1. Заявка из SC-2 сохранена с `utmSource=test/utmMedium=cpc/utmCampaign=q3` и `ymClientId`.
2. Проверка в PostgreSQL:
   ```bash
   docker run --rm postgres:16-alpine psql 'postgresql://gen_user:PASSWORD@188.225.75.81:5432/football' \
     -c "SELECT id, utm_source, utm_campaign, ym_client_id FROM \"TryoutRequests\" ORDER BY \"CreatedAt\" DESC LIMIT 1;"
   ```
3. В админке UTM видны рядом с заявкой (FR-015).

### EC-1 — блокировщик
- С включённым adblock отправка заявки работает штатно, сайт без ошибок; события просто не уходят.

### EC-3 — прямой заход
- Без UTM заявка сохраняется с пустыми метками (`get_utm_first_touch` → `empty`).

## Готовность к сдаче заказчику
- [ ] Номер счётчика зафиксирован
- [ ] 7 целей созданы и проверены (скриншоты достижений)
- [ ] Скриншот тестовой заявки в админке с UTM
- [ ] Подтверждён идентификатор заявки (GUID) и путь «куда падают заявки» (админка + PostgreSQL)
