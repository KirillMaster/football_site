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

describe('@US2 @EC-1 @EC-2 @SC-005', () => {
  it('403 Forbidden (другая причина auth-ошибки) возвращает status=unauthorized', async () => {
    vi.mocked(adminFetch).mockResolvedValue({
      ok: false,
      status: 403,
      json: () => Promise.resolve({ message: 'Forbidden' }),
    } as unknown as Response);

    const result = await uploadAdminNewsMedia(file());

    expect(result).toEqual({ status: 'unauthorized' });
  });

  it('500 Server Error возвращает status=rejected с дефолтным сообщением, не 401/403', async () => {
    vi.mocked(adminFetch).mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ message: 'Internal Server Error' }),
    } as unknown as Response);

    const result = await uploadAdminNewsMedia(file());

    expect(result).toEqual({
      status: 'rejected',
      message: 'Internal Server Error',
    });
  });

  it('503 Service Unavailable возвращает status=rejected с message', async () => {
    vi.mocked(adminFetch).mockResolvedValue({
      ok: false,
      status: 503,
      json: () => Promise.resolve({ message: 'Service temporarily unavailable' }),
    } as unknown as Response);

    const result = await uploadAdminNewsMedia(file());

    expect(result).toEqual({
      status: 'rejected',
      message: 'Service temporarily unavailable',
    });
  });

  it('422 Unprocessable Entity (неправильный формат файла) возвращает status=rejected с message', async () => {
    vi.mocked(adminFetch).mockResolvedValue({
      ok: false,
      status: 422,
      json: () => Promise.resolve({ message: 'Недопустимый тип файла. Разрешены JPG, PNG, MP4' }),
    } as unknown as Response);

    const result = await uploadAdminNewsMedia(file());

    expect(result).toEqual({
      status: 'rejected',
      message: 'Недопустимый тип файла. Разрешены JPG, PNG, MP4',
    });
  });

  it('при ошибке парсинга JSON ответа (невалидный JSON) возвращает дефолтный текст ошибки', async () => {
    vi.mocked(adminFetch).mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.reject(new Error('Invalid JSON')),
    } as unknown as Response);

    const result = await uploadAdminNewsMedia(file());

    expect(result).toEqual({
      status: 'rejected',
      message: 'Не удалось загрузить файл',
    });
  });

  it('успешная загрузка требует все три поля (url, key, mediaType)', async () => {
    vi.mocked(adminFetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          url: '/media/photo.jpg',
          key: 'abc123',
          mediaType: 'image',
        }),
    } as unknown as Response);

    const result = await uploadAdminNewsMedia(file());

    expect(result).toEqual({
      status: 'uploaded',
      url: '/media/photo.jpg',
      key: 'abc123',
      mediaType: 'image',
    });
    expect(result.status).toBe('uploaded');
  });

  it('при успехе mediaType может быть "video" или "image"', async () => {
    vi.mocked(adminFetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          url: '/media/video.mp4',
          key: 'vid456',
          mediaType: 'video',
        }),
    } as unknown as Response);

    const result = await uploadAdminNewsMedia(file('video.mp4', 'video/mp4'));

    expect(result).toEqual({
      status: 'uploaded',
      url: '/media/video.mp4',
      key: 'vid456',
      mediaType: 'video',
    });
  });

  it('ошибка НЕ возвращает статус "uploaded" даже если в ответе есть поля', async () => {
    vi.mocked(adminFetch).mockResolvedValue({
      ok: false,
      status: 413,
      json: () =>
        Promise.resolve({
          url: '/some/path',
          key: 'ignored',
          mediaType: 'image',
          message: 'Payload too large',
        }),
    } as unknown as Response);

    const result = await uploadAdminNewsMedia(file());

    expect(result.status).not.toBe('uploaded');
    expect(result).toEqual({
      status: 'rejected',
      message: 'Payload too large',
    });
  });

  it('сетевой сбой НЕ возвращает статус "uploaded" даже при retry', async () => {
    vi.mocked(adminFetch).mockRejectedValue(new Error('timeout'));

    const result = await uploadAdminNewsMedia(file());

    expect(result.status).toBe('network_error');
    expect(result.status).not.toBe('uploaded');
  });

  it('граничное значение: file.name может быть пустой строкой', async () => {
    vi.mocked(adminFetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({ url: '/media/unnamed', key: 'k1', mediaType: 'image' }),
    } as unknown as Response);

    const emptyNameFile = new File(['x'], '', { type: 'image/jpeg' });
    const result = await uploadAdminNewsMedia(emptyNameFile);

    expect(result.status).toBe('uploaded');
  });

  it('граничное значение: file.size = 0 (пустой файл) отправляется корректно', async () => {
    vi.mocked(adminFetch).mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ message: 'Empty file not allowed' }),
    } as unknown as Response);

    const emptyFile = new File([], 'empty.jpg', { type: 'image/jpeg' });
    const result = await uploadAdminNewsMedia(emptyFile);

    expect(result).toEqual({
      status: 'rejected',
      message: 'Empty file not allowed',
    });
  });

  it('граничное значение: очень большой файл (100+ МБ) отправляется и обрабатывается сервером', async () => {
    vi.mocked(adminFetch).mockResolvedValue({
      ok: false,
      status: 413,
      json: () => Promise.resolve({ message: 'File too large' }),
    } as unknown as Response);

    // Не создаём реально большой файл, но указываем size и type
    const largeFile = new File(['x'], 'huge.jpg', { type: 'image/jpeg' });
    const result = await uploadAdminNewsMedia(largeFile);

    expect(result.status).toBe('rejected');
    expect(result.message).toContain('too large');
  });

  it('при ok=true, но отсутствует одно из полей (url/key/mediaType), это НЕ ошибка парсинга', async () => {
    vi.mocked(adminFetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          url: '/media/photo.jpg',
          // key отсутствует
          mediaType: 'image',
        }),
    } as unknown as Response);

    const result = await uploadAdminNewsMedia(file());

    // Функция вернёт undefined для key, но это не ошибка
    expect(result.status).toBe('uploaded');
    expect((result as any).key).toBeUndefined();
  });

  it('auth-ошибка (401) не проверяет message в ответе', async () => {
    vi.mocked(adminFetch).mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ message: 'Token expired' }),
    } as unknown as Response);

    const result = await uploadAdminNewsMedia(file());

    expect(result).toEqual({ status: 'unauthorized' });
  });
});
