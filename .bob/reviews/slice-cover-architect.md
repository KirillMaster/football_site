# Architect review — slice-cover

Диапазон: `git diff c280e08..HEAD` (3c5ffbc coder, f8ecc96 cleaner).

## Verdict: ok

## Проверка границ

**Backend (DDD: API → Application → Domain → Infrastructure)**
- `CoverImage` добавлен как опциональный параметр `CreateNewsCommand` (`Arsenal.Application/Validators/NewsValidator.cs:17`), с правилом `MaximumLength(500)` — формальная валидация на границе, консистентно с существующими полями (`MetaDescription` и т.п.).
- `AdminNewsController.Create` (`Arsenal.API/Controllers/NewsController.cs:68`) вызывает `News.SetCoverImage(req.CoverImage)` уже после `News.Create(...)` — инвариант (просто присвоение + `UpdatedAt`) остаётся в домене (`Arsenal.Domain/Entities/News.cs:61`), контроллер не содержит бизнес-логики, только оркестрацию вызова. Направление зависимостей не нарушено.
- Замечено (не блокирует, вне рамок слайса): `FluentValidation`-валидаторы регистрируются в DI (`AddValidatorsFromAssemblyContaining`), но нигде не вызываются явно (ни middleware, ни ручной `ValidateAsync`) — это pre-existing состояние всего `NewsValidator.cs`, не привнесено этим слайсом. `UpdateNewsCommandValidator` также не имеет правила для `CoverImage`. Стоит завести отдельную задачу, если валидация должна реально применяться.

**Frontend**
- `NewsEditor` (`src/frontend/src/app/admin/news/NewsEditor.tsx`) — весь ввод-вывод медиа идёт через `uploadAdminNewsMedia` из `lib/api.ts`; прямых `fetch` в компоненте или в `page.tsx` нет.
- `page.tsx` импортирует `NewsEditor` и работает с ним через пропсы (`AdminNewsDto`, `onSave`, `onCancel`, `saving`) — без утечки серверных деталей (URL, заголовки и т.п.) в компонент.
- `UploadErrorBanner`, вынесенный cleaner-ом в `NewsEditor.tsx`, используется дважды в том же файле (блоки «Обложка» и «Содержание») — размещение рядом с единственным потребителем уместно, отдельный файл не оправдан при таком масштабе.

## Правки в рамках ревью
Правок не потребовалось — структурных нарушений границ не найдено.

## Тесты
- `dotnet test src/backend`: 113/113 passed (Domain 27, Application 45, API.IntegrationTests 41), exit 0.
- `npm run test` (frontend): 100/100 passed, exit 0.
- `npm run build` (frontend): успешно, без ошибок ESLint (`no-explicit-any` не нарушено).

## Нарушения границ
Не найдено.
