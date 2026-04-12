# FC Arsenal-92 — Полная спецификация проекта

## Цель

Создать улучшенную копию сайта детского футбольного клуба «Арсенал» (Севастополь) на современном стеке, с полной SEO-оптимизацией для Google и Yandex, админ-панелью для управления контентом и деплоем в Docker на выделенный сервер.

Текущий сайт: https://fcarsenal-92.tilda.ws/

### Проблемы текущего сайта (полный аудит Playwright)

**SEO — критические:**
- `robots: nofollow` — запрещает поисковикам следовать ссылкам
- `lang=""` — не указан язык страницы
- **0 заголовков H1-H6** — весь текст через div/span (Tilda не использует семантику)
- **0 Schema.org** разметки
- **0 Twitter Cards**
- Canonical → HTTP (не HTTPS): `http://fcarsenal-92.tilda.ws/`
- Meta description: "Детский футбольный клуб Арсенал" — слишком короткое
- **0 alt-текстов** у изображений
- Нет sitemap.xml, robots.txt, hreflang

**Формы — без защиты:**
- Нет reCAPTCHA, required=false на всех полях, нет CSRF

**Аналитика (уже подключена — перенести ID в админку):**
- Google Analytics (gtag.js)
- Yandex.Metrika

**Соцсети (полный список):**
- VK: vk.com/arsenal_92
- Telegram (клуб): t.me/arsenal_sevastopol
- Telegram (магазин): t.me/s/arsenalarena
- YouTube: youtube.com/@arsenal92
- Дзен: dzen.ru/arsenal92

**Партнёры:**
- МЕДОБОРЫ (medobory.com)
- А2 — экипировка (t.me/s/arsenalarena)

---

## Стек технологий

| Компонент | Технология |
|-----------|-----------|
| Frontend | Next.js 15 (React, TypeScript, App Router, SSR/SSG) |
| Backend API | .NET 9 Web API (C#, Clean Architecture) |
| Database | PostgreSQL 16 |
| ORM | Entity Framework Core |
| Admin UI | React admin dashboard (внутри Next.js, route group /admin) |
| Auth | JWT + refresh tokens (только для админки) |
| i18n | next-intl (ru + en) |
| Payments | ЮKassa API (опционально включается в админке) |
| Container | Docker Compose (nginx + nextjs + dotnet-api + postgres) |
| Reverse proxy | Nginx с SSL (Let's Encrypt / certbot) |
| Server | Timeweb VPS, Казахстан (45.10.40.194) |
| CI/CD | GitHub Actions → SSH deploy |

---

## Архитектура

```
[Browser] → [Nginx :443 (HTTPS + HTTP/2 + Brotli)]
              ├── /              → [Next.js :3000] (SSR страницы)
              ├── /admin/        → [Next.js :3000] (Admin SPA, client-side)
              ├── /api/v1/       → [.NET API :5000] (REST API)
              └── /uploads/      → static files (Nginx direct serve)
                                    [.NET API] ↔ [PostgreSQL :5432]
```

### Docker Compose — 4 контейнера

1. **nginx** — reverse proxy, SSL termination, static files, gzip/brotli
2. **nextjs** — SSR frontend + admin UI
3. **dotnet-api** — .NET 9 Web API
4. **postgres** — PostgreSQL 16 с volume для persistence

---

## Структура БД (PostgreSQL)

### Основные сущности

```
Pages              — статические страницы (о клубе, миссия и т.д.)
├── id, slug, title_ru, title_en, content_ru, content_en
├── meta_title_ru, meta_description_ru, meta_title_en, meta_description_en
├── og_image, is_published, sort_order
└── created_at, updated_at

News               — новости и блог
├── id, slug, title_ru, title_en, excerpt_ru, excerpt_en
├── content_ru, content_en, cover_image
├── meta_title, meta_description, tags[]
├── is_published, published_at
└── created_at, updated_at

Coaches            — тренерский состав
├── id, name_ru, name_en, position_ru, position_en
├── bio_ru, bio_en, photo, certifications[]
├── sort_order, is_active
└── created_at, updated_at

TrainingGroups     — тренировочные группы
├── id, name, age_range, level, max_capacity
├── description_ru, description_en
└── is_active, created_at

Schedule           — расписание занятий
├── id, group_id (FK), day_of_week, start_time, end_time
├── location, coach_id (FK)
└── is_active

PricingPlans       — тарифы
├── id, name_ru, name_en, price, currency
├── sessions_count, description_ru, description_en
├── features_ru[], features_en[], is_featured
├── sort_order, is_active
└── created_at, updated_at

Bookings           — заявки на пробную тренировку
├── id, parent_name, phone, email
├── child_name, child_birth_year
├── preferred_date, preferred_time_slot
├── group_id (FK), status (new/confirmed/cancelled)
├── admin_notes
└── created_at, updated_at

Reviews            — отзывы
├── id, author_name, author_role (parent/player)
├── text_ru, text_en, rating (1-5)
├── is_published, sort_order
└── created_at

Gallery            — фотоальбомы
├── id, title_ru, title_en, description_ru, description_en
├── cover_image, is_published
└── created_at

GalleryItems       — фото/видео в альбоме
├── id, gallery_id (FK), type (photo/video)
├── url, thumbnail_url, caption_ru, caption_en
├── sort_order
└── created_at

ShopCategories     — категории товаров магазина
├── id, name_ru, name_en, slug
├── sort_order, is_active
└── created_at

ShopProducts       — товары магазина
├── id, category_id (FK), name_ru, name_en, slug
├── description_ru, description_en
├── price, old_price (для скидок), currency
├── images[] (JSON массив URL-ов)
├── sizes[] (JSON: доступные размеры)
├── in_stock, stock_quantity
├── order_type (telegram/whatsapp/form/online)
├── external_order_url (ссылка на Telegram/WhatsApp для заказа)
├── meta_title_ru, meta_description_ru
├── is_published, is_featured, sort_order
└── created_at, updated_at

Partners           — партнёры
├── id, name, logo_url, website_url
├── sort_order, is_active
└── created_at

Contacts           — контактная информация (singleton-like)
├── id, phones[], emails[], address_ru, address_en
├── map_coordinates, transport_info_ru, transport_info_en
├── vk_url, telegram_url, youtube_url, instagram_url
└── updated_at

SiteSettings       — глобальные настройки сайта
├── id, site_name_ru, site_name_en
├── logo_url, favicon_url
├── primary_color, secondary_color
├── yandex_metrika_id, google_analytics_id
├── yandex_verification, google_verification
├── features_enabled (JSON: booking, payments, gallery, blog, etc.)
└── updated_at

Payments           — история оплат (если включена ЮKassa)
├── id, booking_id (FK), amount, currency
├── status (pending/success/failed/refunded)
├── provider_payment_id, provider_data (JSON)
└── created_at, updated_at

AdminUsers         — пользователи админки
├── id, email, password_hash, name
├── role (superadmin/editor)
├── last_login_at
└── created_at
```

---

## Страницы сайта (Frontend)

### Публичные страницы

| URL | Страница | SSR/SSG | Описание |
|-----|----------|---------|----------|
| / | Главная | SSG + ISR | Hero (фоновое видео RuTube embed: 1335a9553dac12ea586c0ce0a90456cf, autoplay, muted, loop) + преимущества + CTA |
| /about | О клубе | SSG + ISR | История, миссия, философия |
| /coaches | Тренеры | SSG + ISR | Карточки тренеров |
| /schedule | Расписание | SSR | Таблица расписания по группам |
| /pricing | Тарифы | SSG + ISR | 3 плана + кнопка записи |
| /news | Новости | SSR | Список новостей с пагинацией |
| /news/[slug] | Статья | SSR | Отдельная новость |
| /gallery | Галерея | SSR | Альбомы фото/видео |
| /gallery/[id] | Альбом | SSR | Фото/видео внутри альбома |
| /booking | Запись | SSR | Форма записи с календарём слотов |
| /shop | Магазин | SSR | Каталог товаров с категориями |
| /shop/[slug] | Товар | SSR | Карточка товара + кнопка заказа |
| /contacts | Контакты | SSG + ISR | Карта, телефоны, соцсети |
| /sitemap.xml | Sitemap | Dynamic | Для поисковиков |
| /robots.txt | Robots | Static | Правила индексации |

### Админка (SPA, client-side rendering, route group)

| URL | Раздел |
|-----|--------|
| /admin/login | Авторизация |
| /admin/dashboard | Обзор (заявки, статистика) |
| /admin/pages | Редактирование страниц |
| /admin/news | Управление новостями |
| /admin/coaches | Тренеры |
| /admin/schedule | Расписание |
| /admin/pricing | Тарифы |
| /admin/bookings | Заявки на тренировку |
| /admin/reviews | Отзывы |
| /admin/gallery | Галерея |
| /admin/partners | Партнёры |
| /admin/contacts | Контакты и соцсети |
| /admin/settings | Настройки (SEO, аналитика, фичи on/off) |
| /admin/shop | Товары и категории магазина |
| /admin/payments | Платежи (если включено) |

---

## SEO-оптимизация (Google + Yandex)

### Техническое SEO

1. **SSR/SSG** — все публичные страницы рендерятся на сервере
2. **Meta-теги** — уникальные title, description для каждой страницы (редактируемые в админке)
3. **Open Graph + Twitter Cards** — для шаринга в соцсетях
4. **Schema.org** (JSON-LD):
   - `SportsClub` — главная страница
   - `SportsTeam` — информация о клубе
   - `Course` — тарифы/программы
   - `Review` — отзывы с рейтингом
   - `Event` — турниры, мероприятия
   - `Person` — тренеры
   - `LocalBusiness` — адрес, телефон, часы работы
   - `BreadcrumbList` — хлебные крошки
   - `FAQPage` — если будет FAQ
5. **Sitemap.xml** — динамический, автообновление при публикации
6. **Robots.txt** — правильная индексация, закрытие /admin/
7. **Canonical URLs** — предотвращение дублей
8. **hreflang** — для ru/en версий
9. **Core Web Vitals**:
   - LCP < 2.5s (оптимизация изображений, WebP/AVIF, lazy loading)
   - FID < 100ms (минимум JS на первую загрузку)
   - CLS < 0.1 (фиксированные размеры медиа)
10. **HTTP/2 + Brotli** compression через Nginx

### Yandex-специфичное

1. **Yandex.Webmaster** — верификация через meta-тег (настраивается в админке)
2. **Yandex.Metrika** — код счётчика из админки
3. **Turbo-страницы** — RSS-фид для Turbo (опционально)
4. **Yandex.Maps** — виджет карты на странице контактов
5. **Региональность** — указание региона Севастополь в Yandex.Webmaster
6. **ИКС** — работа над качественным контентом (блог)

### Google-специфичное

1. **Google Search Console** — верификация через meta-тег
2. **Google Analytics 4** — код из админки
3. **Google Maps** — embed на контактах
4. **Structured Data Testing** — валидация schema.org

### Контентное SEO

- Семантическое ядро: «футбольная школа Севастополь», «детский футбол», «тренировки для детей»
- Каждая страница: уникальный H1, структура H2-H3
- Альт-тексты для всех изображений (редактируемые в админке)
- Блог/новости — генерация свежего контента для индексации
- Внутренняя перелинковка между страницами

---

## Дизайн

### Цветовая палитра (из текущего сайта)

| Назначение | Цвет | HEX |
|-----------|------|-----|
| Primary (акцент) | Красный | #E10005 |
| Secondary | Тёмно-синий | #101A7A |
| Background dark | Чёрный | #111111 |
| Text primary | Белый | #FFFFFF |
| Text secondary | Серый | #635959 |
| Success | Зелёный | #22C55E |

### Принципы

- Mobile-first responsive design
- Современный минималистичный стиль с акцентом на фотографии
- Плавные анимации при скролле (Intersection Observer)
- Адаптивная типографика (clamp())
- Dark header/hero + light content sections
- Карточный дизайн для тренеров, тарифов, новостей

---

## Контент клуба (от владельца)

### Почему выбирают нас

1. 🏆 **Профессиональные тренеры** — лицензия категории С УЕФА
2. ⚽ **Современная методика** — методики ведущих мировых академий, упор на качество
3. 👫 **Группы для начинающих** — учим с нуля, группы по уровню подготовки
4. 🤝 **Просмотры, стажировки** — связь с академиями ФК «Краснодар», «Ростов», «Сочи», «Локомотив», «Строгино», «Родина», ЦСКА, «Акрон-Академия Коноплёва», «Кубань», Рамзан. Стажировки в Испании (Севилья) и Турции.
5. 🎯 **Участие в турнирах** — Первенства Севастополя, Симферополя, Крыма, всероссийские турниры (СПб, Сочи, Казань, Краснодар)
6. 👫 **Современный инвентарь** — катапульта для мячей, спинбайки, манекены
7. 🏆 **Гибкое расписание** — ежедневно групповые, индивидуальные в любое время
8. 🎯 **Цель** — строительство частной академии профессиональных футболистов
9. 🤝 **Играют все дети** — не сильнейшие в угоду результату
10. 👫 **Воспитание личности** — характер, ценности, любовь к спорту

### Контакты

- +7 978-813-09-82
- +7-978-812-64-32
- +7-978-10-40-940
- Локация: СОШ 61, ул. Косарева 12, Севастополь
- VK: vk.com/arsenal_92
- Telegram: t.me/arsenal_sevastopol
- YouTube: @arsenal92

### Тарифы

| План | Цена | Включено |
|------|------|----------|
| СТАНДАРТ | 4 000 ₽/мес | 12 занятий |
| СТАНДАРТ+ | 5 400 ₽/мес | 12 + 4 занятия |
| PRO | 6 000 ₽/мес | 20 занятий + стажировки |

### Магазин (текущий сайт → Telegram @arsenalarena)

Текущие товары:
- **Бутсы** — детская футбольная обувь, подарочные варианты
- **Клубная экипировка** — форма с логотипом, спортивная одежда
- **Зимние куртки** — спортивные куртки для тренировок при минусовых температурах
- **Защита** — щитки, перчатки вратарские

Сейчас заказ идёт через Telegram (@arsenalarena). В новом сайте:
- Каталог товаров с категориями, фото, ценами, размерами
- Кнопка "Заказать" → выбор способа: Telegram / WhatsApp / форма на сайте / онлайн-оплата
- Админ добавляет/редактирует товары, управляет категориями, наличием
- Интеграция с Telegram-ботом для уведомлений о заказах (опционально)

### Hero-секция

- Фоновое видео: RuTube embed `1335a9553dac12ea586c0ce0a90456cf` (autoplay, muted, loop, без контролов)
- В новом сайте: поддержка загрузки собственного видео ИЛИ embed URL из админки
- Fallback: статичное изображение для мобильных / медленного интернета

### Персоналии

- **Кулиев Игорь Рамизович** — генеральный директор и старший тренер

---

## Деплой

### Сервер

- Timeweb VPS, Казахстан
- IP: 45.10.40.194
- OS: предполагается Ubuntu/Debian

### Настройка сервера

1. Установить Docker + Docker Compose
2. Установить Nginx (или использовать в Docker)
3. Настроить SSL через Certbot (Let's Encrypt)
4. Настроить firewall (UFW: 22, 80, 443)
5. Создать non-root user для деплоя

### Домен

- Домен: **fcarsenal92.ru** (куплен на Timeweb)
- Привязан к серверу: 45.10.40.194
- DNS A-запись: fcarsenal92.ru → 45.10.40.194
- DNS A-запись: www.fcarsenal92.ru → 45.10.40.194 (или CNAME → fcarsenal92.ru)
- www → 301 redirect на fcarsenal92.ru (без www — основной)

### Nginx конфиг (HTTPS)

- HTTP/2 enabled
- SSL с Let's Encrypt (auto-renew)
- Brotli + Gzip compression
- Security headers (HSTS, X-Frame-Options, CSP)
- Rate limiting
- Static file caching (images: 30d, CSS/JS: 7d)
- Proxy pass к Next.js и .NET API

### CI/CD

- GitHub Actions: build → test → Docker build → SSH deploy
- Docker images pushed to GitHub Container Registry
- docker-compose pull + up on server via SSH

---

## Принципы разработки

- **Clean Architecture** — .NET API с разделением на Domain, Application, Infrastructure, API layers
- **TDD** — тесты перед кодом, xUnit + FluentAssertions для .NET, Jest + React Testing Library для фронта
- **CQRS** — разделение команд и запросов в API
- **Repository Pattern** — абстракция доступа к данным
- **Typed DTOs** — строгая типизация на API границах
- **Validation** — FluentValidation на входных данных
- **Error handling** — глобальный middleware, Problem Details (RFC 7807)
- **Logging** — Serilog с structured logging
- **i18n** — все строки через next-intl, контент из БД в двух языках

---

## Опциональные фичи (включаются в админке через SiteSettings.features_enabled)

| Фича | Ключ | Описание |
|------|------|----------|
| Онлайн-запись с календарём | `booking` | Форма записи с выбором даты/времени |
| Новости / блог | `blog` | Публикация новостей и фотоотчётов |
| Галерея фото/видео | `gallery` | Альбомы с фото и YouTube видео |
| Онлайн-оплата (ЮKassa) | `payments` | Оплата абонементов через сайт |
| Отзывы | `reviews` | Блок отзывов на главной |
| Мультиязычность | `i18n` | Переключатель ru/en |
| Магазин | `shop` | Каталог товаров, категории, заказ через Telegram/форму |

Каждая фича: если отключена в настройках — соответствующие страницы возвращают 404, пункты меню скрываются, API endpoints отключены.

---

## Что нужно от владельца сайта (Кулиев И.Р.)

### Обязательно (без этого сайт не запустится)

**1. Контент на русском и английском**
- [ ] Тексты всех страниц на английском языке (или подтверждение что английскую версию пишем мы / через переводчик)
- [ ] Фотографии тренеров (имя, должность, сертификаты, биография) — в хорошем качестве
- [ ] Актуальное расписание занятий на текущий сезон
- [ ] Актуальные тарифы и что в них входит
- [ ] Подтверждение контактных телефонов (на сайте 3 номера, в разделе записи 1 — какие актуальные?)

**2. Аналитика — ID счётчиков**
- [ ] Google Analytics — Measurement ID (формат `G-XXXXXXXXXX`). Если нет — создать на analytics.google.com
- [ ] Yandex.Metrika — номер счётчика. Если нет — создать на metrika.yandex.ru
- [ ] Google Search Console — верификация домена fcarsenal92.ru (мы дадим meta-тег для вставки)
- [ ] Yandex.Webmaster — верификация домена fcarsenal92.ru (аналогично)

**3. Домен и DNS**
- [x] Домен fcarsenal92.ru куплен на Timeweb
- [ ] Настроить DNS A-запись: fcarsenal92.ru → 45.10.40.194 (в панели Timeweb)
- [ ] Настроить DNS A-запись: www.fcarsenal92.ru → 45.10.40.194

### Для онлайн-оплаты (если нужна)

**4. ЮKassa (бывшая Яндекс.Касса)**
- [ ] Зарегистрировать юрлицо/ИП в ЮKassa: https://yookassa.ru
- [ ] Пройти модерацию и получить `shopId` и `secretKey`
- [ ] Указать URL для уведомлений (мы дадим: `https://fcarsenal92.ru/api/v1/payments/webhook`)
- [ ] Настроить тестовый режим для проверки до запуска

### Для Telegram-интеграции магазина

**5. Telegram-бот для уведомлений о заказах**
- [ ] Создать бота через @BotFather в Telegram
- [ ] Передать нам Bot Token
- [ ] Указать chat ID группы/канала куда отправлять уведомления о заказах
- [ ] Или подтвердить, что заказы продолжают идти через @arsenalarena как сейчас

### Для Google Maps / Yandex.Maps

**6. Карта на странице контактов**
- [ ] Google Maps API Key (бесплатно до 28,500 загрузок/мес): https://console.cloud.google.com
- [ ] Или подтверждение что используем Yandex.Maps (бесплатно, без ключа для простого embed)
- [ ] Точные координаты спорткомплекса СОШ 61 (ул. Косарева, 12)

### Медиа-контент (желательно до запуска)

**7. Фотографии и видео**
- [ ] Фото тренеров в высоком разрешении (минимум 800x800px)
- [ ] Фото для галереи — тренировки, турниры, команды (минимум 10-15 фото)
- [ ] Видео для hero-секции — подтвердить текущее RuTube видео или заменить
- [ ] Логотип в SVG формате (если есть) — для лучшего качества на всех экранах
- [ ] Фото товаров магазина (если хочет полноценный каталог, а не только Telegram)

**8. Юридическая информация**
- [ ] Политика конфиденциальности (обязательна по 152-ФЗ если собираем персональные данные)
- [ ] Согласие на обработку ПД — текст для чекбокса в формах
- [ ] Реквизиты организации (ИНН, ОГРН — если есть)

### SEO-контент (после запуска, для продвижения)

**9. Регулярный контент**
- [ ] Публиковать новости минимум 2-4 раза в месяц (турниры, результаты, события)
- [ ] Фотоотчёты с мероприятий
- [ ] Собирать и публиковать отзывы родителей (с их согласия)

**10. Внешние площадки**
- [ ] Создать/обновить карточку в Google Бизнес (https://business.google.com) — критично для локального SEO
- [ ] Создать/обновить карточку в Яндекс.Бизнес (https://business.yandex.ru)
- [ ] Указать адрес, телефон, часы работы, фото — одинаковые на сайте и в карточках (NAP consistency)
- [ ] Дзен (dzen.ru/arsenal92) — продолжать публикации, ставить ссылки на сайт

### Таймлайн общения с владельцем

| Этап | Когда | Что обсуждаем |
|------|-------|--------------|
| **Старт** | Сейчас | DNS настройка, передача фото тренеров, подтверждение контента |
| **Разработка** | Неделя 1-2 | Показываем демо, собираем обратную связь по дизайну |
| **Интеграции** | Неделя 2-3 | ID аналитики, ЮKassa (если нужна), Telegram-бот |
| **Контент** | Неделя 3-4 | Загрузка фото/видео, тексты на английском, юр. документы |
| **Тест** | Неделя 4 | Владелец тестирует админку, вносит правки |
| **Запуск** | Неделя 5 | Переключение DNS, заявка в Search Console/Webmaster |
| **После запуска** | Постоянно | Регулярные новости, сбор отзывов, Google/Yandex Бизнес |

---

## Структура проекта

```
football_site/
├── docker-compose.yml
├── docker-compose.prod.yml
├── .github/workflows/deploy.yml
├── src/
│   ├── frontend/                    # Next.js 15
│   │   ├── app/
│   │   │   ├── [locale]/           # i18n routing
│   │   │   │   ├── page.tsx        # Главная
│   │   │   │   ├── about/
│   │   │   │   ├── coaches/
│   │   │   │   ├── schedule/
│   │   │   │   ├── pricing/
│   │   │   │   ├── news/
│   │   │   │   ├── gallery/
│   │   │   │   ├── booking/
│   │   │   │   ├── shop/
│   │   │   │   │   └── [slug]/
│   │   │   │   └── contacts/
│   │   │   └── admin/              # Admin SPA (no SSR)
│   │   ├── components/
│   │   ├── lib/
│   │   ├── messages/               # i18n translations
│   │   │   ├── ru.json
│   │   │   └── en.json
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── backend/                    # .NET 9
│       ├── Arsenal.Domain/         # Entities, value objects
│       ├── Arsenal.Application/    # Use cases, interfaces, DTOs
│       ├── Arsenal.Infrastructure/ # EF Core, repositories, external services
│       ├── Arsenal.API/            # Controllers, middleware, DI
│       ├── Arsenal.API/Dockerfile
│       └── Arsenal.sln
│
├── tests/
│   ├── Arsenal.UnitTests/
│   ├── Arsenal.IntegrationTests/
│   └── frontend/__tests__/
│
├── config/
│   ├── nginx/
│   │   ├── nginx.conf
│   │   └── ssl/
│   └── postgres/
│       └── init.sql
│
├── scripts/
│   ├── deploy.sh
│   ├── backup-db.sh
│   └── setup-server.sh
│
└── docs/
    ├── PROJECT_SPEC.md             # Этот файл
    └── adr/                        # Architecture Decision Records
```
