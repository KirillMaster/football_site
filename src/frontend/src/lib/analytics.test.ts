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

  it('getYmClientId с неготовым window.ym резолвится пустой строкой по таймауту', async () => {
    delete window.ym;

    const promise = getYmClientId();
    await vi.runAllTimersAsync();
    await expect(promise).resolves.toBe('');
    vi.useRealTimers();
  });

  it('getYmClientId с window.ym, который не вызывает callback, резолвится пустой строкой по таймауту', async () => {
    window.ym = vi.fn();

    const promise = getYmClientId();
    await vi.runAllTimersAsync();
    await expect(promise).resolves.toBe('');
    vi.useRealTimers();
  });
});
