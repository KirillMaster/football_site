import { describe, it, expect, beforeEach } from 'vitest';
import { getStoredUtm } from './utm';

function setCookie(value: string) {
  document.cookie = `utm_ft=${value}; path=/`;
}

function clearCookies() {
  document.cookie.split(';').forEach((c) => {
    const name = c.split('=')[0].trim();
    if (name) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    }
  });
}

describe('@US3-AS1b', () => {
  beforeEach(() => {
    clearCookies();
  });

  it('cookie utm_ft с utmSource=A не перетирается query-параметром utmSource=B', () => {
    setCookie(encodeURIComponent(JSON.stringify({ utmSource: 'A' })));
    window.history.replaceState(null, '', '/?utm_source=B');

    const result = getStoredUtm();

    expect(result.utmSource).toBe('A');
    expect(result.utmSource).not.toBe('B');
  });
});

describe('@US3-EC3', () => {
  beforeEach(() => {
    clearCookies();
  });

  it('без cookie и без query-параметров возвращает пустой объект без исключений', () => {
    window.history.replaceState(null, '', '/');

    let result: ReturnType<typeof getStoredUtm> | undefined;
    expect(() => {
      result = getStoredUtm();
    }).not.toThrow();

    expect(result).toEqual({});
  });
});
