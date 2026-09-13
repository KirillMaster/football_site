import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  adminFetch,
  saveSession,
  clearSession,
  getAccessToken,
  getRefreshToken,
  sanitizeReturnTo,
} from '../adminAuth';

function jsonResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

function setPathname(pathname: string) {
  Object.defineProperty(window, 'location', {
    value: { ...window.location, pathname, assign: vi.fn() },
    writable: true,
    configurable: true,
  });
}

beforeEach(() => {
  localStorage.clear();
  setPathname('/admin/coaches');
});

describe('@US1-AS-1 @US1-TS-1', () => {
  it('adminFetch: 401 -> один refresh -> один повтор с новым Bearer -> успешный ответ', async () => {
    localStorage.setItem('admin_token', 'old-access');
    localStorage.setItem('admin_refresh_token', 'valid-refresh');

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(401, null)) // исходный запрос
      .mockResolvedValueOnce(
        jsonResponse(200, {
          accessToken: 'new-access',
          refreshToken: 'new-refresh',
          expiresAt: '2030-01-01',
          email: 'a@a.ru',
          role: 'admin',
        })
      ) // refresh
      .mockResolvedValueOnce(jsonResponse(200, { data: 'ok' })); // повтор
    vi.stubGlobal('fetch', fetchMock);

    const res = await adminFetch('/api/admin/coaches');

    expect(res.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[1][0]).toBe('/api/admin/auth/refresh');
    const retryHeaders = fetchMock.mock.calls[2][1]?.headers as Headers;
    expect(retryHeaders.get('Authorization')).toBe('Bearer new-access');
    expect(localStorage.getItem('admin_token')).toBe('new-access');
    expect(localStorage.getItem('admin_refresh_token')).toBe('new-refresh');

    vi.unstubAllGlobals();
  });
});

describe('@US1-AS-2 @US1-TS-2', () => {
  it('single-flight: три параллельных 401 порождают ровно один POST /refresh', async () => {
    localStorage.setItem('admin_token', 'old-access');
    localStorage.setItem('admin_refresh_token', 'valid-refresh');

    let refreshCalls = 0;
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url === '/api/admin/auth/refresh') {
        refreshCalls += 1;
        return jsonResponse(200, {
          accessToken: 'new-access',
          refreshToken: 'new-refresh',
          expiresAt: '2030-01-01',
          email: 'a@a.ru',
          role: 'admin',
        });
      }
      const token = getAccessToken();
      if (token === 'new-access') return jsonResponse(200, { data: 'ok' });
      return jsonResponse(401, null);
    });
    vi.stubGlobal('fetch', fetchMock);

    const [r1, r2, r3] = await Promise.all([
      adminFetch('/api/admin/coaches'),
      adminFetch('/api/admin/news'),
      adminFetch('/api/admin/groups'),
    ]);

    expect(refreshCalls).toBe(1);
    expect(r1.ok).toBe(true);
    expect(r2.ok).toBe(true);
    expect(r3.ok).toBe(true);

    vi.unstubAllGlobals();
  });
});

describe('@US1-EC-1 @US2-AS-3', () => {
  it('повторный 401 после успешного refresh очищает сессию без второго refresh', async () => {
    localStorage.setItem('admin_token', 'old-access');
    localStorage.setItem('admin_refresh_token', 'valid-refresh');

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(401, null)) // исходный
      .mockResolvedValueOnce(
        jsonResponse(200, {
          accessToken: 'new-access',
          refreshToken: 'new-refresh',
          expiresAt: '2030-01-01',
          email: 'a@a.ru',
          role: 'admin',
        })
      ) // refresh успешен
      .mockResolvedValueOnce(jsonResponse(401, null)); // повтор снова 401
    vi.stubGlobal('fetch', fetchMock);

    await adminFetch('/api/admin/coaches');

    expect(fetchMock).toHaveBeenCalledTimes(3); // без второго refresh
    expect(localStorage.getItem('admin_token')).toBeNull();
    expect(localStorage.getItem('admin_refresh_token')).toBeNull();
    expect(window.location.assign).toHaveBeenCalledWith(
      '/admin/login?returnTo=' + encodeURIComponent('/admin/coaches')
    );

    vi.unstubAllGlobals();
  });
});

describe('@US1-EC-2', () => {
  it('сетевая ошибка при refresh не трогает сессию и не редиректит', async () => {
    localStorage.setItem('admin_token', 'old-access');
    localStorage.setItem('admin_refresh_token', 'valid-refresh');

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(401, null)) // исходный
      .mockRejectedValueOnce(new Error('network down')); // refresh падает сетевой ошибкой
    vi.stubGlobal('fetch', fetchMock);

    const res = await adminFetch('/api/admin/coaches');

    expect(res.ok).toBe(false);
    expect(localStorage.getItem('admin_token')).toBe('old-access');
    expect(localStorage.getItem('admin_refresh_token')).toBe('valid-refresh');
    expect(window.location.assign).not.toHaveBeenCalled();

    vi.unstubAllGlobals();
  });
});

describe('@US1-EC-4', () => {
  it('saveSession пишет новую пару в общее хранилище — доступна как из другой вкладки', () => {
    saveSession({
      accessToken: 'shared-access',
      refreshToken: 'shared-refresh',
    } as never);

    expect(getAccessToken()).toBe('shared-access');
    expect(getRefreshToken()).toBe('shared-refresh');
    expect(localStorage.getItem('admin_token')).toBe('shared-access');
    expect(localStorage.getItem('admin_refresh_token')).toBe('shared-refresh');
  });
});

describe('@US2-TS-3', () => {
  it('отклонённый refresh (401/403/400) очищает сессию и редиректит с returnTo текущего пути', async () => {
    localStorage.setItem('admin_token', 'old-access');
    localStorage.setItem('admin_refresh_token', 'invalid-refresh');
    setPathname('/admin/news');

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(401, null)) // исходный
      .mockResolvedValueOnce(jsonResponse(403, null)); // refresh отклонён
    vi.stubGlobal('fetch', fetchMock);

    await adminFetch('/api/admin/news');

    expect(localStorage.getItem('admin_token')).toBeNull();
    expect(localStorage.getItem('admin_refresh_token')).toBeNull();
    expect(window.location.assign).toHaveBeenCalledWith(
      '/admin/login?returnTo=' + encodeURIComponent('/admin/news')
    );

    vi.unstubAllGlobals();
  });
});

describe('@US2-AS-5', () => {
  it('clearSession удаляет оба ключа сессии', () => {
    localStorage.setItem('admin_token', 'a');
    localStorage.setItem('admin_refresh_token', 'r');

    clearSession();

    expect(localStorage.getItem('admin_token')).toBeNull();
    expect(localStorage.getItem('admin_refresh_token')).toBeNull();
  });
});

describe('@US2-EC-3 @US2-EC-3b @US2-AS-4 @US2-TS-4', () => {
  it('sanitizeReturnTo принимает только пути с префиксом /admin, иначе — обзорная /admin', () => {
    expect(sanitizeReturnTo('/admin/news')).toBe('/admin/news');
    expect(sanitizeReturnTo('/pricing')).toBe('/admin');
    expect(sanitizeReturnTo('https://evil.example')).toBe('/admin');
    expect(sanitizeReturnTo(null)).toBe('/admin');
  });
});
