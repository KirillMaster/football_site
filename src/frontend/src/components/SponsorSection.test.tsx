import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';

vi.mock('@/lib/api', () => ({ submitContactMessage: vi.fn() }));
vi.mock('@/lib/analytics', () => ({ reachGoal: vi.fn() }));

import SponsorSection from './SponsorSection';
import { submitContactMessage } from '@/lib/api';
import { reachGoal } from '@/lib/analytics';

const sponsorBtn = () =>
  screen.getByRole('button', { name: /Стать генеральным спонсором/ });

function openModalAndFill() {
  fireEvent.click(sponsorBtn());
  fireEvent.input(screen.getByPlaceholderText(/Иванов Иван Иванович/), { target: { value: 'Иван' } });
  fireEvent.input(screen.getByPlaceholderText(/\+7 \(999\)/), { target: { value: '+79780000000' } });
}

const submitModalBtn = () => screen.getByRole('button', { name: /Оставить заявку/ });

const sponsorSubmitCalls = () =>
  vi.mocked(reachGoal).mock.calls.filter((c) => c[0] === 'sponsor_form_submit');

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

describe('@US5-AS2', () => {
  it('клик по кнопке спонсорства → reachGoal sponsor_click и открытие модалки', () => {
    render(<SponsorSection />);
    fireEvent.click(sponsorBtn());

    expect(reachGoal).toHaveBeenCalledWith('sponsor_click');
    expect(screen.getByPlaceholderText(/ООО «Название»/)).toBeInTheDocument();
  });
});

describe('@US5-AS3', () => {
  it('ошибка сервера (null leadId) → нет экрана успеха и НЕ вызывается sponsor_form_submit', async () => {
    vi.mocked(submitContactMessage).mockResolvedValue(null);
    render(<SponsorSection />);
    openModalAndFill();
    fireEvent.click(submitModalBtn());

    await waitFor(() => expect(submitContactMessage).toHaveBeenCalled());
    expect(sponsorSubmitCalls()).toHaveLength(0);
    expect(screen.queryByText(/Спасибо за интерес/)).toBeNull();
  });
});

describe('@US5-AS3b', () => {
  it('успешная отправка → экран успеха и reachGoal sponsor_form_submit с leadId', async () => {
    vi.mocked(submitContactMessage).mockResolvedValue('LEAD-9');
    render(<SponsorSection />);
    openModalAndFill();
    fireEvent.click(submitModalBtn());

    await waitFor(() => expect(screen.getByText(/Спасибо за интерес/)).toBeInTheDocument());
    expect(sponsorSubmitCalls()).toHaveLength(1);
    expect(reachGoal).toHaveBeenCalledWith('sponsor_form_submit', { leadId: 'LEAD-9' });
  });
});
