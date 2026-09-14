<!-- GENERATED FILE — DO NOT EDIT BY HAND.
     This file is rendered from the corresponding .yaml artifact and will be
     overwritten the next time it is regenerated. Edit the .yaml source instead. -->

# Tasks: Полноценный редактор новостей в админке

## `T001` Эндпоинт загрузки медиа новостей [P] [US4]

Добавить POST /api/admin/news/media — загрузку изображения или видео в S3 без создания записи Photo в публичной фотогалерее.

**Context**: Сейчас единственная загрузка файлов в админке кладёт каждый файл в публичную фотогалерею и не принимает видео — иллюстрации новостей засоряли бы галерею сайта.

- **Depends on**: —
- **Requirements**: FR-016, FR-017, FR-018
- **Entities**: news_media_asset, upload_outcome
- **Contracts**: news_media_upload

**Steps**:

1. **Создать контроллер NewsMediaController** — src/backend/src/Arsenal.API/Controllers/NewsMediaController.cs, атрибуты [ApiController] [Route("api/admin/news")] [Authorize(Roles = "admin")], конструктор принимает IStorageService (как в PhotosController).
2. **Реализовать действие Upload** — [HttpPost("media")] Task<IActionResult> Upload(IFormFile file): допустимые ContentType — image/jpeg, image/png, image/webp, video/mp4; лимит 20 * 1024 * 1024 байт; при нарушении вернуть BadRequest с русскоязычным message.
3. **Сохранить файл и вернуть результат** — Вызвать _storage.UploadAsync(stream, file.FileName, file.ContentType) как в PhotosController, вернуть Ok(new { url, key, mediaType }), где mediaType — "video" для video/*, иначе "image". Записи Photo и MediaFile не создавать.
4. **Зарегистрировать лимит запроса** — Проставить [RequestSizeLimit] по образцу PhotosController.Upload, чтобы крупный файл отклонялся так же.

**Technical Notes**:

- `src/backend/src/Arsenal.API/Controllers/PhotosController.cs`: Образец: маршрут admin-раздела, авторизация по роли, проверка размера, вызов IStorageService.
- `src/backend/src/Arsenal.Infrastructure/Services/S3StorageService.cs`: UploadAsync формирует ключ {yyyy/MM}/{guid}_{fileName} и публичный URL; ничего менять не нужно.

**Acceptance Criteria**:

- [ ] `AC-1` Изображение до 20 МБ загружается и в ответе приходит публичная ссылка
- [ ] `AC-2` Файл video/mp4 принимается и в ответе mediaType равен video
- [ ] `AC-3` Файл неподдерживаемого типа и файл свыше лимита отклоняются с русскоязычным сообщением
- [ ] `AC-4` Запрос без сессии администратора отклоняется

**Test Scenarios**:

- `TS-1` (integration)
  - Given: авторизованный администратор; изображение JPEG размером 1 МБ
  - When: выполняется POST /api/admin/news/media
  - Then: ответ 200; в теле есть url и mediaType = image
  - Verification: automated
- `TS-2` (integration)
  - Given: авторизованный администратор; файл с типом application/pdf
  - When: выполняется POST /api/admin/news/media
  - Then: ответ 400; сообщение на русском о недопустимом типе
  - Verification: automated

## `T002` Загрузка медиа новостей не попадает в публичную фотогалерею [US4]

Подтвердить тестом, что после загрузки через POST /api/admin/news/media число снимков публичной фотогалереи не меняется, а загрузка через раздел фотогалереи работает как прежде.

**Context**: Главный риск новой загрузки — незаметно повторить поведение старого эндпоинта и наполнить публичную галерею служебными картинками из новостей.

- **Depends on**: T001
- **Requirements**: FR-016, FR-019
- **Entities**: news_media_asset
- **Contracts**: news_media_upload, photo_gallery_upload

**Steps**:

1. **Добавить интеграционный тест чистоты галереи** — src/backend/tests/Arsenal.API.IntegrationTests: считать снимки публичной галереи до и после POST /api/admin/news/media, ожидать равенство.
2. **Добавить регрессионный тест старого эндпоинта** — POST /api/admin/photos/upload по-прежнему создаёт запись, видимую в публичной галерее.

**Technical Notes**:

- `src/backend/tests/Arsenal.API.IntegrationTests`: Существующий тестовый проект с фабрикой приложения — новые тесты добавлять туда же.

**Acceptance Criteria**:

- [ ] `AC-1` Число снимков публичной фотогалереи не меняется после загрузки медиа новости
- [ ] `AC-2` Загрузка через раздел фотогалереи по-прежнему добавляет снимок в публичную галерею

**Test Scenarios**:

- `TS-1` (integration)
  - Given: известное число снимков публичной фотогалереи
  - When: изображение загружается через эндпоинт медиа новостей
  - Then: число снимков публичной фотогалереи не изменилось
  - Verification: automated

## `T003` Приём обложки при создании новости [P] [US1]

Добавить необязательное поле CoverImage в CreateNewsCommand, валидатор и обработчик создания новости.

**Context**: Сейчас обложку можно задать только вторым шагом, редактируя уже созданную новость — при создании она молча теряется.

- **Depends on**: —
- **Requirements**: FR-002
- **Entities**: news_draft
- **Contracts**: create_news

**Steps**:

1. **Расширить команду создания** — Добавить string? CoverImage в CreateNewsCommand (там же, где Slug/TitleRu/Tags).
2. **Прокинуть обложку в домен** — В обработчике создания после News.Create(...) вызвать news.SetCoverImage(command.CoverImage), если значение непустое; доменный метод уже существует.
3. **Добавить правило валидации** — src/backend/src/Arsenal.Application/Validators/NewsValidator.cs: для CreateNewsCommand.CoverImage — MaximumLength(500) при непустом значении, по образцу UpdateNewsCommand.CoverImage.
4. **Передать поле из контроллера** — src/backend/src/Arsenal.API/Controllers/NewsController.cs, действие Create: прокинуть req.CoverImage в команду.

**Technical Notes**:

- `src/backend/src/Arsenal.Domain/Entities/News.cs`: SetCoverImage(string? url) уже есть; News.Create обложку не принимает — менять сигнатуру не требуется.
- `src/backend/src/Arsenal.Application/Validators/NewsValidator.cs`: UpdateNewsCommand уже содержит CoverImage — держать правила симметричными.

**Acceptance Criteria**:

- [ ] `AC-1` Новость, созданная с обложкой, возвращает её при последующем чтении
- [ ] `AC-2` Создание без обложки по-прежнему проходит успешно

**Test Scenarios**:

- `TS-1` (integration)
  - Given: корректные поля новости; ссылка на обложку
  - When: выполняется создание новости
  - Then: сохранённая новость содержит переданную обложку
  - Verification: automated
- `TS-2` (unit)
  - Given: корректные поля новости без обложки
  - When: выполняется создание новости
  - Then: новость создана; обложка пуста
  - Verification: automated

## `T004` Ноды редактора: изображение, галерея, видео [P] [US2]

Реализовать три кастомные tiptap-ноды с симметричными parseHTML/renderHTML, воспроизводящими разметку эталонных новостей.

**Context**: Редактор сейчас понимает только текст, поэтому галереи и видео исчезают при сохранении — это ядро всей задачи.

- **Depends on**: —
- **Requirements**: FR-008, FR-009, FR-020
- **Entities**: content_node
- **Contracts**: content_serialization

**Steps**:

1. **Создать модуль нод** — src/frontend/src/components/admin/editor/newsNodes.ts — экспортировать NewsImage, NewsGallery, NewsVideo через Node.create из @tiptap/core.
2. **Описать NewsImage** — Инлайн-блок figure с <img src alt loading="lazy" style="width:100%;height:auto;border-radius:12px">; атрибуты src и alt; parseHTML по селектору img.
3. **Описать NewsGallery** — Контейнер content: 'newsImage+', renderHTML — div со style "display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;margin-top:24px"; parseHTML распознаёт div с grid-template-columns, содержащий изображения.
4. **Описать NewsVideo** — Atom-нода: div style "display:grid;gap:16px;margin-top:24px" > video controls preload="metadata" playsinline style="width:100%;border-radius:12px;background:#000" > source src type="video/mp4" + текст «Ваш браузер не поддерживает воспроизведение видео.»; атрибут src.
5. **Покрыть round-trip тестами** — src/frontend/src/__tests__: сгенерировать HTML из документа и распарсить обратно; отдельный кейс — HTML из существующей программно созданной новости (галерея из 3 фото + видео) даёт то же число нод.

**Technical Notes**:

- `src/frontend/src/app/novosti/[slug]/page.tsx`: Контент рендерится через dangerouslySetInnerHTML в prose-club без стилей галереи — разметка обязана быть самодостаточной (inline-стили).
- `src/frontend/package.json`: @tiptap/react, @tiptap/starter-kit, @tiptap/extension-image 2.7 уже установлены.

**Acceptance Criteria**:

- [ ] `AC-1` Галерея сериализуется в грид-разметку эталона с сохранением alt каждого изображения
- [ ] `AC-2` Видеоблок сериализуется с controls, preload=metadata и источником video/mp4
- [ ] `AC-3` Разбор ранее сохранённого HTML восстанавливает то же число элементов содержимого

**Test Scenarios**:

- `TS-1` (unit)
  - Given: документ с галереей из трёх изображений и описаниями
  - When: выполняется сериализация содержимого
  - Then: HTML содержит грид-контейнер и три изображения с атрибутом alt
  - Verification: automated
- `TS-2` (unit)
  - Given: HTML существующей новости с галереей и видео
  - When: содержимое загружается в редактор и сериализуется обратно
  - Then: число элементов совпадает; видеоисточник сохранён
  - Verification: automated

## `T005` Клиент загрузки медиа новостей [US2]

Добавить в API-клиент функцию загрузки файла новости и типизированный результат с причиной отказа.

**Context**: Редактору нужен единый способ отправить файл и понятно показать, почему конкретный файл не загрузился.

- **Depends on**: T001
- **Requirements**: FR-018
- **Entities**: news_media_asset, upload_outcome
- **Contracts**: news_media_upload

**Steps**:

1. **Добавить функцию uploadAdminNewsMedia** — src/frontend/src/lib/api.ts, рядом с uploadAdminPhoto: FormData с полем file, adminFetch(`${API_URL}/api/admin/news/media`).
2. **Вернуть результат с причиной** — Возвращать { status, url?, mediaType?, message? } со status из набора uploaded / rejected_too_large / rejected_unsupported_type / failed_network; сетевую ошибку не выбрасывать наружу.

**Technical Notes**:

- `src/frontend/src/lib/api.ts`: adminFetch уже добавляет заголовок авторизации и обрабатывает истёкшую сессию — переиспользовать его.

**Acceptance Criteria**:

- [ ] `AC-1` Успешная загрузка возвращает ссылку и категорию файла
- [ ] `AC-2` Отказ сервера и сетевой сбой превращаются в результат с причиной, а не в необработанное исключение

**Test Scenarios**:

- `TS-1` (unit)
  - Given: сервер отвечает отказом по размеру файла
  - When: вызывается загрузка медиа новости
  - Then: результат содержит статус отказа по размеру и сообщение
  - Verification: automated

## `T006` Панель вставки галереи и видео в редакторе [US2]

Добавить в панель инструментов редактора кнопки вставки галереи (мульти-выбор файлов) и видео с загрузкой файлов и вставкой соответствующих нод.

**Context**: Админ должен собрать галерею из нескольких фото одной операцией, а не вставлять картинки по одной.

- **Depends on**: T004, T005
- **Requirements**: FR-005, FR-007, FR-018
- **Entities**: content_node, upload_outcome
- **Contracts**: news_media_upload

**Steps**:

1. **Подключить ноды к редактору** — src/frontend/src/app/admin/news/page.tsx: добавить NewsImage, NewsGallery, NewsVideo в extensions рядом со StarterKit.
2. **Добавить кнопку «Галерея»** — Скрытый <input type="file" accept="image/*" multiple> по образцу src/frontend/src/app/admin/photos/page.tsx; загрузить все выбранные файлы, вставить одну ноду галереи с успешно загруженными изображениями.
3. **Добавить кнопку «Видео»** — Скрытый <input type="file" accept="video/mp4">; после загрузки вставить ноду видео с полученной ссылкой.
4. **Показать результаты загрузки** — Вывести список отклонённых файлов с причиной; успешные файлы вставляются независимо от отказов по остальным. Сбрасывать value у input после выбора.
5. **Показать индикатор загрузки** — На время загрузки блокировать повторное нажатие кнопок, редактор оставить доступным для набора текста.

**Technical Notes**:

- `src/frontend/src/app/admin/photos/page.tsx`: Готовый образец мульти-загрузки: скрытый input, цикл по файлам, сброс fileInputRef.current.value.
- `src/frontend/src/app/admin/news/page.tsx`: Текущая панель: B / I / H2 / список — новые кнопки добавлять в тот же ряд, классы btn-outline.

**Acceptance Criteria**:

- [ ] `AC-1` Выбор трёх изображений одной операцией вставляет одну галерею с тремя фотографиями
- [ ] `AC-2` Выбор файла MP4 вставляет в текст работающий плеер
- [ ] `AC-3` Отклонённый файл показывает причину и не мешает загрузке остальных

**Test Scenarios**:

- `TS-1` (e2e)
  - Given: открыт редактор новости; подготовлены три изображения
  - When: администратор выбирает их одной операцией
  - Then: в тексте появляется галерея из трёх фотографий
  - Verification: manual

## `T007` Описания изображений (alt) внутри текста [US2]

Дать возможность задать русскоязычное описание каждому изображению прямо в редакторе, с предзаполнением из имени файла и пометкой изображений без описания.

**Context**: Описания нужны для поиска и доступности, но запрашивать их модальным окном на каждый файл при загрузке галереи неудобно.

- **Depends on**: T004, T006
- **Requirements**: FR-006
- **Entities**: content_node
- **Contracts**: content_serialization

**Steps**:

1. **Добавить редактируемую подпись** — NodeView для NewsImage: поле подписи под изображением, значение пишется в атрибут alt ноды.
2. **Предзаполнить описание** — При вставке подставлять имя файла без расширения как заготовку alt.
3. **Пометить изображения без описания** — Визуальная пометка «без описания» у изображений с пустым alt; сохранение при этом не блокируется.

**Technical Notes**:

- `src/frontend/src/components/admin/editor/newsNodes.ts`: Атрибут alt уже объявлен в NewsImage — NodeView только редактирует его.

**Acceptance Criteria**:

- [ ] `AC-1` Введённое описание сохраняется в разметке изображения
- [ ] `AC-2` Изображение без описания видимо помечено, но сохранению не мешает

**Test Scenarios**:

- `TS-1` (unit)
  - Given: в тексте есть изображение
  - When: администратор вводит описание и сохраняет новость
  - Then: описание присутствует в сохранённой разметке
  - Verification: automated

## `T008` Обложка новости в форме редактора [US1]

Добавить загрузку обложки с превью, заменой и удалением, и передавать её при создании и обновлении новости.

**Context**: Обложка — первое, что видит читатель в списке и в соцсетях; сейчас задать её из админки нельзя.

- **Depends on**: T003, T005
- **Requirements**: FR-001, FR-003, FR-004
- **Entities**: news_draft, news_media_asset
- **Contracts**: create_news, update_news, news_media_upload

**Steps**:

1. **Добавить блок обложки в форму** — src/frontend/src/app/admin/news/page.tsx: состояние coverImage, кнопка загрузки через uploadAdminNewsMedia, превью изображения, кнопки «Заменить» и «Удалить».
2. **Передавать обложку при сохранении** — Включить coverImage в тело createAdminNews и updateAdminNews; при удалении отправлять пустое значение.
3. **Заполнять обложку при открытии** — В openEdit подставлять coverImage из загруженной новости, чтобы сохранение без изменений её не затирало.

**Technical Notes**:

- `src/frontend/src/lib/api.ts`: createAdminNews/updateAdminNews — тела запросов расширяются полем coverImage.

**Acceptance Criteria**:

- [ ] `AC-1` Загруженная обложка показывается превью до сохранения
- [ ] `AC-2` Созданная с обложкой новость показывает её на публичной странице
- [ ] `AC-3` Сохранение без изменения обложки сохраняет прежнюю
- [ ] `AC-4` Удаление обложки убирает её у новости

**Test Scenarios**:

- `TS-1` (integration)
  - Given: открыта новость с обложкой
  - When: администратор меняет только заголовок и сохраняет
  - Then: обложка остаётся прежней
  - Verification: automated

## `T009` Публикационные поля: адрес, теги, SEO, статус [P] [US3]

Добавить в форму адрес новости с автогенерацией и проверкой формата, редактор тегов, SEO-заголовок и SEO-описание со счётчиками и переключатель публикации.

**Context**: Без этих полей админ не управляет адресом страницы, её видимостью и тем, как новость выглядит в поиске и мессенджерах.

- **Depends on**: —
- **Requirements**: FR-010, FR-011, FR-012, FR-013, FR-014
- **Entities**: news_draft
- **Contracts**: create_news, update_news

**Steps**:

1. **Вынести формирование адреса** — Перенести текущие TRANSLIT и slugify из src/frontend/src/app/admin/news/page.tsx в src/frontend/src/lib/ и покрыть unit-тестами (кириллица, пробелы, знаки препинания, повторные дефисы).
2. **Добавить поле адреса** — Поле с автоподстановкой из заголовка и ручной правкой; перед отправкой проверять ^[a-z0-9-]+$ и показывать сообщение при нарушении.
3. **Добавить редактор тегов** — Ввод тега с добавлением по Enter, чипы с кнопкой удаления; состояние — массив строк.
4. **Добавить SEO-поля** — metaTitle (лимит 160) и metaDescription (лимит 300) со счётчиком символов и видимым превышением лимита.
5. **Добавить переключатель публикации** — isPublished в форме; значение отправляется при создании и обновлении.
6. **Показать конфликт адреса** — Отказ сервера по занятому адресу показывать отдельным понятным сообщением.

**Technical Notes**:

- `src/backend/src/Arsenal.Application/Validators/NewsValidator.cs`: Серверные ограничения: Slug ^[a-z0-9\-]+$ до 200, MetaTitle ≤160, MetaDescription ≤300 — клиентские проверки держать в этих же рамках.

**Acceptance Criteria**:

- [ ] `AC-1` Адрес предлагается автоматически по заголовку и правится вручную
- [ ] `AC-2` Адрес с недопустимыми символами не отправляется, показано сообщение
- [ ] `AC-3` Теги добавляются и удаляются, сохраняются вместе с новостью
- [ ] `AC-4` Превышение лимитов SEO-полей видно до сохранения
- [ ] `AC-5` Неопубликованная новость отсутствует в публичном списке

**Test Scenarios**:

- `TS-1` (unit)
  - Given: заголовок на русском со знаками препинания
  - When: формируется адрес новости
  - Then: адрес состоит только из строчных латинских букв, цифр и дефисов
  - Verification: automated
- `TS-2` (integration)
  - Given: новость с выключенной публикацией
  - When: запрашивается публичный список новостей
  - Then: новость в списке отсутствует
  - Verification: automated

## `T010` Полная загрузка и полная отправка новости при редактировании [US3]

При открытии новости заполнять все поля формы, а при сохранении отправлять состояние формы целиком, чтобы ничего не затиралось.

**Context**: Поля, которых нет в форме, уходят на сервер пустыми и стирают обложку, теги или статус публикации — это самая заметная потеря данных.

- **Depends on**: T008, T009
- **Requirements**: FR-004, FR-015, FR-020
- **Entities**: news_draft
- **Contracts**: update_news, content_serialization

**Steps**:

1. **Загружать новость целиком** — В openEdit использовать getAdminNewsById и заполнить заголовок, описание, содержимое, обложку, теги, адрес, SEO-поля и статус публикации.
2. **Отправлять полное состояние** — updateAdminNews получает все поля формы; частичных отправок не делать.
3. **Проверить открытие программно созданной новости** — Открыть существующую новость с галереей и видео, сохранить без изменений, сверить содержимое до и после.

**Technical Notes**:

- `src/frontend/src/lib/api.ts`: getAdminNewsById возвращает полную новость — источник значений для формы.

**Acceptance Criteria**:

- [ ] `AC-1` Открытая на редактирование новость показывает все свои поля заполненными
- [ ] `AC-2` Сохранение без изменений не меняет ни одного поля новости
- [ ] `AC-3` Галерея и видео программно созданной новости переживают цикл открытия и сохранения

**Test Scenarios**:

- `TS-1` (integration)
  - Given: новость с обложкой, тегами и статусом «опубликовано»
  - When: новость открывается и сохраняется без изменений
  - Then: обложка, теги и статус публикации сохранены прежними
  - Verification: automated

## `T011` Устойчивость редактора к сбоям загрузки и истёкшей сессии [US2]

Показывать понятные сообщения при сетевой ошибке, отказе по размеру или типу файла и при истёкшей сессии, сохраняя набранный текст новости.

**Context**: Потерять набранную новость из-за неудачной загрузки одного файла — худший исход для админа.

- **Depends on**: T006
- **Requirements**: FR-018
- **Entities**: upload_outcome
- **Contracts**: news_media_upload

**Steps**:

1. **Обработать сбой загрузки** — При неуспешном результате uploadAdminNewsMedia показать сообщение рядом с панелью, содержимое редактора не очищать, повтор загрузки разрешить.
2. **Обработать истёкшую сессию** — При ответе о необходимости входа показать приглашение войти заново; набранный текст остаётся в редакторе.
3. **Блокировать пустое сохранение** — Пустой заголовок или пустое содержимое — сообщение вместо отправки запроса.

**Technical Notes**:

- `src/frontend/src/lib/api.ts`: adminFetch уже различает ответ об отсутствующей авторизации — использовать его сигнал.

**Acceptance Criteria**:

- [ ] `AC-1` Сетевой сбой загрузки показывает сообщение и не очищает редактор
- [ ] `AC-2` Истёкшая сессия приводит к приглашению войти, а не к молчаливой потере данных
- [ ] `AC-3` Пустой заголовок или пустой текст не отправляются на сервер

**Test Scenarios**:

- `TS-1` (e2e)
  - Given: набранный текст новости; загрузка файла завершается сетевой ошибкой
  - When: администратор видит сообщение и повторяет загрузку
  - Then: текст новости не потерян; повторная загрузка проходит
  - Verification: manual

## `T012` Сквозная проверка паритета с программно созданными новостями [US2]

Пройти сценарии quickstart.md и убедиться, что новость, созданная в админке, по составу элементов не уступает опубликованным программно.

**Context**: Это итоговая проверка исходной цели: админ должен сам публиковать новости прежнего качества.

- **Depends on**: T002, T007, T010, T011
- **Requirements**: FR-009, FR-016, FR-020
- **Entities**: news_draft, content_node
- **Contracts**: content_serialization

**Steps**:

1. **Прогнать автоматические проверки** — npm run test в src/frontend и dotnet test src/backend — обе связки зелёные.
2. **Пройти сценарии quickstart** — Сценарии 1-5 из specs/004-admin-news-rich-editor/quickstart.md, включая проверку неизменности числа снимков публичной фотогалереи.
3. **Сверить публичный рендер** — Сравнить страницу новой новости со страницей ранее опубликованной программно: обложка, абзацы, сетка галереи, плеер, теги.
4. **Проверить сборку** — npm run build и npm run lint во frontend, dotnet build в backend без ошибок.

**Technical Notes**:

- `specs/004-admin-news-rich-editor/quickstart.md`: Сценарии проверки и ожидаемые результаты со ссылками на критерии спецификации.

**Acceptance Criteria**:

- [ ] `AC-1` Автоматические тесты обеих сторон зелёные, сборка и линт без ошибок
- [ ] `AC-2` Все сценарии quickstart пройдены с ожидаемым результатом
- [ ] `AC-3` Страница новости из админки по составу элементов не отличается от программно опубликованной

**Test Scenarios**:

- `TS-1` (e2e)
  - Given: новость создана в админке с обложкой, галереей из трёх фото и видео
  - When: открывается её публичная страница
  - Then: обложка, галерея, плеер и теги отображаются; число снимков публичной фотогалереи не изменилось
  - Verification: manual

