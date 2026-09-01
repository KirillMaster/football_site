import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';

vi.mock('@/lib/api', () => ({ submitContactMessage: vi.fn() }));
vi.mock('@/lib/analytics', () => ({ reachGoal: vi.fn() }));

import ContactForm from './ContactForm';
import { submitContactMessage } from '@/lib/api';
import { reachGoal } from '@/lib/analytics';

function fillValid() {
  fireEvent.input(screen.getByLabelText(/Имя/), { target: { value: 'Мария' } });
  fireEvent.input(screen.getByLabelText(/Телефон/), { target: { value: '+79780000000' } });
  fireEvent.input(screen.getByLabelText(/Сообщение/), {
    target: { value: 'Интересует направление PRO для ребёнка.' },
  });
}

const submitBtn = () => screen.getByRole('button', { name: /Отправить сообщение/ });

const submitCalls = () =>
  vi.mocked(reachGoal).mock.calls.filter((c) => c[0] === 'other_lead_submit');

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

describe('@US5-AS1', () => {
  it('успешная отправка → reachGoal other_lead_submit с leadId и экран успеха', async () => {
    vi.mocked(submitContactMessage).mockResolvedValue('LEAD-1');
    render(<ContactForm />);
    fillValid();
    fireEvent.click(submitBtn());

    await waitFor(() => expect(screen.getByText(/Сообщение отправлено/)).toBeInTheDocument());
    expect(submitCalls()).toHaveLength(1);
    expect(reachGoal).toHaveBeenCalledWith('other_lead_submit', { leadId: 'LEAD-1' });
  });

  it('ошибка сервера (null leadId) → НЕ вызывает reachGoal и НЕ показывает успех', async () => {
    vi.mocked(submitContactMessage).mockResolvedValue(null);
    render(<ContactForm />);
    fillValid();
    fireEvent.click(submitBtn());

    await waitFor(() => expect(screen.getByText(/Ошибка отправки/)).toBeInTheDocument());
    expect(reachGoal).not.toHaveBeenCalledWith('other_lead_submit', expect.anything());
    expect(screen.queryByText(/Сообщение отправлено/)).toBeNull();
  });
});
