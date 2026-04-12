import type {
  Coach,
  TrainingGroup,
  PricingPlan,
  NewsArticle,
  Photo,
  Album,
  SiteSettings,
  CmsPage,
  DashboardStats,
} from '@/types';

// ─── Site Settings ──────────────────────────────────────────────────────────

export const mockSiteSettings: SiteSettings = {
  phones: ['+7-978-813-09-82', '+7-978-812-64-32', '+7-978-10-40-940'],
  email: 'info@arsenal92.ru',
  address: 'г. Севастополь, ул. Спортивная, 1',
  socials: {
    vk: 'https://vk.com/arsenal_92',
    telegram: 'https://t.me/arsenal_sevastopol',
    youtube: 'https://youtube.com/@arsenal92',
    dzen: 'https://dzen.ru/arsenal92',
  },
  mapEmbedUrl:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2898.7!2d33.5254!3d44.6054!',
};

// ─── Coaches ────────────────────────────────────────────────────────────────

export const mockCoaches: Coach[] = [
  {
    id: 1,
    name: 'Алексей Николаевич Петров',
    role: 'Главный тренер',
    bio: 'Мастер спорта по футболу. Воспитал более 30 профессиональных игроков. Работает с детьми с 2005 года.',
    photoUrl: '/images/coaches/coach1.jpg',
    licenses: ['UEFA B', 'РФС категории Б'],
    experience: 19,
  },
  {
    id: 2,
    name: 'Дмитрий Сергеевич Иванов',
    role: 'Тренер группы 8–10 лет',
    bio: 'Специализируется на работе с младшими возрастными группами. Применяет игровые методы обучения.',
    photoUrl: '/images/coaches/coach2.jpg',
    licenses: ['RFU D', 'Детско-юношеский тренер'],
    experience: 8,
  },
  {
    id: 3,
    name: 'Михаил Владимирович Козлов',
    role: 'Тренер группы 11–13 лет',
    bio: 'Бывший профессиональный футболист. Акцент на тактическое мышление и командную игру.',
    photoUrl: '/images/coaches/coach3.jpg',
    licenses: ['UEFA C', 'РФС категории С'],
    experience: 12,
  },
  {
    id: 4,
    name: 'Андрей Павлович Соколов',
    role: 'Тренер вратарей',
    bio: 'Специалист по подготовке вратарей. Авторская методика тренировок для детей.',
    photoUrl: '/images/coaches/coach4.jpg',
    licenses: ['Тренер вратарей RFU', 'UEFA GK'],
    experience: 10,
  },
];

// ─── Training Groups ─────────────────────────────────────────────────────────

export const mockGroups: TrainingGroup[] = [
  {
    id: 1,
    name: 'Малыши',
    ageMin: 5,
    ageMax: 7,
    description: 'Первое знакомство с футболом. Игровая форма занятий, развитие координации и моторики.',
    schedule: [
      { dayOfWeek: 0, startTime: '10:00', endTime: '11:00', location: 'Стадион "Арсенал"' },
      { dayOfWeek: 2, startTime: '10:00', endTime: '11:00', location: 'Стадион "Арсенал"' },
    ],
    price: 4000,
    coachName: 'Дмитрий Сергеевич Иванов',
  },
  {
    id: 2,
    name: 'Юниоры',
    ageMin: 8,
    ageMax: 10,
    description: 'Освоение базовой техники: удары, передачи, дриблинг. Участие в товарищеских матчах.',
    schedule: [
      { dayOfWeek: 0, startTime: '12:00', endTime: '13:30', location: 'Стадион "Арсенал"' },
      { dayOfWeek: 2, startTime: '12:00', endTime: '13:30', location: 'Стадион "Арсенал"' },
      { dayOfWeek: 4, startTime: '16:00', endTime: '17:30', location: 'Спортзал №2' },
    ],
    price: 5400,
    coachName: 'Дмитрий Сергеевич Иванов',
  },
  {
    id: 3,
    name: 'Кадеты',
    ageMin: 11,
    ageMax: 13,
    description: 'Тактическая подготовка, участие в городских турнирах, повышенные физические нагрузки.',
    schedule: [
      { dayOfWeek: 0, startTime: '14:00', endTime: '16:00', location: 'Стадион "Арсенал"' },
      { dayOfWeek: 2, startTime: '14:00', endTime: '16:00', location: 'Стадион "Арсенал"' },
      { dayOfWeek: 4, startTime: '14:00', endTime: '16:00', location: 'Стадион "Арсенал"' },
    ],
    price: 6000,
    coachName: 'Михаил Владимирович Козлов',
  },
  {
    id: 4,
    name: 'Юноши',
    ageMin: 14,
    ageMax: 17,
    description: 'Профессиональная подготовка. Участие в региональных соревнованиях, просмотр в ФК.',
    schedule: [
      { dayOfWeek: 1, startTime: '15:00', endTime: '17:00', location: 'Стадион "Арсенал"' },
      { dayOfWeek: 3, startTime: '15:00', endTime: '17:00', location: 'Стадион "Арсенал"' },
      { dayOfWeek: 5, startTime: '10:00', endTime: '12:00', location: 'Стадион "Арсенал"' },
    ],
    price: 6000,
    coachName: 'Алексей Николаевич Петров',
  },
];

// ─── Pricing Plans ───────────────────────────────────────────────────────────

export const mockPricingPlans: PricingPlan[] = [
  {
    id: 'standard',
    name: 'Standard',
    priceRub: 4000,
    features: [
      '2 тренировки в неделю',
      'Базовая техника',
      'Форма клуба',
      'Медицинский осмотр',
    ],
  },
  {
    id: 'standard-plus',
    name: 'Standard+',
    priceRub: 5400,
    isPopular: true,
    features: [
      '3 тренировки в неделю',
      'Расширенная программа',
      'Форма клуба',
      'Медицинский осмотр',
      'Участие в турнирах',
      'Индивидуальные разборы',
    ],
  },
  {
    id: 'pro',
    name: 'PRO',
    priceRub: 6000,
    features: [
      '4 тренировки в неделю',
      'Профессиональная программа',
      'Форма клуба + экипировка',
      'Медицинский осмотр',
      'Участие в турнирах',
      'Видеоанализ игры',
      'Индивидуальный план развития',
      'Просмотр в ФК',
    ],
  },
];

// ─── News Articles ───────────────────────────────────────────────────────────

export const mockNews: NewsArticle[] = [
  {
    id: 1,
    slug: 'arsenal-92-pobedil-v-turnire',
    title: 'Арсенал-92 победил в городском турнире',
    excerpt: 'Наши юные футболисты завоевали первое место в городском турнире по мини-футболу среди детских клубов Севастополя.',
    content: '<p>Наши юные футболисты завоевали первое место в городском турнире по мини-футболу. Команда показала отличную игру на протяжении всего турнира.</p>',
    coverImageUrl: '/images/news/news1.jpg',
    publishedAt: '2026-03-15T10:00:00Z',
    author: 'Администрация клуба',
    tags: ['турнир', 'победа', 'мини-футбол'],
  },
  {
    id: 2,
    slug: 'novye-treninghi-v-raspisanie',
    title: 'Обновлённое расписание с апреля',
    excerpt: 'С 1 апреля вводим дополнительные тренировки для группы Кадеты. Подробности — в расписании.',
    content: '<p>С началом весенне-летнего сезона мы обновляем расписание тренировок. Группа Кадеты получит дополнительный день занятий.</p>',
    coverImageUrl: '/images/news/news2.jpg',
    publishedAt: '2026-03-28T09:00:00Z',
    author: 'Администрация клуба',
    tags: ['расписание', 'кадеты'],
  },
  {
    id: 3,
    slug: 'nabor-v-novye-gruppy',
    title: 'Открыт набор в группы на 2026 год',
    excerpt: 'Принимаем детей от 5 до 17 лет. Первое занятие — бесплатно. Запишитесь онлайн прямо сейчас!',
    content: '<p>Мы рады объявить о начале нового набора в учебно-тренировочные группы ФК Арсенал-92.</p>',
    coverImageUrl: '/images/news/news3.jpg',
    publishedAt: '2026-04-01T08:00:00Z',
    author: 'Администрация клуба',
    tags: ['набор', '2026'],
  },
];

// ─── Photos ──────────────────────────────────────────────────────────────────

export const mockAlbums: Album[] = [
  {
    id: 1,
    title: 'Городской турнир 2026',
    coverUrl: '/images/gallery/album1.jpg',
    photoCount: 24,
    createdAt: '2026-03-15',
  },
  {
    id: 2,
    title: 'Тренировки весна 2026',
    coverUrl: '/images/gallery/album2.jpg',
    photoCount: 18,
    createdAt: '2026-03-01',
  },
];

export const mockPhotos: Photo[] = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  url: `/images/gallery/photo${i + 1}.jpg`,
  thumbnailUrl: `/images/gallery/thumb${i + 1}.jpg`,
  caption: `Фото ${i + 1}`,
  takenAt: '2026-03-15',
  albumId: i < 6 ? 1 : 2,
}));

// ─── CMS Pages ───────────────────────────────────────────────────────────────

export const mockPages: Record<string, CmsPage> = {
  about: {
    id: 1,
    slug: 'about',
    title: 'О клубе',
    content: `
      <h2>История клуба</h2>
      <p>ФК Арсенал-92 основан в 1992 году в Севастополе. За более чем 30 лет клуб воспитал сотни юных футболистов, многие из которых стали профессиональными игроками.</p>
      <h2>Наша миссия</h2>
      <p>Развивать детский футбол в Крыму, воспитывать здоровое и спортивное поколение.</p>
      <h2>Достижения</h2>
      <ul>
        <li>Чемпионы Севастополя 2020, 2022, 2024</li>
        <li>Финалисты Кубка Крыма 2023</li>
        <li>Более 15 воспитанников в профессиональных клубах</li>
      </ul>
    `,
    metaDescription: 'История и достижения ФК Арсенал-92 — детской футбольной школы Севастополя',
    updatedAt: '2026-01-10',
  },
  mission: {
    id: 2,
    slug: 'mission',
    title: 'Философия клуба',
    content: `
      <h2>Наши ценности</h2>
      <p>Мы верим, что спорт формирует характер. Наша философия строится на трёх принципах: честность, командный дух, стремление к совершенству.</p>
      <h2>Методология</h2>
      <p>Используем современные европейские методики подготовки юных футболистов, адаптированные для российских условий.</p>
      <h2>Развитие личности</h2>
      <p>Для нас важно не только спортивное, но и личностное развитие каждого ребёнка. Мы учим уважать соперника и ценить победу.</p>
    `,
    metaDescription: 'Философия и ценности ФК Арсенал-92 — что мы вкладываем в воспитание юных футболистов',
    updatedAt: '2026-01-10',
  },
};

// ─── Dashboard Stats ─────────────────────────────────────────────────────────

export const mockDashboardStats: DashboardStats = {
  newMessages: 3,
  newTryoutRequests: 7,
  totalCoaches: 4,
  totalNewsArticles: 3,
  totalPhotos: 12,
};
