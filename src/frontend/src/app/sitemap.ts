import type { MetadataRoute } from 'next';

const BASE_URL = 'https://fcarsenal92.ru';

// Static pages with their change frequency and priority
const staticPages: MetadataRoute.Sitemap = [
  {
    url: BASE_URL,
    changeFrequency: 'weekly',
    priority: 1.0,
  },
  {
    url: `${BASE_URL}/o-klube`,
    changeFrequency: 'monthly',
    priority: 0.8,
  },
  {
    url: `${BASE_URL}/prodvizhenie`,
    changeFrequency: 'monthly',
    priority: 0.8,
  },
  {
    url: `${BASE_URL}/prodvizhenie/sbory`,
    changeFrequency: 'monthly',
    priority: 0.7,
  },
  {
    url: `${BASE_URL}/prodvizhenie/tryout-serbia`,
    changeFrequency: 'monthly',
    priority: 0.8,
  },
  {
    url: `${BASE_URL}/prodvizhenie/stazhirovki`,
    changeFrequency: 'monthly',
    priority: 0.6,
  },
  {
    url: `${BASE_URL}/trenery`,
    changeFrequency: 'monthly',
    priority: 0.8,
  },
  {
    url: `${BASE_URL}/gruppy`,
    changeFrequency: 'monthly',
    priority: 0.7,
  },
  {
    url: `${BASE_URL}/raspisanie`,
    changeFrequency: 'weekly',
    priority: 0.9,
  },
  {
    url: `${BASE_URL}/ceny`,
    changeFrequency: 'monthly',
    priority: 0.9,
  },
  {
    url: `${BASE_URL}/novosti`,
    changeFrequency: 'weekly',
    priority: 0.8,
  },
  {
    url: `${BASE_URL}/foto`,
    changeFrequency: 'weekly',
    priority: 0.6,
  },
  {
    url: `${BASE_URL}/video`,
    changeFrequency: 'weekly',
    priority: 0.6,
  },
  {
    url: `${BASE_URL}/zapisatsya`,
    changeFrequency: 'monthly',
    priority: 1.0,
  },
  {
    url: `${BASE_URL}/kontakty`,
    changeFrequency: 'monthly',
    priority: 0.7,
  },
  {
    url: `${BASE_URL}/filosofiya`,
    changeFrequency: 'monthly',
    priority: 0.6,
  },
  {
    url: `${BASE_URL}/roditelyam`,
    changeFrequency: 'monthly',
    priority: 0.6,
  },
  {
    url: `${BASE_URL}/magazin`,
    changeFrequency: 'monthly',
    priority: 0.5,
  },
];

interface SitemapNewsItem {
  slug: string;
  updatedAt: string;
}

interface SitemapData {
  news?: SitemapNewsItem[];
}

async function fetchSitemapData(): Promise<SitemapData> {
  try {
    const apiBase =
      process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';
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

  return [...staticPages, ...newsPages];
}
