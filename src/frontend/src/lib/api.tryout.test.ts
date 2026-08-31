import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./utm', () => ({
  getStoredUtm: vi.fn(() => ({})),
}));
vi.mock('./analytics', () => ({
  getYmClientId: vi.fn(() => Promise.resolve('')),
}));

import { submitTryoutRequest } from './api';
import { getStoredUtm } from './utm';
import { getYmClientId } from './analytics';

const validData = {
  childName: 'Иван',
  age: 10,
  parentName: 'Мария',
  phone: '+79780000000',
  email: '',
  message: '',
};

function okResponse(id: string) {
  return { ok: true, json: () => Promise.resolve({ id, message: 'Tryout request received' }) };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getStoredUtm).mockReturnValue({});
  vi.mocked(getYmClientId).mockResolvedValue('');
  global.fetch = vi.fn();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('@US1-AS1', () => {
  it('возвращает leadId (GUID из тела ответа) при успешном создании', async () => {
    const guid = '11111111-1111-1111-1111-111111111111';
    vi.mocked(global.fetch).mockResolvedValue(okResponse(guid) as unknown as Response);

    const leadId = await submitTryoutRequest(validData);

    expect(leadId).toBe(guid);
  });

  it('возвращает null при server_error (res.ok=false), reachGoal-триггер не появляется', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'server_error' }),
    } as unknown as Response);

    expect(await submitTryoutRequest(validData)).toBeNull();
  });

  it('возвращает null при сетевом сбое (throw)', async () => {
    vi.mocked(global.fetch).mockRejectedValue(new Error('network'));

    expect(await submitTryoutRequest(validData)).toBeNull();
  });
});

describe('@US1-AS1b', () => {
  it('пробрасывает UTM первого касания и ymClientId в тело POST /api/tryout', async () => {
    vi.mocked(getStoredUtm).mockReturnValue({ utmSource: 'test', utmMedium: 'cpc' });
    vi.mocked(getYmClientId).mockResolvedValue('1234567890');
    vi.mocked(global.fetch).mockResolvedValue(okResponse('guid') as unknown as Response);

    await submitTryoutRequest(validData);

    const init = vi.mocked(global.fetch).mock.calls[0][1] as RequestInit;
    const body = JSON.parse(init.body as string);
    expect(body.utmSource).toBe('test');
    expect(body.utmMedium).toBe('cpc');
    expect(body.ymClientId).toBe('1234567890');
    expect(body.childName).toBe('Иван');
    expect(body.childAge).toBe(10);
  });
});
