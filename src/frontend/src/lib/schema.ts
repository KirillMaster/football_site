// Schema.org JSON-LD generators for FC Arsenal-92
// All output is intended for server-side rendering only (SSG/SSR).
// Import types from the project's domain types — no schema-dts dependency required.

import type { Coach, NewsArticle, TrainingGroup } from '@/types';

const DOMAIN = 'https://fcarsenal92.ru';
const ORG_ID = `${DOMAIN}/#organization`;
const WEBSITE_ID = `${DOMAIN}/#website`;

// ─── Shared sub-objects ──────────────────────────────────────────────────────

const address = {
  '@type': 'PostalAddress',
  streetAddress: 'ул. Косарева, д.12, Спорткомплекс школы №61',
  addressLocality: 'Севастополь',
  addressRegion: 'Севастополь',
  postalCode: '299000',
  addressCountry: 'RU',
} as const;

const logo = {
  '@type': 'ImageObject',
  url: `${DOMAIN}/images/logo.png`,
  width: 1072,
  height: 1037,
} as const;

const sameAs = [
  'https://vk.com/arsenal_92',
  'https://t.me/arsenal_sevastopol',
  'https://www.youtube.com/@arsenal92',
  'https://dzen.ru/arsenal92',
];

const openingHours = [
  {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    opens: '18:00',
    closes: '19:30',
  },
  {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: 'Saturday',
    opens: '12:00',
    closes: '13:30',
  },
];

// ─── Organization ────────────────────────────────────────────────────────────

export function getOrganizationSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORG_ID,
    name: 'ДФК Арсенал',
    alternateName: 'FC Arsenal-92',
    description:
      'Квалифицированная школа футбола в Севастополе для детей от 6 до 14 лет. Профессиональные тренеры с лицензией УЕФА категории С.',
    url: DOMAIN,
    logo,
    telephone: ['+7-978-813-09-82', '+7-978-812-64-32'],
    address,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+7-978-813-09-82',
      contactType: 'customer service',
      availableLanguage: ['Russian', 'English'],
    },
    sameAs,
    founder: {
      '@type': 'Person',
      name: 'Кулиев Игорь Рамизович',
      jobTitle: 'Генеральный директор и старший тренер',
    },
  };
}

// ─── SportsClub ──────────────────────────────────────────────────────────────

export function getSportsClubSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': ['SportsClub', 'LocalBusiness'],
    '@id': ORG_ID,
    name: 'ДФК Арсенал',
    alternateName: 'FC Arsenal-92',
    description:
      'Квалифицированная школа футбола в Севастополе для детей от 6 до 14 лет. Профессиональные тренеры с лицензией УЕФА категории С.',
    url: DOMAIN,
    logo,
    image: `${DOMAIN}/images/og-home.jpg`,
    telephone: ['+7-978-813-09-82', '+7-978-812-64-32'],
    address,
    openingHoursSpecification: openingHours,
    sport: 'Football',
    priceRange: '4000₽ - 6000₽/мес',
    currenciesAccepted: 'RUB',
    paymentAccepted: 'Cash, Bank Transfer',
    sameAs,
    founder: {
      '@type': 'Person',
      name: 'Кулиев Игорь Рамизович',
      jobTitle: 'Генеральный директор и старший тренер',
    },
  };
}

// ─── LocalBusiness ───────────────────────────────────────────────────────────

export function getLocalBusinessSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${DOMAIN}/contacts#localbusiness`,
    name: 'ДФК Арсенал',
    description:
      'Детская футбольная школа в Севастополе. Профессиональные тренеры, современная методика, группы для детей от 6 до 14 лет.',
    url: `${DOMAIN}/contacts`,
    telephone: ['+7-978-813-09-82', '+7-978-812-64-32'],
    address,
    openingHoursSpecification: openingHours,
    image: `${DOMAIN}/images/logo.png`,
    logo: `${DOMAIN}/images/logo.png`,
    priceRange: '4000₽ - 6000₽/мес',
    sameAs,
    areaServed: {
      '@type': 'City',
      name: 'Севастополь',
    },
    isAccessibleForFree: false,
    makesOffer: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Групповые тренировки по футболу',
        },
        price: '4000',
        priceCurrency: 'RUB',
      },
    ],
  };
}

// ─── Person (Coach) ──────────────────────────────────────────────────────────

export function getCoachSchema(coach: Coach): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${DOMAIN}/trenery#coach-${coach.id}`,
    name: coach.name,
    jobTitle: coach.role,
    description: coach.bio,
    image: coach.photoUrl,
    hasCredential: coach.licenses.map((lic) => ({
      '@type': 'EducationalOccupationalCredential',
      credentialCategory: lic,
    })),
    memberOf: {
      '@type': 'SportsTeam',
      '@id': `${DOMAIN}/o-klube#sportsteam`,
      name: 'ДФК Арсенал',
    },
    worksFor: {
      '@id': ORG_ID,
    },
  };
}

// ─── Course (Training Group) ─────────────────────────────────────────────────

export function getCourseSchema(group: TrainingGroup): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    '@id': `${DOMAIN}/gruppy#group-${group.id}`,
    name: group.name,
    description: group.description,
    provider: {
      '@type': 'SportsClub',
      '@id': ORG_ID,
      name: 'ДФК Арсенал',
    },
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'onsite',
      instructor: {
        '@type': 'Person',
        name: group.coachName,
      },
      location: {
        '@type': 'Place',
        name: 'Спорткомплекс школы №61',
        address,
      },
    },
    offers: {
      '@type': 'Offer',
      price: String(group.price),
      priceCurrency: 'RUB',
      availability: 'https://schema.org/InStock',
      url: `${DOMAIN}/zapísatsya`,
    },
    coursePrerequisites: `Дети от ${group.ageMin} до ${group.ageMax} лет`,
    educationalLevel: 'Beginner to Advanced',
  };
}

// ─── Article (News) ──────────────────────────────────────────────────────────

export function getArticleSchema(news: NewsArticle): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    '@id': `${DOMAIN}/novosti/${news.slug}#article`,
    headline: news.title,
    description: news.excerpt,
    image: {
      '@type': 'ImageObject',
      url: news.coverImageUrl,
      width: 1200,
      height: 630,
    },
    datePublished: news.publishedAt,
    dateModified: news.publishedAt,
    author: {
      '@type': 'Organization',
      '@id': ORG_ID,
      name: 'ДФК Арсенал',
    },
    publisher: {
      '@type': 'Organization',
      '@id': ORG_ID,
      name: 'ДФК Арсенал',
      logo: {
        '@type': 'ImageObject',
        url: `${DOMAIN}/images/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${DOMAIN}/novosti/${news.slug}`,
    },
    articleSection: 'Новости клуба',
    keywords: news.tags.join(', '),
    inLanguage: 'ru',
    isPartOf: {
      '@id': WEBSITE_ID,
    },
  };
}

// ─── BreadcrumbList ───────────────────────────────────────────────────────────

export function getBreadcrumbSchema(
  items: { name: string; url: string }[]
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// ─── FAQPage ─────────────────────────────────────────────────────────────────
// NOTE: Google restricted FAQ rich results to government/healthcare sites (Aug 2023).
// This schema still benefits AI/LLM citations and search answer boxes.

export function getFAQSchema(
  items: { q: string; a: string }[]
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };
}

// ─── WebSite + SearchAction ──────────────────────────────────────────────────

export function getWebSiteSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: 'ДФК Арсенал — Детская футбольная школа Севастополь',
    url: DOMAIN,
    inLanguage: ['ru', 'en'],
    publisher: {
      '@id': ORG_ID,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${DOMAIN}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}
