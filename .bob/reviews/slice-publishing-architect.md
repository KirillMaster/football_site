# Architect review — slice-publishing

**Verdict: ok**

## Границы модулей

Backend (API → Application → Domain → Infrastructure):
- `AdminNewsController` получил `IValidator<CreateNewsCommand>`/`IValidator<UpdateNewsCommand>` (FluentValidation, Application-слой) и вызывает их до записи — валидация на границе, не в контроллере.
- Проверка занятого slug — простая query-проверка перед вставкой (EC-4), не бизнес-инвариант, уместна в контроллере.
- Публикация/снятие с публикации делегированы в домен: `news.Publish()` / `news.Unpublish()` (`Arsenal.Domain/Entities/News.cs`) — `PublishedAt` выставляется внутри агрегата, контроллер только оркестрирует.
- Направление зависимостей не нарушено, новых обратных ссылок Domain→Application/API нет.

Frontend:
- Весь сетевой I/O новых полей публикации идёт через `src/frontend/src/lib/api.ts` (`adminMutateNews`, `uploadAdminNewsMedia`) — в `NewsEditor.tsx` прямых `fetch`/`adminFetch` нет.
- `src/frontend/src/lib/slug.ts` — чистые функции (`slugify`, `isValidSlug`), без побочных эффектов и импортов из компонентов.

## Проверки

- `dotnet test src/backend` — 126/126 (27+50+49), exit 0.
- `npm test -- --run` (frontend) — 118/118, exit 0.
- `npm run build` (frontend) — успешно, типы и lint проходят, `any` в диффе слайса отсутствует.

## Найденные нарушения границ

Отсутствуют.

## Замечания вне рамок (не блокируют)

- `src/frontend/src/app/admin/news/page.tsx:35` — `const data: any = await getAdminNews();` с `eslint-disable-next-line` — существующий код (коммит 2026-04-13), не тронут этим слайсом. Вне рамок slice-publishing.
