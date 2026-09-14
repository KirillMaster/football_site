# Bob pipeline run report — 004-admin-news-rich-editor-20260914

**Feature**: 004-admin-news-rich-editor — полноценный редактор новостей в админке
**Mode**: day
**Merged**: true (все 5 слайсов смержены в master, `87bc618`)

## Summary

5 слайсов, все прошли полный цикл ролей (coder → cleaner → architect → hardener → qa) и смержены в master без squash. Один send-back (QA слайса slice-publishing) снят in-place репаром той же роли — по невалидному основанию (pre-existing код вне рамок слайса). Один механический гейт (gherkin-traceability, slice-publishing) упал и был починен in-place репаром QA.

Итог: админ может создать новость с обложкой, grid-галереей, видео-блоком, alt-текстами, тегами, slug, SEO-полями и переключателем публикации; разметка совпадает с эталонной программно созданной. Тесты: backend 143 (Domain 27 + Application 50 + Integration 66), frontend 150, `npm run build` exit 0.

## Slice results

### slice-media-endpoint — Эндпоинт загрузки медиа новостей — **merged**

| Scenario | Verdict | Evidence |
|----------|---------|----------|
| US4-AS-12 | pass | UploadNewsMedia_DoesNotIncreasePublicPhotoGalleryCount |
| US4-FR-016 | pass | UploadNewsMedia_ReturnsUrlAndKeyNonEmpty |
| US4-AS-13 | pass | UploadPhotoGallery_StillAddsPhotoToPublicGallery |
| US4-FR-017 | pass | UploadNewsMedia_WithMp4File_ReturnsMediaTypeVideo (+ png/webp/jpeg) |
| US2-EC-3 | pass | UploadNewsMedia_WithUnsupportedContentType_ReturnsBadRequestWithMessage |

**Commits**:

| Role | Commit | Gist |
|------|--------|------|
| coder | `66a0d9d` | NewsMediaController POST /api/admin/news/media |
| cleaner | `876c30a` | рефакторинг без изменения поведения |
| architect | `592143f` | ревью границ — ok |
| hardener | `82ee27c` | усиление тестов |
| qa | `605de89` | 5/5 сценариев |
| merge | `c4dcc29` | merge --no-ff |

**Gates**: все зелёные (tests-green на всех ролях, complexity/duplication baseline у cleaner, gherkin-traceability у qa).

**Send-backs used**: 0 / 3

### slice-editor-nodes — Ноды редактора: изображение, галерея, видео — **merged**

| Scenario | Verdict | Evidence |
|----------|---------|----------|
| US1 @AS-4 @FR-005 | pass | round-trip newsImage |
| US1 @AS-5 @FR-006 | pass | round-trip newsGallery |
| US1 @AS-6 @FR-007 | pass | round-trip newsVideo |
| US1 @AS-7 @FR-008 | pass | inline alt |
| US2 @EC-1 @EC-2 @SC-005 | pass | uploadAdminNewsMedia.test.ts |

**Commits**: coder `257d113`, cleaner `bec645e`, architect `b609696`, hardener `224dc7b`, qa `4f9f8c9`, state `2fb58b7`, merge `29b5855`, постфикс eslint `c280e08`.

**Gates**: все зелёные.

**Send-backs used**: 0 / 3

### slice-cover — Обложка новости (сервер + форма) — **merged**

| Scenario | Verdict | Evidence |
|----------|---------|----------|
| US1 @AS-1 @FR-001 @FR-002 | pass | тесты CreateNewsCommand.CoverImage + форма |
| US1 @AS-2 @FR-004 | pass | замена обложки |
| US1 @AS-3 @FR-003 | pass | удаление обложки |

**Commits**: coder `3c5ffbc`, cleaner `f8ecc96`, architect `3133782`, hardener `00a309d`, qa `bb9ee28`, state `268c0d3`, merge `dc35e7e`.

**Gates**: все зелёные.

**Send-backs used**: 0 / 3

### slice-publishing — Поля публикации и SEO — **merged**

| Scenario | Verdict | Evidence |
|----------|---------|----------|
| US3 @AS-8 @FR-011 | pass | slug автогенерация |
| US3 @AS-9 @FR-012 | pass | ручная правка slug, только [a-z0-9-] |
| US3 @AS-10 @FR-014 | pass | metaTitle ≤160 |
| US3 @AS-11 @FR-015 | pass | metaDescription ≤300 |
| US3 @EC-4 @FR-012 | pass | невалидный slug блокирует сохранение |
| US3 @EC-5 | pass | @US3-EC-5 401 при истёкшей сессии → редирект на логин (adminAuth.test.ts) |
| US3 @FR-013 | pass | переключатель публикации |

**Commits**: coder `538dd29`, cleaner `f412975`, architect `bae2879`, hardener `2fd98ed`, qa `1defe6d` (send-back) → qa-repair `d374267`, state `8e18de8`, merge `39a4e77`.

**Gates**: tests-green зелёный на всех ролях; gherkin-traceability у QA сначала красный (US3-EC-5 без теста) → после in-place репара 7/7 зелёный.

**Send-backs used**: 0 / 3 (send-back QA снят самим QA при репаре — не засчитан, основание оказалось невалидным)

### slice-parity — Сквозная проверка паритета с программно созданными новостями — **merged**

| Scenario | Verdict | Evidence |
|----------|---------|----------|
| quickstart:scenario-1 / SC-001 | pass | Create_FullReferenceNews_PublicPageComposesCoverGalleryVideoTags |
| quickstart:scenario-2 / SC-003 | pass | Update_ProgrammaticallyCreatedNews_PreservesCoverTagsPublishGalleryVideo |
| quickstart:scenario-3 | pass | черновик не в публичном списке; адрес с недопустимыми символами блокирует сохранение |
| quickstart:scenario-4 / SC-004 | pass | CreateNews_WithMediaAssets_DoesNotAddToPublicGallery |
| quickstart:scenario-5 / SC-005 | pass | отклонение части файлов галереи; неподдерживаемый тип; сетевая ошибка видео |

**Commits**: coder `4d3267f`, cleaner `9a14f06`, architect `5468e47`, hardener `c445464`, qa `a9d66ef`, state `778b495`, merge `87bc618`.

**Gates**:

| Gate | Role | Value | Threshold/Baseline | Passed |
|------|------|-------|--------------------|--------|
| tests-green | coder/cleaner/architect/hardener/qa | exit 0 | exit 0 | ✅ |
| complexity-baseline | cleaner | 16 | ≤ 18 | ✅ |
| duplication-baseline | cleaner | 5.56 | ≤ 8.64 | ✅ |
| gherkin-traceability | qa | 9/9 | 100% | ✅ |

**Send-backs used**: 0 / 3

## Deviations

- **Mutation testing отключён конфигом** (`roles.hardener.gates` без mutation-score) — Hardener на всех слайсах усиливал тесты эвристически, а не по выжившим мутантам.
- **slice-media-endpoint**: Coder не пишет запись MediaFile в БД — следовал букве `tasks.yaml` T001, что расходится с `research.md` R2. Дублирование валидации типа/размера между `NewsMediaController` и `PhotosController` оставлено намеренно: извлечение общего кода запрещено FR-019.
- **slice-editor-nodes**: байт-в-байт совпадение атрибута `style` недостижимо через `editor.getHTML()` — проверяется семантическая эквивалентность разметки. Backend возвращает 400 без discriminator ошибки. EC-2 остался без привязки к @FR (в спеке такого FR нет).
- **slice-cover**: Coder вынес `NewsEditor` из `page.tsx` в отдельный компонент (сверх буквы задачи) и попутно исправил баг со stale `editing.coverImage`. Cleaner вынес `UploadErrorBanner`.
- **slice-publishing**: slug неизменяем после создания (в `UpdateNewsCommand` поля Slug нет) — правка адреса доступна только при создании. Backend-валидация slug добавлена сверх буквы T009. `slugify()` реализован без случайного суффикса. Architect выдал замечание про `any` в `page.tsx:35` — pre-existing код с eslint-disable вне рамок слайса.
- **slice-publishing, QA**: вынесен send-back по невалидному основанию (тот самый pre-existing `any`, build при этом проходил exit 0), плюс коммит `1defe6d` имел нештатное сообщение с суффиксом «SEND-BACK». Вместо дорогого возврата к Coder та же роль сделала in-place репар: `any` → `unknown`, eslint-disable удалён, гейт gherkin-traceability починен добавлением реального теста @US3-EC-5.
- **slice-parity**: Coder добавил `aria-label="Файлы галереи"` и `aria-label="Файл видео"` на file-input'ы — только ради тестируемости через `getByLabelText`, поведение не менялось. `UploadErrorBanner` рендерится дважды (у обложки и у контента) с общим состоянием `uploadError` — тесты используют `getAllByText`.
- **Агенты неоднократно переписывали `.bob/state.yaml`** вопреки запрету в промпте (в slice-publishing запись слайса была затёрта и восстановлена вручную). Оркестратор правил state вручную на границах ролей.

## Metrics snapshot

| Metric | Before (baseline) | After |
|--------|-------------------|-------|
| max CCN | 18 | 16 |
| duplicated lines % | 8.64 | 5.56 |
| backend tests | 140 | 143 |
| frontend tests | 144 | 150 |
| line coverage % (informational) | — | — |
