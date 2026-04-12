// ─── Domain Types ───────────────────────────────────────────────────────────

export interface Coach {
  id: number;
  name: string;
  role: string;
  bio: string;
  photoUrl: string;
  licenses: string[];
  experience: number; // years
}

export interface TrainingGroup {
  id: number;
  name: string;
  ageMin: number;
  ageMax: number;
  description: string;
  schedule: ScheduleSlot[];
  price: number;
  coachName: string;
}

export interface ScheduleSlot {
  dayOfWeek: number; // 0=Mon … 6=Sun
  startTime: string; // "HH:mm"
  endTime: string;
  location: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  priceRub: number;
  features: string[];
  isPopular?: boolean;
}

export interface NewsArticle {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  publishedAt: string; // ISO date
  author: string;
  tags: string[];
}

export interface Photo {
  id: number;
  url: string;
  thumbnailUrl: string;
  caption: string;
  takenAt: string;
  albumId: number;
}

export interface Album {
  id: number;
  title: string;
  coverUrl: string;
  photoCount: number;
  createdAt: string;
}

export interface ContactMessage {
  id?: number;
  name: string;
  phone: string;
  email: string;
  message: string;
  createdAt?: string;
}

export interface TryoutRequest {
  id?: number;
  childName: string;
  age: number;
  parentName: string;
  phone: string;
  email: string;
  message?: string;
  createdAt?: string;
}

export interface SiteSettings {
  phones: string[];
  email: string;
  address: string;
  socials: {
    vk?: string;
    telegram?: string;
    youtube?: string;
    dzen?: string;
  };
  mapEmbedUrl?: string;
}

export interface CmsPage {
  id: number;
  slug: string;
  title: string;
  content: string;
  metaDescription?: string;
  updatedAt: string;
}

// ─── API Response wrappers ───────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApiError {
  message: string;
  code?: string;
}

// ─── Admin Types ─────────────────────────────────────────────────────────────

export interface AdminUser {
  id: number;
  email: string;
  role: 'admin' | 'editor';
  token?: string;
}

export interface DashboardStats {
  newMessages: number;
  newTryoutRequests: number;
  totalCoaches: number;
  totalNewsArticles: number;
  totalPhotos: number;
}
