import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../adminAuth', () => ({
  adminFetch: vi.fn(),
}));

import { uploadAdminNewsMedia } from '../api';
import { adminFetch } from '../adminAuth';

function file(name = 'photo.jpg', type = 'image/jpeg') {
  return new File(['x'], name, { type });
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('@US2 @EC-1', () => {
  it('при отклонении файла сервером (400, слишком большой) возвращает status=rejected с русским текстом ошибки', async () => {
    vi.mocked(adminFetch).mockResolvedValue({
      ok: false,
      status: 400,
      json: () =>
        Promise.resolve({ message: 'Файл слишком большой. Максимальный размер — 20 МБ' }),
    } as unknown as Response);

    const result = await uploadAdminNewsMedia(file());

    expect(result).toEqual({
      status: 'rejected',
      message: 'Файл слишком большой. Максимальный размер — 20 МБ',
    });
  });

  it('успешная загрузка возвращает status=uploaded с url/key/mediaType из ответа', async () => {
    vi.mocked(adminFetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({ url: '/media/photo.jpg', key: 'k1', mediaType: 'image' }),
    } as unknown as Response);

    const result = await uploadAdminNewsMedia(file());

    expect(result).toEqual({
      status: 'uploaded',
      url: '/media/photo.jpg',
      key: 'k1',
      mediaType: 'image',
    });
  });
});

describe('@US2 @EC-2', () => {
  it('при сетевом сбое (fetch throw) возвращает status=network_error, не бросает исключение', async () => {
    vi.mocked(adminFetch).mockRejectedValue(new Error('network down'));

    const result = await uploadAdminNewsMedia(file());

    expect(result).toEqual({ status: 'network_error' });
  });

  it('при истёкшей сессии (401/403 после adminFetch retry) возвращает status=unauthorized', async () => {
    vi.mocked(adminFetch).mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve({}),
    } as unknown as Response);

    const result = await uploadAdminNewsMedia(file());

    expect(result).toEqual({ status: 'unauthorized' });
  });
});
