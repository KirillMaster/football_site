import { describe, it, expect, beforeEach, vi } from 'vitest';
import { reachGoal, getYmClientId } from './analytics';

describe('@US1-EC1', () => {
  beforeEach(() => {
    delete window.ym;
    vi.stubGlobal('fetch', vi.fn());
  });

  it('reachGoal с недоступным window.ym не выбрасывает исключение и не делает сетевых вызовов', () => {
    expect(() => reachGoal('phone_click', { place: 'footer' })).not.toThrow();
    expect(reachGoal('phone_click', { place: 'footer' })).toEqual({ outcome: 'counter_unavailable' });
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe('@US3-EC4', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('getYmClientId с неготовым window.ym резолвится пустой строкой немедленно, без таймаута', async () => {
    delete window.ym;

    // Без счётчика/window.ym не должно быть задержки на GET_CLIENT_ID_TIMEOUT_MS
    // (иначе каждая отправка заявки на проде ждёт 1с до fetch).
    await expect(getYmClientId()).resolves.toBe('');
    vi.useRealTimers();
  });

  it('getYmClientId с window.ym, который не вызывает callback, резолвится пустой строкой по таймауту', async () => {
    vi.stubEnv('NEXT_PUBLIC_YM_ID', '99999999');
    window.ym = vi.fn();

    const promise = getYmClientId();
    await vi.runAllTimersAsync();
    await expect(promise).resolves.toBe('');
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });
});
