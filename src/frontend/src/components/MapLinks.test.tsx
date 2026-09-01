import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';

vi.mock('@/lib/analytics', () => ({ reachGoal: vi.fn() }));

import MapLinks from './MapLinks';
import { reachGoal } from '@/lib/analytics';

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const ADDRESS = 'ул. Косарева, д.12, Спорткомплекс школы №61';

describe('@US4-AS2', () => {
  it('рендерит кнопки Яндекс.Карт и 2ГИС, открывающиеся в новой вкладке', () => {
    render(<MapLinks address={ADDRESS} />);
    const yandex = screen.getByRole('link', { name: /Яндекс/ });
    const gis = screen.getByRole('link', { name: /2ГИС/ });
    expect(yandex).toHaveAttribute('target', '_blank');
    expect(gis).toHaveAttribute('target', '_blank');
    expect(yandex).toHaveAttribute('href', expect.stringContaining('yandex.ru/maps'));
    expect(gis).toHaveAttribute('href', expect.stringContaining('2gis.ru'));
  });

  it('клик по Яндекс.Картам вызывает map_click с service=yandex', () => {
    render(<MapLinks address={ADDRESS} />);
    fireEvent.click(screen.getByRole('link', { name: /Яндекс/ }));
    expect(reachGoal).toHaveBeenCalledWith('map_click', { service: 'yandex' });
  });

  it('клик по 2ГИС вызывает map_click с service=2gis', () => {
    render(<MapLinks address={ADDRESS} />);
    fireEvent.click(screen.getByRole('link', { name: /2ГИС/ }));
    expect(reachGoal).toHaveBeenCalledWith('map_click', { service: '2gis' });
  });
});
