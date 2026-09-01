import { StrictMode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';

vi.mock('@/lib/api', () => ({ submitTryoutRequest: vi.fn() }));
vi.mock('@/lib/analytics', () => ({ reachGoal: vi.fn() }));

import TryoutForm from './TryoutForm';
import { submitTryoutRequest } from '@/lib/api';
import { reachGoal } from '@/lib/analytics';

function fillValid() {
  fireEvent.input(screen.getByLabelText(/Имя ребёнка/), { target: { value: 'Иван' } });
  fireEvent.input(screen.getByLabelText(/Возраст/), { target: { value: '10' } });
  fireEvent.input(screen.getByLabelText(/Ваше имя/), { target: { value: 'Мария' } });
  fireEvent.input(screen.getByLabelText(/Телефон/), { target: { value: '+79780000000' } });
}

const submitBtn = () => screen.getByRole('button', { name: /Записаться/ });

const submitCalls = () =>
  vi.mocked(reachGoal).mock.calls.filter((c) => c[0] === 'trial_form_submit');

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

describe('@US1-AS1', () => {
  it('вызывает reachGoal trial_form_submit один раз с leadId и показывает экран успеха', async () => {
    vi.mocked(submitTryoutRequest).mockResolvedValue('LEAD-1');
    render(<TryoutForm />);
    fillValid();
    fireEvent.click(submitBtn());

    await waitFor(() => expect(screen.getByText(/Заявка отправлена/)).toBeInTheDocument());
    expect(submitCalls()).toHaveLength(1);
    expect(reachGoal).toHaveBeenCalledWith('trial_form_submit', { leadId: 'LEAD-1' });
  });
});

describe('@US1-AS2', () => {
  it('НЕ вызывает reachGoal и НЕ показывает успех при ошибке сервера', async () => {
    vi.mocked(submitTryoutRequest).mockResolvedValue(null);
    render(<TryoutForm />);
    fillValid();
    fireEvent.click(submitBtn());

    await waitFor(() => expect(screen.getByText(/Произошла ошибка/)).toBeInTheDocument());
    expect(reachGoal).not.toHaveBeenCalledWith('trial_form_submit', expect.anything());
    expect(screen.queryByText(/Заявка отправлена/)).toBeNull();
  });

  it('НЕ отправляет запрос и НЕ вызывает reachGoal при validation_error (невалидная форма)', async () => {
    render(<TryoutForm />);
    // возраст ниже минимума + пустые обязательные поля → zod-валидация блокирует submit
    fireEvent.input(screen.getByLabelText(/Возраст/), { target: { value: '2' } });
    fireEvent.click(submitBtn());

    await waitFor(() => expect(screen.getByText(/Минимальный возраст/)).toBeInTheDocument());
    expect(submitTryoutRequest).not.toHaveBeenCalled();
    expect(reachGoal).not.toHaveBeenCalledWith('trial_form_submit', expect.anything());
    expect(screen.queryByText(/Заявка отправлена/)).toBeNull();
  });
});

describe('@US1-EC2', () => {
  it('две успешные отправки → reachGoal дважды с разными leadId', async () => {
    vi.mocked(submitTryoutRequest).mockResolvedValueOnce('LEAD-1').mockResolvedValueOnce('LEAD-2');
    render(<TryoutForm />);

    fillValid();
    fireEvent.click(submitBtn());
    await waitFor(() => expect(screen.getByText(/Заявка отправлена/)).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /Отправить ещё одну/ }));
    fillValid();
    fireEvent.click(submitBtn());
    await waitFor(() => expect(screen.getByText(/Заявка отправлена/)).toBeInTheDocument());

    const submits = submitCalls();
    expect(submits).toHaveLength(2);
    expect(submits[0]).toEqual(['trial_form_submit', { leadId: 'LEAD-1' }]);
    expect(submits[1]).toEqual(['trial_form_submit', { leadId: 'LEAD-2' }]);
  });
});

describe('@US1-EC5', () => {
  it('двойной быстрый клик → submitTryoutRequest вызван один раз (форма блокирует in-flight)', async () => {
    let resolveFn: (v: string) => void = () => {};
    vi.mocked(submitTryoutRequest).mockReturnValue(
      new Promise<string>((r) => {
        resolveFn = r;
      })
    );
    render(<TryoutForm />);
    fillValid();

    const btn = submitBtn();
    fireEvent.click(btn);
    await waitFor(() => expect(btn).toBeDisabled());
    fireEvent.click(btn);

    expect(submitTryoutRequest).toHaveBeenCalledTimes(1);
    resolveFn('LEAD-1');
    await waitFor(() => expect(screen.getByText(/Заявка отправлена/)).toBeInTheDocument());
    expect(submitCalls()).toHaveLength(1);
  });
});

describe('@US4-AS3', () => {
  it('показ формы пробной вызывает reachGoal trial_form_open ровно один раз (без дублей в StrictMode)', async () => {
    render(
      <StrictMode>
        <TryoutForm />
      </StrictMode>
    );
    await waitFor(() => expect(screen.getByLabelText(/Имя ребёнка/)).toBeInTheDocument());
    const opens = vi.mocked(reachGoal).mock.calls.filter((c) => c[0] === 'trial_form_open');
    expect(opens).toHaveLength(1);
  });
});
