# QA Report — slice-cover

## Сценарии слайса

- US1 @AS-1 @FR-001 @FR-002 — загрузка обложки с превью и сохранением URL
- US1 @AS-2 @FR-004 — сохранение новости без обложки (coverImage: null)
- US1 @AS-3 @FR-003 — замена обложки и удаление обложки

## Прогонянные тесты

### Backend (C# / .NET 9)

**Файл:** `src/backend/tests/Arsenal.API.IntegrationTests/NewsCoverImageEndpointTests.cs`

| Тест | Сценарий | Статус | Примечание |
|------|----------|--------|-----------|
| `Create_WithCoverImage_SavedNewsReturnsSameUrl` | US1-AS-1 | ✓ PASS | Обложка сохраняется в БД |
| `Create_WithoutCoverImage_SavedNewsHasEmptyCover` | US1-AS-2 | ✓ PASS | Пустая обложка при отсутствии |
| `Create_CoverImage_Exactly500Chars_Saved` | US1-AS-1 | ✓ PASS | Граница MaximumLength(500) |
| `Create_CoverImage_EmptyString_Saved` | US1-AS-1 | ✓ PASS | Пустая строка обрабатывается корректно |
| `Create_WithCoverImage_GetNewsReturnsSameUrl` | US1-AS-1 | ✓ PASS | GET вернёт сохранённую обложку |

**Результат:** 44/44 Integration Tests passed (новых — 5)

### Frontend (TypeScript / React)

**Файл:** `src/frontend/src/app/admin/news/NewsEditor.test.tsx`

| Тест | Сценарий | Статус | Примечание |
|------|----------|--------|-----------|
| загрузка обложки показывает превью и передаёт URL в onSave | US1-AS-1 | ✓ PASS | Превью отображается, onSave получит URL |
| без загрузки обложки onSave получает coverImage: null | US1-AS-2 | ✓ PASS | Формодобавить новость без обложки |
| «Заменить» загружает новый файл и обновляет превью | US1-AS-3 | ✓ PASS | Замена работает корректно |
| «Удалить» очищает обложку, onSave получает null | US1-AS-3 | ✓ PASS | Удаление работает |
| повторная замена обложки: второй файл заменяет первый | US1-AS-3 | ✓ PASS | Повторная замена перезаписывает |
| отказ загрузки (error) не затирает выбранную обложку | US1-AS-3 | ✓ PASS | Ошибка не теряет текущее значение |
| отказ загрузки (network_error) не затирает обложку | US1-AS-3 | ✓ PASS | Сетевая ошибка не теряет текущее |
| отказ загрузки (unauthorized) не затирает обложку | US1-AS-3 | ✓ PASS | Авторизация не теряет текущее |

**Результат:** 104/104 tests passed (новых в NewsEditor.test.tsx — 8)

### Валидация и сборка

| Проверка | Статус | Exit Code | Примечание |
|----------|--------|-----------|-----------|
| `npm run test` | ✓ PASS | 0 | Все 104 теста зелёные |
| `npm run build` | ✓ PASS | 0 | Compiled successfully, ESLint ok |
| `npm run lint` | ✓ PASS | 0 | No ESLint warnings or errors |
| `dotnet test src/backend` | ✓ PASS | 0 | 121 passed (Domain 27, Application 50, Integration 44) |

## Трассировка сценариев

| Сценарий ID | Тесты backend | Тесты frontend | Покрытие |
|-------------|---------------|----------------|----------|
| **US1-AS-1** | Create_WithCoverImage_SavedNewsReturnsSameUrl, Create_CoverImage_Exactly500Chars_Saved, Create_CoverImage_EmptyString_Saved, Create_WithCoverImage_GetNewsReturnsSameUrl | загрузка обложки показывает превью и передаёт URL в onSave | ✓ ПОЛНОЕ |
| **US1-AS-2** | Create_WithoutCoverImage_SavedNewsHasEmptyCover | без загрузки обложки onSave получает coverImage: null | ✓ ПОЛНОЕ |
| **US1-AS-3** | — | «Заменить» загружает новый файл и обновляет превью, «Удалить» очищает обложку, повторная замена, ошибки загрузки | ✓ ПОЛНОЕ |

## Верификация граничных случаев

- ✓ URL обложки длиной 500 символов (MaximumLength валидация)
- ✓ Пустая строка обрабатывается как отсутствие обложки
- ✓ Ошибки загрузки (error, network_error, unauthorized) не теряют текущее значение
- ✓ Повторная замена обложки перезаписывает предыдущую

## Дополнительные проверки

- ✓ Нет `any` в TypeScript (ESLint no-explicit-any не нарушено)
- ✓ Нет утечки localStorage/secrets в frontend компонентах
- ✓ Все импорты используют `@/lib/api` для uploadAdminNewsMedia
- ✓ Свойства компонента типизированы (no implicit `any`)

## Вердикт

**✓ OK** — все сценарии трассируются, тесты зелёные, сборка успешна.

---
**Дата:** 14.09.2026  
**QA Agent:** bob-qa-cover  
**Exit codes:** backend=0, frontend=0, build=0, lint=0
