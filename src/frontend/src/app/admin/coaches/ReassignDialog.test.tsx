import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { ReassignDialog } from './ReassignDialog';

afterEach(() => {
  cleanup();
});

const coach = { id: 'kiva', nameRu: 'Кива Евгений' };
const candidates = [
  { id: 'kuliev', nameRu: 'Кулиев Игорь' },
  { id: 'trotsenko', nameRu: 'Троценко Дмитрий' },
];
const slots = [
  { groupName: 'U-10', dayOfWeek: 'Tuesday', startTime: '18:00' },
  { groupName: 'U-10', dayOfWeek: 'Saturday', startTime: '12:00' },
];

describe('ReassignDialog', () => {
  it('показывает занятия тренера с русскими днями недели', () => {
    render(<ReassignDialog coach={coach} slots={slots} candidates={candidates} busy={false} onConfirm={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByText('U-10 — вт 18:00')).toBeTruthy();
    expect(screen.getByText('U-10 — сб 12:00')).toBeTruthy();
  });

  it('кнопка неактивна, пока не выбран тренер, затем передаёт его id', () => {
    const onConfirm = vi.fn();
    render(<ReassignDialog coach={coach} slots={slots} candidates={candidates} busy={false} onConfirm={onConfirm} onCancel={vi.fn()} />);
    const button = screen.getByRole('button', { name: 'Передать и удалить' }) as HTMLButtonElement;

    expect(button.disabled).toBe(true);

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'trotsenko' } });
    fireEvent.click(button);

    expect(onConfirm).toHaveBeenCalledWith('trotsenko');
  });
});
