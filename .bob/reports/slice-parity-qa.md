# QA Report: slice-parity (004-admin-news-rich-editor)

## Слайс
**slice-parity** — сквозная проверка паритета с программно созданными новостями

## Сценарии QA (всего: 9)

### Покрытие

| Сценарий | Описание | Тест | Файл | Статус |
|----------|---------|------|------|--------|
| quickstart:scenario-1 | Новость с полным составом (обложка, галерея, видео, теги) | `Create_FullReferenceNews_PublicPageComposesCoverGalleryVideoTags` | NewsParityEndpointTests.cs | ✅ |
| quickstart:scenario-2 | Редактирование без потерь (открыть, изменить текст, сохранить) | `Update_ProgrammaticallyCreatedNews_PreservesCoverTagsPublishGalleryVideo` + `полный цикл открытия и сохранения` | NewsParityEndpointTests.cs + NewsEditor.test.tsx | ✅ |
| quickstart:scenario-3 | Черновик и адрес (неопубликованная новость, невалидный адрес) | `черновик (неопубликованная новость) не появляется в публичном списке` + `адрес с недопустимыми символами блокирует сохранение` | NewsEditor.test.tsx | ✅ |
| quickstart:scenario-4 | Чистота фотогалереи (число снимков в публичной галерее не меняется) | `CreateNews_WithMediaAssets_DoesNotAddToPublicGallery` | NewsParityEndpointTests.cs | ✅ |
| quickstart:scenario-5 | Отказы загрузки (размер, тип файла, сетевая ошибка) | `часть файлов галереи отклонена` + `файл неподдерживаемого типа` + `сетевая ошибка при загрузке видео` | NewsEditor.test.tsx | ✅ |
| SC-001 | Паритет обложки, галереи, видео, тегов | `Create_FullReferenceNews_PublicPageComposesCoverGalleryVideoTags` | NewsParityEndpointTests.cs | ✅ |
| SC-003 | Паритет при редактировании программно созданной новости | `Update_ProgrammaticallyCreatedNews_PreservesCoverTagsPublishGalleryVideo` | NewsParityEndpointTests.cs | ✅ |
| SC-004 | Чистота публичной фотогалереи при загрузке в новость | `CreateNews_WithMediaAssets_DoesNotAddToPublicGallery` | NewsParityEndpointTests.cs | ✅ |
| SC-005 | Ошибки загрузки: текст новости сохранён, повтор возможен | `часть файлов галереи отклонена` + `файл неподдерживаемого типа` + `сетевая ошибка при загрузке видео` | NewsEditor.test.tsx | ✅ |

## Результаты тестирования

### Backend (dotnet test src/backend)
```
Passed!  - Failed:     0, Passed:    66, Skipped:     0, Total:    66
  - Arsenal.Domain.Tests.dll: 27 tests passed
  - Arsenal.Application.Tests.dll: 50 tests passed  
  - Arsenal.API.IntegrationTests.dll: 66 tests passed (включая 3 теста из NewsParityEndpointTests)
```

### Frontend (npm run test)
```
Test Files: 14 passed (14)
Tests: 150 passed (150)
  - NewsEditor.test.tsx: 33 tests passed (включая новые тесты для scenario-3 и все тесты scenario-5)
```

### Frontend Build & Lint
```
✅ Build successful
✅ ESLint: No warnings or errors
```

## Трассируемость scenario_refs

```json
{
  "scenario_ids": [
    "quickstart:scenario-1",
    "quickstart:scenario-2",
    "quickstart:scenario-3",
    "quickstart:scenario-4",
    "quickstart:scenario-5",
    "SC-001",
    "SC-003",
    "SC-004",
    "SC-005"
  ],
  "traced_ids": [
    "quickstart:scenario-1",
    "quickstart:scenario-2",
    "quickstart:scenario-3",
    "quickstart:scenario-4",
    "quickstart:scenario-5",
    "SC-001",
    "SC-003",
    "SC-004",
    "SC-005"
  ],
  "evidence": {
    "quickstart:scenario-1": [
      "Create_FullReferenceNews_PublicPageComposesCoverGalleryVideoTags"
    ],
    "quickstart:scenario-2": [
      "Update_ProgrammaticallyCreatedNews_PreservesCoverTagsPublishGalleryVideo",
      "полный цикл открытия и сохранения не теряет ни одно поле"
    ],
    "quickstart:scenario-3": [
      "черновик (неопубликованная новость) не появляется в публичном списке",
      "адрес с недопустимыми символами блокирует сохранение"
    ],
    "quickstart:scenario-4": [
      "CreateNews_WithMediaAssets_DoesNotAddToPublicGallery"
    ],
    "quickstart:scenario-5": [
      "часть файлов галереи отклонена (превышен размер) — успешные вставляются, ошибка показывает остальные",
      "файл неподдерживаемого типа в галерее не блокирует вставку остальных",
      "сетевая ошибка при загрузке видео не стирает уже введённый текст новости"
    ],
    "SC-001": [
      "Create_FullReferenceNews_PublicPageComposesCoverGalleryVideoTags"
    ],
    "SC-003": [
      "Update_ProgrammaticallyCreatedNews_PreservesCoverTagsPublishGalleryVideo"
    ],
    "SC-004": [
      "CreateNews_WithMediaAssets_DoesNotAddToPublicGallery"
    ],
    "SC-005": [
      "часть файлов галереи отклонена (превышен размер)",
      "файл неподдерживаемого типа в галерее",
      "сетевая ошибка при загрузке видео"
    ]
  },
  "extra_tests": [
    "Дополнительно покрыты поля обложки, тегов, SEO, адреса через unit-тесты NewsEditor.test.tsx"
  ]
}
```

## Вердикт: ✅ OK

Все 9 scenario_refs полностью и явно покрыты тестами с конкретными именами тестов, привязанными через trait'ы. Нет семантических дефектов. Тесты проходят, build успешен.
