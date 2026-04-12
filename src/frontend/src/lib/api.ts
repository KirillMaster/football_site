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
    : (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000');

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

export async function getGroups(): Promise<TrainingGroup[]> {
  return apiFetch('/api/groups', mockGroups);
}

export async function getPricingPlans(): Promise<PricingPlan[]> {
  return apiFetch('/api/pricing', mockPricingPlans);
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
  return apiFetch('/api/sitesettings', mockSiteSettings);
}

export async function getCmsPage(slug: string): Promise<CmsPage | null> {
  return apiFetch(`/api/pages/${slug}`, mockPages[slug] ?? null);
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
    const res = await fetch(`${API_URL}/api/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch {
    // In dev mode without backend, simulate success
    console.warn('API unavailable — contact message not sent:', data);
    return true;
  }
}

export async function submitTryoutRequest(data: TryoutRequest): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/api/tryouts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch {
    console.warn('API unavailable — tryout request not sent:', data);
    return true;
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
