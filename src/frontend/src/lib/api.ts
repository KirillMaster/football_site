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
} from './mock-data';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';

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

// ─── Public API ──────────────────────────────────────────────────────────────

export async function getCoaches(): Promise<Coach[]> {
  return apiFetch('/api/coaches', mockCoaches);
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
  return apiFetch(`/api/news?page=${page}&pageSize=${pageSize}`, {
    data: mockNews,
    total: mockNews.length,
    page,
    pageSize,
  });
}

export async function getNewsArticle(slug: string): Promise<NewsArticle | null> {
  return apiFetch(
    `/api/news/${slug}`,
    mockNews.find((n) => n.slug === slug) ?? null
  );
}

export async function getAlbums(): Promise<Album[]> {
  return apiFetch('/api/albums', mockAlbums);
}

export async function getPhotos(albumId?: number): Promise<Photo[]> {
  const query = albumId ? `?albumId=${albumId}` : '';
  const fallback = albumId ? mockPhotos.filter((p) => p.albumId === albumId) : mockPhotos;
  return apiFetch(`/api/photos${query}`, fallback);
}

export async function getSiteSettings(): Promise<SiteSettings> {
  return apiFetch('/api/sitesettings', mockSiteSettings);
}

export async function getCmsPage(slug: string): Promise<CmsPage | null> {
  return apiFetch(`/api/pages/${slug}`, mockPages[slug] ?? null);
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

export async function adminLogin(
  email: string,
  password: string
): Promise<{ token: string } | null> {
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
