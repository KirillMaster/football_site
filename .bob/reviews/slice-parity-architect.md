# Architect review — slice-parity

**Слайс:** slice-parity («Сквозная проверка паритета с программно созданными новостями»)
**scenario_refs:** quickstart:scenario-1..5, SC-001, SC-003, SC-004, SC-005 · **task_refs:** T012

## Вердикт: ok

## Изменения слайса
- `src/backend/tests/Arsenal.API.IntegrationTests/NewsParityEndpointTests.cs` — новый тестовый файл, 2 сценария (SC-001/quickstart-scenario-1, SC-003/quickstart-scenario-2/FR-020) + приватный хелпер `AssertReferenceMediaPreserved`.
- `src/frontend/src/app/admin/news/NewsEditor.test.tsx` — +3 сценария (quickstart-scenario-2/SC-003, quickstart-scenario-5/SC-005 ×2 edge-case).
- `src/frontend/src/app/admin/news/NewsEditor.tsx` — `aria-label="Файлы галереи"` и `aria-label="Файл видео"` на скрытых file-input, нужны новым тестам для `getByLabelText`.

## Границы модулей и направление зависимостей
- Новый интеграционный тест использует `AdminNewsController`/`NewsController` напрямую через DI-scope — тот же паттерн, что уже принят в `NewsPublishingEndpointTests` (авторизация не дублируется, покрыта `AuthEndpointTests`). Нарушений слоёв нет: тест находится в тестовом проекте, зависимость направлена тест → API/Application/Infrastructure, как везде в проекте.
- Production-код (`NewsEditor.tsx`) не приобрёл новых зависимостей и новых модулей — только два атрибута доступности на уже существующих input, используются исключительно как публичный DOM-контракт для RTL-тестов и одновременно улучшают a11y. Не затрагивает публичный API компонента (`NewsEditorProps` не менялся).
- Дублирование reference-разметки галереи/видео между C#-тестом (`ReferenceContent`) и TS-тестом (`fullContent`) — приемлемо: это независимые тестовые проекты разных языков без общего рантайма, извлечение в общий модуль невозможно и не нужно.

## Проверка правил
- `any` — не встречается ни в новых тестах, ни в правках.
- Новых `eslint-disable` — нет.

## Прогоны (см. отчёт коммита)
- `dotnet test src/backend` — exit 0, 142/142.
- `npm run test` (frontend) — exit 0, 148/148.
- `npm run build` (frontend) — exit 0.

## Итог
Структурных дефектов нет, ревью механическое (проверка + два тривиальных a11y-атрибута, уже сделанных coder/cleaner). Send-back не требуется.
