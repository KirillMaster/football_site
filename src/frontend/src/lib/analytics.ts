// Клиентская обёртка над window.ym (Яндекс.Метрика).
// Контракт reach_goal (specs/001-yandex-metrika-analytics/contracts.yaml):
//   outcome: 'sent' | 'counter_unavailable'.

declare global {
  interface Window {
    ym?: (...args: unknown[]) => void;
  }
}

const GET_CLIENT_ID_TIMEOUT_MS = 1000;

function getYmId(): string | undefined {
  return process.env.NEXT_PUBLIC_YM_ID;
}

export type ReachGoalResult = { outcome: 'sent' | 'counter_unavailable' };

export function reachGoal(goal: string, params?: Record<string, unknown>): ReachGoalResult {
  const ymId = getYmId();
  if (!ymId || typeof window === 'undefined' || typeof window.ym !== 'function') {
    return { outcome: 'counter_unavailable' };
  }

  window.ym(ymId, 'reachGoal', goal, params);
  return { outcome: 'sent' };
}

export function getYmClientId(): Promise<string> {
  const timeout = new Promise<string>((resolve) => {
    setTimeout(() => resolve(''), GET_CLIENT_ID_TIMEOUT_MS);
  });

  const ymId = getYmId();
  if (typeof window === 'undefined' || typeof window.ym !== 'function') {
    return timeout;
  }

  const clientId = new Promise<string>((resolve) => {
    try {
      window.ym!(ymId, 'getClientID', (id: string) => resolve(id ?? ''));
    } catch {
      resolve('');
    }
  });

  return Promise.race([clientId, timeout]);
}
