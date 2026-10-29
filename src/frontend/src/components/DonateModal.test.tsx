import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';

vi.mock('@/lib/analytics', () => ({ reachGoal: vi.fn() }));

import DonateModal, { DONATE_REQUISITES_TEXT } from './DonateModal';
import DonateButton from './DonateButton';
import { reachGoal } from '@/lib/analytics';

const writeText = vi.fn().mockResolvedValue(undefined);

beforeEach(() => {
  vi.clearAllMocks();
  Object.assign(navigator, { clipboard: { writeText } });
});

afterEach(() => {
  cleanup();
});

describe('DonateModal', () => {
  it('показывает реквизиты АНО из платёжного QR', () => {
    render(<DonateModal onClose={vi.fn()} />);

    expect(screen.getByText('40703810400000727852')).toBeInTheDocument();
    expect(screen.getByText('044525974')).toBeInTheDocument();
    expect(screen.getByText('9200012105')).toBeInTheDocument();
  });

  it('«Скопировать все реквизиты» кладёт полный текст в буфер', async () => {
    render(<DonateModal onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Скопировать все реквизиты' }));

    await waitFor(() => expect(writeText).toHaveBeenCalledWith(DONATE_REQUISITES_TEXT));
    expect(DONATE_REQUISITES_TEXT).toContain('Расчётный счёт: 40703810400000727852');
  });

  it('копирование отдельного поля', async () => {
    render(<DonateModal onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Скопировать: БИК' }));

    await waitFor(() => expect(writeText).toHaveBeenCalledWith('044525974'));
    expect(await screen.findByText('Скопировано ✓')).toBeInTheDocument();
  });
});

describe('DonateButton', () => {
  it('открывает окно, шлёт цель donate_click с местом и вызывает onOpen', () => {
    const onOpen = vi.fn();
    render(
      <DonateButton place="header" onOpen={onOpen}>
        Помочь построить поле
      </DonateButton>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Помочь построить поле' }));

    expect(reachGoal).toHaveBeenCalledWith('donate_click', { place: 'header' });
    expect(onOpen).toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
