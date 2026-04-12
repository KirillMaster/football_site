import type {
  Coach,
  TrainingGroup,
  PricingPlan,
  NewsArticle,
  Album,
  Photo,
  SiteSettings,
  CmsPage,
  PaginatedResponse,
  ContactMessage,
  TryoutRequest,
  Partner,
  Review,
} from '@/types';

import {
  mockCoaches,
  mockGroups,
  mockPricingPlans,
  mockNews,
  mockAlbums,
  mockPhotos,
  mockSiteSettings,
  mockPages,
  mockPartners,
  mockReviews,
} from './mock-data';

// Server-side (SSR/RSC): use internal Docker network URL for performance
// Client-side (browser): use public URL via Nginx
const API_URL =
  typeof window === 'undefined'
    ? (process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000')
    : '';

/**
 * Generic fetch wrapper. Falls back to mock data when the API is unavailable.
 */
async function apiFetch<T>(path: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

// ─── Backend DTO types (raw API response shapes) ─────────────────────────────

interface RawCoach {
  id: string;
  nameRu: string;
  positionRu: string;
  bioRu: string;
  photo?: string | null;
  certifications: string[];
}

interface RawNewsSummary {
  id: string;
  slug: string;
  titleRu: string;
  excerptRu: string;
  coverImage?: string | null;
  tags: string[];
  publishedAt?: string | null;
}

interface RawNewsDetail extends RawNewsSummary {
  contentRu: string;
  metaTitle: string;
  metaDescription: string;
}

interface RawPhoto {
  id: string;
  url: string;
  thumbnailUrl: string;
  altRu: string;
  tags: string[];
  sortOrder: number;
}

interface RawPartner {
  id: string;
  name: string;
  descriptionRu: string;
  logoUrl?: string | null;
  websiteUrl?: string | null;
}

interface RawPageDto {
  id: string;
  slug: string;
  titleRu: string;
  contentRu: string;
  metaDescriptionRu: string;
  isPublished: boolean;
  updatedAt: string;
}

interface RawSiteSettingsDto {
  phones: string[];
  email: string;
  address: string;
  socials: { vk?: string; telegram?: string; youtube?: string; dzen?: string };
  heroVideoRutubeId?: string;
  mapEmbedUrl?: string;
}

// ─── Mappers ─────────────────────────────────────────────────────────────────

function mapCoach(raw: RawCoach, index: number): Coach {
  return {
    id: index + 1,
    name: raw.nameRu,
    role: raw.positionRu,
    bio: raw.bioRu,
    photoUrl: raw.photo ?? '',
    licenses: raw.certifications ?? [],
    experience: 0,
  };
}

function mapNewsSummary(raw: RawNewsSummary, index: number): NewsArticle {
  return {
    id: index + 1,
    slug: raw.slug,
    title: raw.titleRu,
    excerpt: raw.excerptRu,
    content: '',
    coverImageUrl: raw.coverImage ?? '',
    publishedAt: raw.publishedAt ?? new Date().toISOString(),
    author: 'ДФК Арсенал',
    tags: raw.tags ?? [],
  };
}

function mapNewsDetail(raw: RawNewsDetail): NewsArticle {
  return {
    id: 1,
    slug: raw.slug,
    title: raw.titleRu,
    excerpt: raw.excerptRu,
    content: raw.contentRu,
    coverImageUrl: raw.coverImage ?? '',
    publishedAt: raw.publishedAt ?? new Date().toISOString(),
    author: 'ДФК Арсенал',
    tags: raw.tags ?? [],
  };
}

function mapPhoto(raw: RawPhoto, index: number): Photo {
  return {
    id: index + 1,
    url: raw.url,
    thumbnailUrl: raw.thumbnailUrl ?? raw.url,
    caption: raw.altRu ?? '',
    takenAt: new Date().toISOString(),
    albumId: 1,
  };
}

function mapPartner(raw: RawPartner, index: number): Partner {
  return {
    id: index + 1,
    name: raw.name,
    description: raw.descriptionRu ?? '',
    logoUrl: raw.logoUrl ?? null,
    websiteUrl: raw.websiteUrl ?? null,
  };
}

function mapCmsPage(raw: RawPageDto): CmsPage {
  return {
    id: 0,
    slug: raw.slug,
    title: raw.titleRu,
    content: raw.contentRu,
    metaDescription: raw.metaDescriptionRu,
    updatedAt: raw.updatedAt,
  };
}

function mapSiteSettings(raw: RawSiteSettingsDto): SiteSettings {
  return {
    phones: raw.phones ?? [],
    email: raw.email ?? '',
    address: raw.address ?? '',
    socials: {
      vk: raw.socials?.vk,
      telegram: raw.socials?.telegram,
      youtube: raw.socials?.youtube,
      dzen: raw.socials?.dzen,
    },
    heroVideoRutubeId: raw.heroVideoRutubeId,
    mapEmbedUrl: raw.mapEmbedUrl,
  };
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function getCoaches(): Promise<Coach[]> {
  try {
    const res = await fetch(`${API_URL}/api/coaches`, { next: { revalidate: 60 } });
    if (!res.ok) return mockCoaches;
    const raw: RawCoach[] = await res.json();
    return raw.map(mapCoach);
  } catch {
    return mockCoaches;
  }
}

// Raw DTO shapes from .NET backend
interface RawGroupDto {
  id: string;
  name: string;
  ageRange: string;
  level: string;
  maxCapacity: number;
  descriptionRu: string;
  descriptionEn: string;
  isActive: boolean;
}

interface RawScheduleDto {
  id: string;
  groupId: string;
  groupName: string;
  coachId: string;
  coachName: string;
  dayOfWeek: string; // .NET DayOfWeek enum: "Sunday","Monday",...
  startTime: string; // "HH:mm"
  endTime: string;
  location: string;
  isActive: boolean;
}

// .NET DayOfWeek (Sun=0) → frontend index (Mon=0)
const DOW_MAP: Record<string, number> = {
  Sunday: 6, Monday: 0, Tuesday: 1, Wednesday: 2,
  Thursday: 3, Friday: 4, Saturday: 5,
};

function parseAgeRange(range: string): { min: number; max: number } {
  const m = range.match(/(\d+)[^\d]+(\d+)/);
  return m ? { min: parseInt(m[1]), max: parseInt(m[2]) } : { min: 5, max: 17 };
}

export async function getGroups(): Promise<TrainingGroup[]> {
  try {
    const [groupsRes, schedulesRes] = await Promise.all([
      fetch(`${API_URL}/api/groups`, { next: { revalidate: 60 } }),
      fetch(`${API_URL}/api/groups/schedules`, { next: { revalidate: 60 } }),
    ]);

    if (!groupsRes.ok) return mockGroups;
    const rawGroups: RawGroupDto[] = await groupsRes.json();

    let rawSchedules: RawScheduleDto[] = [];
    if (schedulesRes.ok) {
      const body = await schedulesRes.json();
      rawSchedules = Array.isArray(body) ? body : [];
    }

    return rawGroups.map((g, i) => {
      const { min, max } = parseAgeRange(g.ageRange);
      const slots = rawSchedules
        .filter((s) => s.groupId === g.id && s.isActive)
        .map((s) => ({
          dayOfWeek: DOW_MAP[s.dayOfWeek] ?? 0,
          startTime: s.startTime,
          endTime: s.endTime,
          location: s.location,
        }));
      const firstCoach = rawSchedules.find((s) => s.groupId === g.id)?.coachName ?? '';
      return {
        id: i + 1,
        name: g.name,
        ageMin: min,
        ageMax: max,
        description: g.descriptionRu,
        schedule: slots,
        price: 0,
        coachName: firstCoach,
      };
    });
  } catch {
    return mockGroups;
  }
}

interface RawPricingPlan {
  id: string;
  nameRu: string;
  price: number;
  featuresRu: string[];
  isFeatured: boolean;
}

function mapPricingPlan(raw: RawPricingPlan): PricingPlan {
  return {
    id: raw.id,
    name: raw.nameRu,
    priceRub: raw.price,
    features: raw.featuresRu ?? [],
    isPopular: raw.isFeatured,
  };
}

export async function getPricingPlans(): Promise<PricingPlan[]> {
  try {
    const res = await fetch(`${API_URL}/api/pricing`, { next: { revalidate: 60 } });
    if (!res.ok) return mockPricingPlans;
    const raw: RawPricingPlan[] = await res.json();
    return raw.map(mapPricingPlan);
  } catch {
    return mockPricingPlans;
  }
}

export async function getNewsPage(
  page = 1,
  pageSize = 9
): Promise<PaginatedResponse<NewsArticle>> {
  try {
    const res = await fetch(`${API_URL}/api/news?page=${page}&pageSize=${pageSize}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return { data: mockNews, total: mockNews.length, page, pageSize };
    const raw = await res.json() as { items?: RawNewsSummary[]; totalCount?: number; total?: number };
    const items: RawNewsSummary[] = raw.items ?? [];
    return {
      data: items.map(mapNewsSummary),
      total: raw.totalCount ?? raw.total ?? items.length,
      page,
      pageSize,
    };
  } catch {
    return { data: mockNews, total: mockNews.length, page, pageSize };
  }
}

export async function getNewsArticle(slug: string): Promise<NewsArticle | null> {
  try {
    const res = await fetch(`${API_URL}/api/news/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return mockNews.find((n) => n.slug === slug) ?? null;
    const raw: RawNewsDetail = await res.json();
    return mapNewsDetail(raw);
  } catch {
    return mockNews.find((n) => n.slug === slug) ?? null;
  }
}

export async function getAlbums(): Promise<Album[]> {
  return apiFetch('/api/albums', mockAlbums);
}

export async function getPhotos(albumId?: number): Promise<Photo[]> {
  try {
    const query = albumId ? `?albumId=${albumId}` : '';
    const res = await fetch(`${API_URL}/api/photos${query}`, { next: { revalidate: 60 } });
    if (!res.ok) return albumId ? mockPhotos.filter((p) => p.albumId === albumId) : mockPhotos;
    const raw = await res.json() as { items?: RawPhoto[] } | RawPhoto[];
    const photos: RawPhoto[] = Array.isArray(raw) ? raw : (raw.items ?? []);
    return photos.map(mapPhoto);
  } catch {
    return albumId ? mockPhotos.filter((p) => p.albumId === albumId) : mockPhotos;
  }
}

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const res = await fetch(`${API_URL}/api/sitesettings`, { next: { revalidate: 300 } });
    if (!res.ok) return mockSiteSettings;
    const raw: RawSiteSettingsDto = await res.json();
    return mapSiteSettings(raw);
  } catch {
    return mockSiteSettings;
  }
}

export async function getCmsPage(slug: string): Promise<CmsPage | null> {
  try {
    const res = await fetch(`${API_URL}/api/pages/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return mockPages[slug] ?? null;
    const raw: RawPageDto = await res.json();
    return mapCmsPage(raw);
  } catch {
    return mockPages[slug] ?? null;
  }
}

export async function getPartners(): Promise<Partner[]> {
  try {
    const res = await fetch(`${API_URL}/api/partners`, { next: { revalidate: 60 } });
    if (!res.ok) return mockPartners;
    const raw: RawPartner[] = await res.json();
    return raw.map(mapPartner);
  } catch {
    return mockPartners;
  }
}

export async function getReviews(): Promise<Review[]> {
  return mockReviews; // no backend endpoint yet
}

// ─── Form Submissions ────────────────────────────────────────────────────────

export async function submitContactMessage(data: ContactMessage): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function submitTryoutRequest(data: TryoutRequest): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/api/tryout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        childName: data.childName,
        childAge: data.age,
        parentName: data.parentName,
        phone: data.phone,
        email: data.email,
        message: data.message ?? '',
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ─── Admin Pages API ─────────────────────────────────────────────────────────

function authHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
  return token ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } : { 'Content-Type': 'application/json' };
}

export async function getAdminPages(): Promise<import('@/types').AdminPage[]> {
  try {
    const res = await fetch(`${API_URL}/api/admin/pages`, { headers: authHeaders() });
    if (!res.ok) return [];
    const raw: Array<{ id: string; slug: string; titleRu: string; contentRu?: string; metaDescriptionRu?: string; isPublished: boolean; sortOrder: number; updatedAt: string }> = await res.json();
    return raw.map((r) => ({
      id: r.id,
      slug: r.slug,
      titleRu: r.titleRu,
      contentRu: r.contentRu ?? '',
      metaDescriptionRu: r.metaDescriptionRu ?? '',
      isPublished: r.isPublished,
      sortOrder: r.sortOrder,
      updatedAt: r.updatedAt,
    }));
  } catch {
    return [];
  }
}

export async function getAdminPageBySlug(slug: string): Promise<import('@/types').AdminPage | null> {
  try {
    const res = await fetch(`${API_URL}/api/admin/pages/${slug}`, { headers: authHeaders() });
    if (!res.ok) return null;
    const r = await res.json();
    return {
      id: r.id,
      slug: r.slug,
      titleRu: r.titleRu,
      contentRu: r.contentRu ?? '',
      metaDescriptionRu: r.metaDescriptionRu ?? '',
      isPublished: r.isPublished,
      sortOrder: r.sortOrder,
      updatedAt: r.updatedAt,
    };
  } catch {
    return null;
  }
}

export async function updateAdminPage(
  id: string,
  data: { titleRu: string; contentRu: string; metaDescriptionRu: string; isPublished: boolean }
): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/api/admin/pages/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({
        slug: '',  // will be ignored by backend if page exists
        titleRu: data.titleRu,
        titleEn: '',
        contentRu: data.contentRu,
        contentEn: '',
        metaTitleRu: data.titleRu,
        metaDescriptionRu: data.metaDescriptionRu,
        metaTitleEn: '',
        metaDescriptionEn: '',
        isPublished: data.isPublished,
        sortOrder: 0,
        ogImage: null,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ─── Admin Auth ───────────────────────────────────────────────────────────────

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  email: string;
  role: string;
}

export async function adminLogin(
  email: string,
  password: string
): Promise<AuthResponse | null> {
  try {
    const res = await fetch(`${API_URL}/api/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
