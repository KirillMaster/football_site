# Schema.org JSON-LD Templates — FC Arsenal-92

Version: 1.0
Date: 2026-04-12

All templates follow Google's Structured Data guidelines.
Dynamic fields use `{{placeholder}}` syntax.
Comments indicate data source: `DB` (from database), `STATIC` (hardcoded), `COMPUTED` (derived at render time).

---

## 1. Home Page — SportsClub + LocalBusiness + WebSite + SearchAction

```json
[
  {
    "@context": "https://schema.org",
    "@type": ["SportsClub", "LocalBusiness"],
    "@id": "https://fcarsenal92.ru/#organization",
    "name": "ДФК Арсенал",
    "alternateName": "FC Arsenal-92",
    "description": "Квалифицированная школа футбола в Севастополе для детей от 6 до 14 лет. Профессиональные тренеры с лицензией УЕФА категории С.",
    "url": "https://fcarsenal92.ru",
    "logo": {
      "@type": "ImageObject",
      "url": "https://fcarsenal92.ru/images/logo.png",
      "width": 1072,
      "height": 1037
    },
    "image": "https://fcarsenal92.ru/images/og-home.jpg",
    "telephone": ["+7-978-813-09-82", "+7-978-812-64-32", "+7-978-10-40-940"],
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "ул. Косарева, д.12, Спорткомплекс школы №61",
      "addressLocality": "Севастополь",
      "addressRegion": "Севастополь",
      "postalCode": "299000",
      "addressCountry": "RU"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "{{contacts.map_coordinates.latitude}}",
      "longitude": "{{contacts.map_coordinates.longitude}}"
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "18:00",
        "closes": "19:30"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Saturday",
        "opens": "12:00",
        "closes": "13:30"
      }
    ],
    "sport": "Football",
    "priceRange": "4000₽ - 6000₽/мес",
    "currenciesAccepted": "RUB",
    "paymentAccepted": "Cash, Bank Transfer",
    "sameAs": [
      "https://vk.com/arsenal_92",
      "https://t.me/arsenal_sevastopol",
      "https://www.youtube.com/@arsenal92",
      "https://dzen.ru/arsenal92"
    ],
    "founder": {
      "@type": "Person",
      "name": "Кулиев Игорь Рамизович",
      "jobTitle": "Генеральный директор и старший тренер"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "{{computed.averageRating}}",
      "reviewCount": "{{computed.reviewCount}}",
      "bestRating": "5",
      "worstRating": "1"
    }
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://fcarsenal92.ru/#website",
    "name": "ДФК Арсенал — Детская футбольная школа Севастополь",
    "url": "https://fcarsenal92.ru",
    "inLanguage": ["ru", "en"],
    "publisher": {
      "@id": "https://fcarsenal92.ru/#organization"
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://fcarsenal92.ru/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  }
]
```

**Data sources:**
- `name`, `description`, `telephone`, `address` — DB: `Contacts` + `SiteSettings`
- `logo` — DB: `SiteSettings.logo_url`
- `openingHoursSpecification` — DB: `Schedule` (aggregated from active schedule entries)
- `geo` — DB: `Contacts.map_coordinates`
- `sameAs` — DB: `Contacts` (vk_url, telegram_url, youtube_url, etc.)
- `aggregateRating` — COMPUTED: calculated from `Reviews` table at build time
- `priceRange` — COMPUTED: min/max from `PricingPlans`

---

## 2. About Page — Organization + SportsTeam

```json
[
  {
    "@context": "https://schema.org",
    "@type": "SportsTeam",
    "@id": "https://fcarsenal92.ru/about#sportsteam",
    "name": "ДФК Арсенал",
    "alternateName": "FC Arsenal-92",
    "sport": "Football",
    "url": "https://fcarsenal92.ru/about",
    "description": "{{pages.about.content_ru}}",
    "foundingDate": "{{pages.about.founding_date}}",
    "location": {
      "@type": "Place",
      "name": "Спорткомплекс школы №61",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "ул. Косарева, д.12",
        "addressLocality": "Севастополь",
        "addressRegion": "Севастополь",
        "addressCountry": "RU"
      }
    },
    "memberOf": {
      "@type": "SportsOrganization",
      "name": "Детский футбол Севастополя"
    },
    "coach": {
      "@type": "Person",
      "@id": "https://fcarsenal92.ru/coaches#kuliev",
      "name": "Кулиев Игорь Рамизович",
      "jobTitle": "Генеральный директор и старший тренер"
    },
    "slogan": "Мы в первую очередь хотим видеть СЧАСТЛИВЫХ ДЕТЕЙ!",
    "parentOrganization": {
      "@id": "https://fcarsenal92.ru/#organization"
    },
    "image": "{{pages.about.og_image}}",
    "sameAs": [
      "https://vk.com/arsenal_92",
      "https://t.me/arsenal_sevastopol",
      "https://www.youtube.com/@arsenal92",
      "https://dzen.ru/arsenal92"
    ]
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://fcarsenal92.ru/#organization",
    "name": "ДФК Арсенал",
    "url": "https://fcarsenal92.ru",
    "logo": "https://fcarsenal92.ru/images/logo.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+7-978-813-09-82",
      "contactType": "customer service",
      "availableLanguage": ["Russian", "English"]
    },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "ул. Косарева, д.12",
      "addressLocality": "Севастополь",
      "addressRegion": "Севастополь",
      "addressCountry": "RU"
    }
  }
]
```

**Data sources:**
- `description` — DB: `Pages` (slug=about, content_ru), truncated to ~160 chars for schema
- `foundingDate` — DB: `Pages` (custom field or hardcoded)
- `coach` — DB: `Coaches` (first active coach)
- `image` — DB: `Pages.og_image`
- `sameAs` — DB: `Contacts`
- `logo`, `address`, `contactPoint` — DB: `SiteSettings` + `Contacts`

---

## 3. Coaches Page — Person (per coach) with sportsTeam relation

```json
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "Тренерский состав ДФК Арсенал",
  "url": "https://fcarsenal92.ru/coaches",
  "numberOfItems": "{{computed.coachCount}}",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "item": {
        "@type": "Person",
        "@id": "https://fcarsenal92.ru/coaches#{{coach.id}}",
        "name": "{{coach.name_ru}}",
        "jobTitle": "{{coach.position_ru}}",
        "description": "{{coach.bio_ru}}",
        "image": "{{coach.photo}}",
        "memberOf": {
          "@type": "SportsTeam",
          "@id": "https://fcarsenal92.ru/about#sportsteam",
          "name": "ДФК Арсенал"
        },
        "hasCredential": [
          {
            "@type": "EducationalOccupationalCredential",
            "credentialCategory": "{{coach.certifications[i]}}"
          }
        ],
        "worksFor": {
          "@id": "https://fcarsenal92.ru/#organization"
        }
      }
    }
  ]
}
```

**Repeat `itemListElement` for each coach.**

**Data sources:**
- All fields — DB: `Coaches` table (iterate over `is_active=true`, ordered by `sort_order`)
- `hasCredential` — DB: `Coaches.certifications[]` array
- `numberOfItems` — COMPUTED: count of active coaches

---

## 4. Pricing Page — Course (per plan) with Offer

```json
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "Тарифы ДФК Арсенал",
  "url": "https://fcarsenal92.ru/pricing",
  "numberOfItems": "{{computed.planCount}}",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": "{{plan.sort_order}}",
      "item": {
        "@type": "Course",
        "@id": "https://fcarsenal92.ru/pricing#{{plan.id}}",
        "name": "{{plan.name_ru}}",
        "description": "{{plan.description_ru}}",
        "provider": {
          "@type": "SportsClub",
          "@id": "https://fcarsenal92.ru/#organization",
          "name": "ДФК Арсенал"
        },
        "hasCourseInstance": {
          "@type": "CourseInstance",
          "courseMode": "onsite",
          "courseWorkload": "PT{{plan.sessions_count}}H",
          "instructor": {
            "@type": "Person",
            "name": "Кулиев Игорь Рамизович"
          },
          "location": {
            "@type": "Place",
            "name": "Спорткомплекс школы №61",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "ул. Косарева, д.12",
              "addressLocality": "Севастополь",
              "addressCountry": "RU"
            }
          }
        },
        "offers": {
          "@type": "Offer",
          "price": "{{plan.price}}",
          "priceCurrency": "RUB",
          "availability": "https://schema.org/InStock",
          "validFrom": "{{computed.seasonStart}}",
          "url": "https://fcarsenal92.ru/booking"
        },
        "coursePrerequisites": "Дети от 6 до 14 лет",
        "educationalLevel": "Beginner to Advanced"
      }
    }
  ]
}
```

**Data sources:**
- `name`, `description`, `price`, `sessions_count` — DB: `PricingPlans`
- `sort_order` — DB: `PricingPlans.sort_order`
- `instructor` — DB: `Coaches` (senior/head coach)
- `validFrom` — COMPUTED: current season start date
- `location` — DB: `Contacts.address_ru`

---

## 5. Schedule Page — Event (recurring training sessions)

```json
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "Расписание тренировок ДФК Арсенал",
  "url": "https://fcarsenal92.ru/schedule",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": "{{index}}",
      "item": {
        "@type": "Event",
        "@id": "https://fcarsenal92.ru/schedule#{{schedule.id}}",
        "name": "Тренировка — {{schedule.group.name}}",
        "description": "Групповая тренировка по футболу для {{schedule.group.age_range}}",
        "eventSchedule": {
          "@type": "Schedule",
          "byDay": "{{schedule.day_of_week}}",
          "startTime": "{{schedule.start_time}}",
          "endTime": "{{schedule.end_time}}",
          "scheduleTimezone": "Europe/Moscow",
          "repeatFrequency": "P1W"
        },
        "location": {
          "@type": "Place",
          "name": "{{schedule.location}}",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "ул. Косарева, д.12",
            "addressLocality": "Севастополь",
            "addressCountry": "RU"
          }
        },
        "organizer": {
          "@type": "SportsClub",
          "@id": "https://fcarsenal92.ru/#organization",
          "name": "ДФК Арсенал"
        },
        "performer": {
          "@type": "Person",
          "@id": "https://fcarsenal92.ru/coaches#{{schedule.coach_id}}",
          "name": "{{schedule.coach.name_ru}}"
        },
        "eventStatus": "https://schema.org/EventScheduled",
        "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
        "isAccessibleForFree": false,
        "offers": {
          "@type": "Offer",
          "url": "https://fcarsenal92.ru/booking",
          "price": "4000",
          "priceCurrency": "RUB",
          "availability": "https://schema.org/InStock"
        }
      }
    }
  ]
}
```

**Data sources:**
- `day_of_week`, `start_time`, `end_time`, `location` — DB: `Schedule`
- `group.name`, `group.age_range` — DB: `TrainingGroups` (via FK `group_id`)
- `coach.name_ru` — DB: `Coaches` (via FK `coach_id`)
- `offers.price` — DB: `PricingPlans` (minimum plan price)
- `scheduleTimezone` — STATIC: Europe/Moscow (Sevastopol timezone)

---

## 6. News Article — NewsArticle + BreadcrumbList

```json
[
  {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "@id": "https://fcarsenal92.ru/news/{{news.slug}}#article",
    "headline": "{{news.title_ru}}",
    "description": "{{news.excerpt_ru}}",
    "image": {
      "@type": "ImageObject",
      "url": "{{news.cover_image}}",
      "width": 1200,
      "height": 630
    },
    "datePublished": "{{news.published_at}}",
    "dateModified": "{{news.updated_at}}",
    "author": {
      "@type": "Organization",
      "@id": "https://fcarsenal92.ru/#organization",
      "name": "ДФК Арсенал"
    },
    "publisher": {
      "@type": "Organization",
      "@id": "https://fcarsenal92.ru/#organization",
      "name": "ДФК Арсенал",
      "logo": {
        "@type": "ImageObject",
        "url": "https://fcarsenal92.ru/images/logo.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "https://fcarsenal92.ru/news/{{news.slug}}"
    },
    "articleSection": "Новости клуба",
    "keywords": "{{news.tags | join(', ')}}",
    "inLanguage": "ru",
    "isPartOf": {
      "@id": "https://fcarsenal92.ru/#website"
    }
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Главная",
        "item": "https://fcarsenal92.ru"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Новости",
        "item": "https://fcarsenal92.ru/news"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "{{news.title_ru}}",
        "item": "https://fcarsenal92.ru/news/{{news.slug}}"
      }
    ]
  }
]
```

**Data sources:**
- `headline`, `description`, `image`, `datePublished`, `dateModified`, `keywords` — DB: `News`
- `publisher.logo` — DB: `SiteSettings.logo_url`
- BreadcrumbList `name` at position 3 — DB: `News.title_ru`

---

## 7. Gallery — ImageGallery

```json
{
  "@context": "https://schema.org",
  "@type": "ImageGallery",
  "@id": "https://fcarsenal92.ru/gallery/{{gallery.id}}#gallery",
  "name": "{{gallery.title_ru}}",
  "description": "{{gallery.description_ru}}",
  "url": "https://fcarsenal92.ru/gallery/{{gallery.id}}",
  "image": "{{gallery.cover_image}}",
  "dateCreated": "{{gallery.created_at}}",
  "creator": {
    "@type": "Organization",
    "@id": "https://fcarsenal92.ru/#organization",
    "name": "ДФК Арсенал"
  },
  "mainEntity": {
    "@type": "ItemList",
    "numberOfItems": "{{computed.itemCount}}",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": "{{item.sort_order}}",
        "item": {
          "@type": "ImageObject",
          "contentUrl": "{{item.url}}",
          "thumbnailUrl": "{{item.thumbnail_url}}",
          "caption": "{{item.caption_ru}}",
          "name": "{{item.caption_ru}}",
          "uploadDate": "{{item.created_at}}",
          "width": "{{item.width}}",
          "height": "{{item.height}}"
        }
      }
    ]
  },
  "isPartOf": {
    "@id": "https://fcarsenal92.ru/#website"
  }
}
```

**Data sources:**
- `title_ru`, `description_ru`, `cover_image`, `created_at` — DB: `Gallery`
- `itemListElement` — DB: `GalleryItems` (filtered by `gallery_id`, ordered by `sort_order`)
- `numberOfItems` — COMPUTED: count of gallery items for this album

---

## 8. Contacts Page — LocalBusiness with geo, openingHours, address

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://fcarsenal92.ru/contacts#localbusiness",
  "name": "ДФК Арсенал",
  "description": "Детская футбольная школа в Севастополе. Профессиональные тренеры, современная методика, группы для детей от 6 до 14 лет.",
  "url": "https://fcarsenal92.ru/contacts",
  "telephone": ["+7-978-813-09-82", "+7-978-812-64-32", "+7-978-10-40-940"],
  "email": "{{contacts.emails[0]}}",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "ул. Косарева, д.12, Спорткомплекс школы №61",
    "addressLocality": "Севастополь",
    "addressRegion": "Севастополь",
    "postalCode": "299000",
    "addressCountry": "RU"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "{{contacts.map_coordinates.latitude}}",
    "longitude": "{{contacts.map_coordinates.longitude}}"
  },
  "hasMap": "https://yandex.ru/maps/?ll={{contacts.map_coordinates.longitude}},{{contacts.map_coordinates.latitude}}&z=16",
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "18:00",
      "closes": "19:30"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": "Saturday",
      "opens": "12:00",
      "closes": "13:30"
    }
  ],
  "image": "https://fcarsenal92.ru/images/logo.png",
  "logo": "https://fcarsenal92.ru/images/logo.png",
  "priceRange": "4000₽ - 6000₽/мес",
  "sameAs": [
    "https://vk.com/arsenal_92",
    "https://t.me/arsenal_sevastopol",
    "https://www.youtube.com/@arsenal92",
    "https://dzen.ru/arsenal92",
    "https://t.me/s/arsenalarena"
  ],
  "areaServed": {
    "@type": "City",
    "name": "Севастополь"
  },
  "isAccessibleForFree": false,
  "makesOffer": [
    {
      "@type": "Offer",
      "itemOffered": {
        "@type": "Service",
        "name": "Групповые тренировки по футболу"
      },
      "price": "4000",
      "priceCurrency": "RUB"
    }
  ]
}
```

**Data sources:**
- `telephone`, `email`, `address`, `geo` — DB: `Contacts`
- `openingHoursSpecification` — DB: `Schedule` (aggregated unique time slots)
- `sameAs` — DB: `Contacts` (vk_url, telegram_url, youtube_url)
- `priceRange` — COMPUTED: from `PricingPlans` min/max
- `logo` — DB: `SiteSettings.logo_url`

---

## 9. Reviews — AggregateRating on SportsClub

```json
{
  "@context": "https://schema.org",
  "@type": "SportsClub",
  "@id": "https://fcarsenal92.ru/#organization",
  "name": "ДФК Арсенал",
  "url": "https://fcarsenal92.ru",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "{{computed.averageRating}}",
    "bestRating": "5",
    "worstRating": "1",
    "ratingCount": "{{computed.ratingCount}}",
    "reviewCount": "{{computed.reviewCount}}"
  },
  "review": [
    {
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": "{{review.author_name}}"
      },
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "{{review.rating}}",
        "bestRating": "5",
        "worstRating": "1"
      },
      "reviewBody": "{{review.text_ru}}",
      "datePublished": "{{review.created_at}}",
      "publisher": {
        "@type": "Organization",
        "@id": "https://fcarsenal92.ru/#organization"
      }
    }
  ]
}
```

**Repeat `review` array element for each published review.**

**Data sources:**
- `ratingValue` — COMPUTED: AVG(rating) from `Reviews` where `is_published=true`
- `reviewCount`, `ratingCount` — COMPUTED: COUNT from `Reviews` where `is_published=true`
- `author_name`, `rating`, `text_ru`, `created_at` — DB: `Reviews`

---

## 10. Shop Product — Product with Offer

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "@id": "https://fcarsenal92.ru/shop/{{product.slug}}#product",
  "name": "{{product.name_ru}}",
  "description": "{{product.description_ru}}",
  "image": "{{product.images}}",
  "sku": "{{product.id}}",
  "brand": {
    "@type": "Brand",
    "name": "ДФК Арсенал"
  },
  "category": "{{product.category.name_ru}}",
  "url": "https://fcarsenal92.ru/shop/{{product.slug}}",
  "offers": {
    "@type": "Offer",
    "url": "https://fcarsenal92.ru/shop/{{product.slug}}",
    "price": "{{product.price}}",
    "priceCurrency": "RUB",
    "availability": "{{computed.availability}}",
    "itemCondition": "https://schema.org/NewCondition",
    "seller": {
      "@type": "Organization",
      "@id": "https://fcarsenal92.ru/#organization",
      "name": "ДФК Арсенал"
    },
    "priceValidUntil": "{{computed.priceValidUntil}}",
    "shippingDetails": {
      "@type": "OfferShippingDetails",
      "shippingDestination": {
        "@type": "DefinedRegion",
        "addressCountry": "RU",
        "addressRegion": "Севастополь"
      }
    }
  },
  "additionalProperty": [
    {
      "@type": "PropertyValue",
      "name": "Доступные размеры",
      "value": "{{product.sizes | join(', ')}}"
    }
  ]
}
```

**Notes on `availability`:**
- `product.in_stock == true` -> `https://schema.org/InStock`
- `product.in_stock == false` -> `https://schema.org/OutOfStock`
- `product.old_price` present -> add `"priceSpecification"` with `"price"` and `"priceCurrency"` for discount display

**Data sources:**
- All product fields — DB: `ShopProducts`
- `category.name_ru` — DB: `ShopCategories` (via FK `category_id`)
- `availability` — COMPUTED: based on `in_stock` / `stock_quantity`
- `priceValidUntil` — COMPUTED: end of current season or 90 days from now
- `images` — DB: `ShopProducts.images[]` JSON array

---

## 11. Booking Page — Service with bookingAction

```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": "https://fcarsenal92.ru/booking#service",
  "name": "Запись на тренировку — ДФК Арсенал",
  "description": "Групповая тренировка и консультация с тренером. Запись на пробное занятие — бесплатно.",
  "provider": {
    "@type": "SportsClub",
    "@id": "https://fcarsenal92.ru/#organization",
    "name": "ДФК Арсенал"
  },
  "serviceType": "Football Training",
  "areaServed": {
    "@type": "City",
    "name": "Севастополь"
  },
  "audience": {
    "@type": "PeopleAudience",
    "suggestedMinAge": "6",
    "suggestedMaxAge": "14"
  },
  "offers": [
    {
      "@type": "Offer",
      "name": "Пробная тренировка",
      "price": "0",
      "priceCurrency": "RUB",
      "description": "Первые 2 тренировки бесплатно",
      "availability": "https://schema.org/InStock"
    },
    {
      "@type": "Offer",
      "name": "{{plan.name_ru}}",
      "price": "{{plan.price}}",
      "priceCurrency": "RUB",
      "availability": "https://schema.org/InStock"
    }
  ],
  "potentialAction": {
    "@type": "ReserveAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://fcarsenal92.ru/booking",
      "actionPlatform": [
        "https://schema.org/DesktopWebPlatform",
        "https://schema.org/MobileWebPlatform"
      ]
    },
    "result": {
      "@type": "Reservation",
      "name": "Запись на тренировку"
    }
  },
  "termsOfService": "https://fcarsenal92.ru/privacy"
}
```

**Data sources:**
- `offers` — DB: `PricingPlans` (all active plans) + STATIC free trial offer
- `provider` — STATIC: references org `@id`
- `audience` — STATIC: age range from project spec (6-14)
- `description` — STATIC or DB: `Pages` (slug=booking)

---

## 12. BreadcrumbList — Generic Template

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Главная",
      "item": "https://fcarsenal92.ru"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "{{page.breadcrumb_name_ru}}",
      "item": "https://fcarsenal92.ru/{{page.slug}}"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "{{subpage.title_ru}}",
      "item": "https://fcarsenal92.ru/{{page.slug}}/{{subpage.slug}}"
    }
  ]
}
```

**Usage by page:**

| Page | Breadcrumb Trail |
|------|-----------------|
| `/about` | Главная > О клубе |
| `/coaches` | Главная > Тренеры |
| `/schedule` | Главная > Расписание |
| `/pricing` | Главная > Тарифы |
| `/news` | Главная > Новости |
| `/news/[slug]` | Главная > Новости > {{title}} |
| `/gallery` | Главная > Галерея |
| `/gallery/[id]` | Главная > Галерея > {{title}} |
| `/booking` | Главная > Запись |
| `/shop` | Главная > Магазин |
| `/shop/[slug]` | Главная > Магазин > {{product.name}} |
| `/contacts` | Главная > Контакты |

**Data sources:**
- Position 1 — STATIC: always "Главная" / "Home"
- Position 2 — STATIC: page section name (from route config or i18n)
- Position 3 (if present) — DB: entity `title_ru` or `name_ru` (News, Gallery, ShopProduct)

---

## Implementation Notes

### Next.js Integration

Each template should be rendered as a `<script type="application/ld+json">` tag in the page's `<Head>` component. Use a shared utility:

```tsx
// src/frontend/lib/schema.ts
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
```

### Validation

- Test all templates with Google Rich Results Test: https://search.google.com/test/rich-results
- Test with Schema.org Validator: https://validator.schema.org/
- Monitor in Google Search Console > Enhancements

### i18n Handling

- Use `inLanguage` property on all top-level types
- For `en` locale, swap `_ru` fields with `_en` equivalents
- BreadcrumbList names should come from i18n messages (`ru.json` / `en.json`)

### Performance

- Generate JSON-LD at build time (SSG) or server-side (SSR) — never client-side
- Cache schema output alongside page cache (ISR revalidation)
- Keep each page's JSON-LD under 10KB
