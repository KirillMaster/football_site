import type { MetadataRoute } from 'next';

const BASE_URL = 'https://fcarsenal92.ru';

// Static pages with their change frequency and priority
const staticPages: MetadataRoute.Sitemap = [
  {
    url: BASE_URL,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 1.0,
  },
  {
    url: `${BASE_URL}/o-klube`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  },
  {
    url: `${BASE_URL}/trenery`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  },
  {
    url: `${BASE_URL}/gruppy`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  },
  {
    url: `${BASE_URL}/raspisanie`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.9,
  },
  {
    url: `${BASE_URL}/ceny`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.9,
  },
  {
    url: `${BASE_URL}/novosti`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  },
  {
    url: `${BASE_URL}/foto`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.6,
  },
  {
    url: `${BASE_URL}/video`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.6,
  },
  {
    url: `${BASE_URL}/zapísatsya`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 1.0,
  },
  {
    url: `${BASE_URL}/kontakty`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  },
  {
    url: `${BASE_URL}/filosofiya`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.6,
  },
  {
    url: `${BASE_URL}/roditelyam`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.6,
  },
];

interface SitemapNewsItem {
  slug: string;
  updatedAt: string;
}

interface SitemapCoachItem {
  slug: string;
}

interface SitemapAlbumItem {
  id: number;
  updatedAt: string;
}

interface SitemapData {
  news?: SitemapNewsItem[];
  coaches?: SitemapCoachItem[];
  albums?: SitemapAlbumItem[];
}

async function fetchSitemapData(): Promise<SitemapData> {
  try {
    const apiBase =
      process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';
    const res = await fetch(`${apiBase}/api/sitemap-data`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return {};
    return (await res.json()) as SitemapData;
  } catch {
    // Graceful degradation: return empty so static pages are still exported
    return {};
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const data = await fetchSitemapData();

  const newsPages: MetadataRoute.Sitemap = (data.news ?? []).map((item) => ({
    url: `${BASE_URL}/novosti/${item.slug}`,
    lastModified: new Date(item.updatedAt),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const coachPages: MetadataRoute.Sitemap = (data.coaches ?? []).map(
    (item) => ({
      url: `${BASE_URL}/trenery/${item.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    })
  );

  const galleryPages: MetadataRoute.Sitemap = (data.albums ?? []).map(
    (item) => ({
      url: `${BASE_URL}/foto/${item.id}`,
      lastModified: new Date(item.updatedAt),
      changeFrequency: 'monthly',
      priority: 0.5,
    })
  );

  return [...staticPages, ...newsPages, ...coachPages, ...galleryPages];
}
