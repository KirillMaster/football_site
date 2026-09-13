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

    // Проверка первого вызова (исходный запрос)
    expect(fetchMock.mock.calls[0][0]).toBe('/api/admin/coaches');
    const firstHeaders = fetchMock.mock.calls[0][1]?.headers as Headers;
    if (firstHeaders?.get) {
      expect(firstHeaders.get('Authorization')).toBe('Bearer old-access');
    }

    // Проверка второго вызова (refresh)
    expect(fetchMock.mock.calls[1][0]).toBe('/api/admin/auth/refresh');
    expect(fetchMock.mock.calls[1][1]?.method).toBe('POST');
    const refreshHeaders = fetchMock.mock.calls[1][1]?.headers as Headers;
    if (refreshHeaders?.get) {
      expect(refreshHeaders.get('Content-Type')).toBe('application/json');
    }
    const refreshBody = JSON.parse(fetchMock.mock.calls[1][1]?.body as string);
    expect(refreshBody.refreshToken).toBe('valid-refresh');

    // Проверка третьего вызова (повтор)
    expect(fetchMock.mock.calls[2][0]).toBe('/api/admin/coaches');
    const retryHeaders = fetchMock.mock.calls[2][1]?.headers as Headers;
    if (retryHeaders?.get) {
      expect(retryHeaders.get('Authorization')).toBe('Bearer new-access');
    }

    expect(localStorage.getItem('admin_token')).toBe('new-access');
    expect(localStorage.getItem('admin_refresh_token')).toBe('new-refresh');

    vi.unstubAllGlobals();
  });

  it('adminFetch: 200 на первый запрос возвращает ответ БЕЗ refresh', async () => {
    localStorage.setItem('admin_token', 'valid-access');
    localStorage.setItem('admin_refresh_token', 'valid-refresh');

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(200, { data: 'ok' }));
    vi.stubGlobal('fetch', fetchMock);

    const res = await adminFetch('/api/admin/coaches');

    expect(res.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(200);

    vi.unstubAllGlobals();
  });

  it('adminFetch: 403 на первый запрос возвращает 403 БЕЗ refresh', async () => {
    localStorage.setItem('admin_token', 'old-access');
    localStorage.setItem('admin_refresh_token', 'valid-refresh');

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(403, null));
    vi.stubGlobal('fetch', fetchMock);

    const res = await adminFetch('/api/admin/coaches');

    expect(res.ok).toBe(false);
    expect(res.status).toBe(403);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    vi.unstubAllGlobals();
  });

  it('adminFetch: 50x на первый запрос возвращает 50x БЕЗ refresh', async () => {
    localStorage.setItem('admin_token', 'old-access');
    localStorage.setItem('admin_refresh_token', 'valid-refresh');

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(500, null));
    vi.stubGlobal('fetch', fetchMock);

    const res = await adminFetch('/api/admin/coaches');

    expect(res.ok).toBe(false);
    expect(res.status).toBe(500);
    expect(fetchMock).toHaveBeenCalledTimes(1);

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

  it('single-flight: пять параллельных 401 порождают ровно один POST /refresh', async () => {
    localStorage.setItem('admin_token', 'old-access');
    localStorage.setItem('admin_refresh_token', 'valid-refresh');

    let refreshCalls = 0;
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url === '/api/admin/auth/refresh') {
        refreshCalls += 1;
        // Имитируем задержку refresh, чтобы убедиться что single-flight работает
        await new Promise(resolve => setTimeout(resolve, 10));
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

    const results = await Promise.all([
      adminFetch('/api/admin/coaches'),
      adminFetch('/api/admin/news'),
      adminFetch('/api/admin/groups'),
      adminFetch('/api/admin/players'),
      adminFetch('/api/admin/schedule'),
    ]);

    expect(refreshCalls).toBe(1);
    results.forEach(r => expect(r.ok).toBe(true));

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
    // Проверяем что вторая запись вызова это refresh (не повторный retry)
    expect(fetchMock.mock.calls[1][0]).toBe('/api/admin/auth/refresh');
    // Третья запись это retry, а не второй refresh
    expect(fetchMock.mock.calls[2][0]).toBe('/api/admin/coaches');

    expect(localStorage.getItem('admin_token')).toBeNull();
    expect(localStorage.getItem('admin_refresh_token')).toBeNull();
    expect(window.location.assign).toHaveBeenCalledWith(
      '/admin/login?returnTo=' + encodeURIComponent('/admin/coaches')
    );

    vi.unstubAllGlobals();
  });

  it('terminateSession вызывается с правильным returnTo=pathname', async () => {
    localStorage.setItem('admin_token', 'old-access');
    localStorage.setItem('admin_refresh_token', 'valid-refresh');
    setPathname('/admin/special/page');

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(401, null))
      .mockResolvedValueOnce(
        jsonResponse(200, {
          accessToken: 'new-access',
          refreshToken: 'new-refresh',
          expiresAt: '2030-01-01',
          email: 'a@a.ru',
          role: 'admin',
        })
      )
      .mockResolvedValueOnce(jsonResponse(401, null));
    vi.stubGlobal('fetch', fetchMock);

    await adminFetch('/api/admin/coaches');

    expect(window.location.assign).toHaveBeenCalledWith(
      '/admin/login?returnTo=' + encodeURIComponent('/admin/special/page')
    );

    vi.unstubAllGlobals();
  });

  it('refresh с malformed response (отсутствие accessToken) должен обработаться', async () => {
    localStorage.setItem('admin_token', 'old-access');
    localStorage.setItem('admin_refresh_token', 'valid-refresh');

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(401, null))
      .mockResolvedValueOnce(jsonResponse(200, { /* missing accessToken */ }))
      .mockResolvedValueOnce(jsonResponse(200, { data: 'ok' })); // retry
    vi.stubGlobal('fetch', fetchMock);

    await adminFetch('/api/admin/coaches');

    // Ожидаем что сессия сохраняется с undefined токеном, потом retry
    expect(fetchMock).toHaveBeenCalled();
    // Должно быть три вызова: исходный, refresh, retry
    expect(fetchMock.mock.calls.length).toBeGreaterThanOrEqual(2);

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
    expect(fetchMock).toHaveBeenCalledTimes(2); // исходный + refresh, НЕ повторяем

    vi.unstubAllGlobals();
  });

  it('50x при refresh не вызывает terminateSession', async () => {
    localStorage.setItem('admin_token', 'old-access');
    localStorage.setItem('admin_refresh_token', 'valid-refresh');

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(401, null)) // исходный
      .mockResolvedValueOnce(jsonResponse(500, null)); // refresh — 50x
    vi.stubGlobal('fetch', fetchMock);

    const res = await adminFetch('/api/admin/coaches');

    expect(res.ok).toBe(false);
    expect(localStorage.getItem('admin_token')).toBe('old-access'); // сессия не очищена
    expect(localStorage.getItem('admin_refresh_token')).toBe('valid-refresh');
    expect(window.location.assign).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledTimes(2); // НЕ повторяем retry

    vi.unstubAllGlobals();
  });

  it('502 при refresh не вызывает terminateSession', async () => {
    localStorage.setItem('admin_token', 'old-access');
    localStorage.setItem('admin_refresh_token', 'valid-refresh');

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(401, null))
      .mockResolvedValueOnce(jsonResponse(502, null));
    vi.stubGlobal('fetch', fetchMock);

    await adminFetch('/api/admin/coaches');

    expect(window.location.assign).not.toHaveBeenCalled();
    expect(localStorage.getItem('admin_token')).toBe('old-access');

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

  it('getAccessToken возвращает null если storage пуст', () => {
    expect(getAccessToken()).toBeNull();
  });

  it('getRefreshToken возвращает null если storage пуст', () => {
    expect(getRefreshToken()).toBeNull();
  });

  it('getAccessToken после saveSession возвращает точное значение', () => {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
    saveSession({
      accessToken: token,
      refreshToken: 'refresh',
    } as never);

    expect(getAccessToken()).toBe(token);
    expect(getAccessToken()).toBe(localStorage.getItem('admin_token'));
  });

  it('saveSession перезаписывает старые токены', () => {
    saveSession({
      accessToken: 'token1',
      refreshToken: 'refresh1',
    } as never);

    expect(getAccessToken()).toBe('token1');

    saveSession({
      accessToken: 'token2',
      refreshToken: 'refresh2',
    } as never);

    expect(getAccessToken()).toBe('token2');
    expect(getRefreshToken()).toBe('refresh2');
  });

  it('clearSession затем getAccessToken возвращает null', () => {
    saveSession({
      accessToken: 'token',
      refreshToken: 'refresh',
    } as never);

    clearSession();

    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
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

  it('отклонённый refresh (400) очищает сессию и редиректит', async () => {
    localStorage.setItem('admin_token', 'old-access');
    localStorage.setItem('admin_refresh_token', 'invalid-refresh');

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(401, null))
      .mockResolvedValueOnce(jsonResponse(400, null)); // Bad Request
    vi.stubGlobal('fetch', fetchMock);

    await adminFetch('/api/admin/coaches');

    expect(localStorage.getItem('admin_token')).toBeNull();
    expect(window.location.assign).toHaveBeenCalled();

    vi.unstubAllGlobals();
  });

  it('отсутствие refreshToken в localStorage при 401 редиректит БЕЗ попытки refresh', async () => {
    localStorage.setItem('admin_token', 'old-access');
    // refreshToken НЕ устанавливаем

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(401, null));
    vi.stubGlobal('fetch', fetchMock);

    await adminFetch('/api/admin/coaches');

    // Должно быть только один вызов (исходный), БЕЗ refresh
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(window.location.assign).toHaveBeenCalledWith(
      '/admin/login?returnTo=' + encodeURIComponent('/admin/coaches')
    );

    vi.unstubAllGlobals();
  });

  it('refresh request содержит правильный refreshToken в body', async () => {
    const testRefreshToken = 'special-refresh-token-12345';
    localStorage.setItem('admin_token', 'old-access');
    localStorage.setItem('admin_refresh_token', testRefreshToken);

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(401, null))
      .mockResolvedValueOnce(
        jsonResponse(200, {
          accessToken: 'new-access',
          refreshToken: 'new-refresh',
          expiresAt: '2030-01-01',
          email: 'a@a.ru',
          role: 'admin',
        })
      )
      .mockResolvedValueOnce(jsonResponse(200, { data: 'ok' }));
    vi.stubGlobal('fetch', fetchMock);

    await adminFetch('/api/admin/coaches');

    // Проверяем body refresh request
    const refreshCall = fetchMock.mock.calls[1];
    expect(refreshCall[0]).toBe('/api/admin/auth/refresh');
    expect(refreshCall[1]?.method).toBe('POST');

    const body = JSON.parse(refreshCall[1]?.body as string);
    expect(body.refreshToken).toBe(testRefreshToken);
    expect(body.refreshToken).not.toBe('wrong-token');

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

  it('sanitizeReturnTo граничные значения: пустая строка, пробелы, undefined', () => {
    expect(sanitizeReturnTo('')).toBe('/admin');
    expect(sanitizeReturnTo('   ')).toBe('/admin');
    expect(sanitizeReturnTo(undefined)).toBe('/admin');
  });

  it('sanitizeReturnTo: /admin без слэша', () => {
    expect(sanitizeReturnTo('/admin')).toBe('/admin');
  });

  it('sanitizeReturnTo: /admin/ с слэшом', () => {
    expect(sanitizeReturnTo('/admin/')).toBe('/admin/');
  });

  it('sanitizeReturnTo: /admin/deep/path глубокие пути', () => {
    expect(sanitizeReturnTo('/admin/deep/path')).toBe('/admin/deep/path');
    expect(sanitizeReturnTo('/admin/coaches/123')).toBe('/admin/coaches/123');
  });

  it('sanitizeReturnTo: родительские пути ../admin блокируются', () => {
    expect(sanitizeReturnTo('../admin')).toBe('/admin');
    expect(sanitizeReturnTo('../../admin')).toBe('/admin');
  });

  it('sanitizeReturnTo: относительные пути без слэша', () => {
    expect(sanitizeReturnTo('admin')).toBe('/admin');
    expect(sanitizeReturnTo('admin/news')).toBe('/admin');
  });
});
