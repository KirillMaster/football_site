import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';

vi.mock('@/lib/analytics', () => ({ reachGoal: vi.fn() }));

import PhoneLink from './PhoneLink';
import { reachGoal } from '@/lib/analytics';

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('@US4-AS1', () => {
  it.each([
    ['header'],
    ['contacts'],
    ['footer'],
    ['other'],
  ] as const)('клик по телефону в месте "%s" вызывает reachGoal phone_click с этим place', (place) => {
    render(<PhoneLink phone="+7-978-813-09-82" place={place} />);
    fireEvent.click(screen.getByRole('link'));
    expect(reachGoal).toHaveBeenCalledTimes(1);
    expect(reachGoal).toHaveBeenCalledWith('phone_click', { place });
  });

  it('нормализует href в tel: без разделителей', () => {
    render(<PhoneLink phone="+7-978-813-09-82" place="header" />);
    expect(screen.getByRole('link')).toHaveAttribute('href', 'tel:+79788130982');
  });
});
