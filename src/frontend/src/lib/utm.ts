// Клиентское хранилище UTM-меток первого касания (модель "first-touch").
// Контракт get_utm_first_touch (specs/001-yandex-metrika-analytics/contracts.yaml):
//   найдена cookie utm_ft -> outcome 'found'; иначе 'empty'.
// Cookie не перезаписывается, если уже установлена (first-touch не перетирается).

const COOKIE_NAME = 'utm_ft';
const COOKIE_MAX_AGE_DAYS = 90;

export type StoredUtm = {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
};

function readCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));
  if (!match) return undefined;
  return match.slice(name.length + 1);
}

function parseUtmCookie(raw: string): StoredUtm {
  try {
    const decoded = decodeURIComponent(raw);
    const parsed = JSON.parse(decoded);
    if (parsed && typeof parsed === 'object') {
      return parsed as StoredUtm;
    }
  } catch {
    // повреждённая cookie — игнорируем, как будто её нет
  }
  return {};
}

function readUtmFromQuery(): StoredUtm {
  if (typeof window === 'undefined' || !window.location?.search) return {};
  const params = new URLSearchParams(window.location.search);
  const utm: StoredUtm = {
    utmSource: params.get('utm_source') ?? undefined,
    utmMedium: params.get('utm_medium') ?? undefined,
    utmCampaign: params.get('utm_campaign') ?? undefined,
    utmContent: params.get('utm_content') ?? undefined,
    utmTerm: params.get('utm_term') ?? undefined,
  };
  return Object.fromEntries(Object.entries(utm).filter(([, v]) => v !== undefined));
}

function writeCookie(utm: StoredUtm): void {
  if (typeof document === 'undefined') return;
  const value = encodeURIComponent(JSON.stringify(utm));
  const maxAgeSeconds = COOKIE_MAX_AGE_DAYS * 24 * 60 * 60;
  document.cookie = `${COOKIE_NAME}=${value}; path=/; max-age=${maxAgeSeconds}`;
}

export function getStoredUtm(): StoredUtm {
  const raw = readCookie(COOKIE_NAME);
  if (raw !== undefined) {
    // Cookie первого касания уже есть — она не перетирается повторным визитом.
    return parseUtmCookie(raw);
  }

  const fromQuery = readUtmFromQuery();
  if (Object.keys(fromQuery).length > 0) {
    writeCookie(fromQuery);
    return fromQuery;
  }

  return {};
}
