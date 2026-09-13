export interface AdminSessionTokens {
  accessToken: string;
  refreshToken: string;
}

const ACCESS_KEY = 'admin_token';
const REFRESH_KEY = 'admin_refresh_token';

function safeStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function saveSession(auth: AdminSessionTokens): void {
  const storage = safeStorage();
  if (!storage) return;
  try {
    storage.setItem(ACCESS_KEY, auth.accessToken);
    storage.setItem(REFRESH_KEY, auth.refreshToken);
  } catch {
    // SSR/storage unavailable — ignore
  }
}

export function clearSession(): void {
  const storage = safeStorage();
  if (!storage) return;
  try {
    storage.removeItem(ACCESS_KEY);
    storage.removeItem(REFRESH_KEY);
  } catch {
    // ignore
  }
}

export function getAccessToken(): string | null {
  const storage = safeStorage();
  if (!storage) return null;
  try {
    return storage.getItem(ACCESS_KEY);
  } catch {
    return null;
  }
}

export function getRefreshToken(): string | null {
  const storage = safeStorage();
  if (!storage) return null;
  try {
    return storage.getItem(REFRESH_KEY);
  } catch {
    return null;
  }
}

export function sanitizeReturnTo(returnTo: string | null | undefined): string {
  return returnTo && returnTo.startsWith('/admin') ? returnTo : '/admin';
}

function terminateSession(): void {
  clearSession();
  if (typeof window === 'undefined') return;
  const pathname = window.location.pathname;
  window.location.assign('/admin/login?returnTo=' + encodeURIComponent(pathname));
}

let refreshPromise: Promise<boolean> | null = null;

async function ensureRefreshed(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      terminateSession();
      return false;
    }
    try {
      const res = await fetch('/api/admin/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (res.ok) {
        const auth: AdminSessionTokens = await res.json();
        saveSession(auth);
        return true;
      }
      if (res.status === 401 || res.status === 403 || res.status === 400) {
        terminateSession();
        return false;
      }
      // 5xx или иной неожиданный статус — сессию не трогаем (FR-008)
      return false;
    } catch {
      // сетевая ошибка — сессию не трогаем (FR-008)
      return false;
    }
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

function withAuthHeader(init: RequestInit | undefined, token: string | null): RequestInit {
  const headers = new Headers(init?.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return { ...init, headers };
}

export async function adminFetch(path: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(path, withAuthHeader(init, getAccessToken()));
  if (res.status !== 401) return res;

  const refreshed = await ensureRefreshed();
  if (!refreshed) return res;

  const retryRes = await fetch(path, withAuthHeader(init, getAccessToken()));
  if (retryRes.status === 401) {
    terminateSession();
  }
  return retryRes;
}
