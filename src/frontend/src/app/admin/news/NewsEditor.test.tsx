import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';

vi.mock('@/lib/api', () => ({
  uploadAdminNewsMedia: vi.fn(),
}));

import { NewsEditor } from './NewsEditor';
import { uploadAdminNewsMedia } from '@/lib/api';

function coverFile(name = 'cover.jpg', type = 'image/jpeg') {
  return new File(['x'], name, { type });
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

describe('US1 @AS-1 @FR-001 @FR-002', () => {
  it('загрузка обложки показывает превью и передаёт её URL в onSave', async () => {
    vi.mocked(uploadAdminNewsMedia).mockResolvedValue({
      status: 'uploaded',
      url: 'https://cdn.example.com/cover.jpg',
      key: 'k1',
      mediaType: 'image',
    });

    const onSave = vi.fn();
    render(<NewsEditor onSave={onSave} onCancel={vi.fn()} saving={false} />);

    fireEvent.change(screen.getByLabelText('Файл обложки'), {
      target: { files: [coverFile()] },
    });

    await waitFor(() => expect(screen.getByAltText('Обложка новости')).toBeInTheDocument());
    expect(screen.getByAltText('Обложка новости')).toHaveAttribute(
      'src',
      'https://cdn.example.com/cover.jpg'
    );

    fireEvent.input(screen.getByLabelText('Заголовок'), { target: { value: 'Заголовок' } });
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ coverImage: 'https://cdn.example.com/cover.jpg' })
    );
  });
});

describe('US1 @AS-2 @FR-004', () => {
  it('без загрузки обложки onSave получает coverImage: null', () => {
    const onSave = vi.fn();
    render(<NewsEditor onSave={onSave} onCancel={vi.fn()} saving={false} />);

    fireEvent.input(screen.getByLabelText('Заголовок'), { target: { value: 'Без обложки' } });
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }));

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ coverImage: null }));
  });
});

describe('US1 @AS-3 @FR-003', () => {
  it('«Заменить» загружает новый файл и обновляет превью', async () => {
    vi.mocked(uploadAdminNewsMedia).mockResolvedValue({
      status: 'uploaded',
      url: 'https://cdn.example.com/new-cover.jpg',
      key: 'k2',
      mediaType: 'image',
    });

    const onSave = vi.fn();
    render(
      <NewsEditor
        article={{ titleRu: 'Есть обложка', coverImage: 'https://cdn.example.com/old-cover.jpg' }}
        onSave={onSave}
        onCancel={vi.fn()}
        saving={false}
      />
    );

    expect(screen.getByAltText('Обложка новости')).toHaveAttribute(
      'src',
      'https://cdn.example.com/old-cover.jpg'
    );

    fireEvent.change(screen.getByLabelText('Файл обложки'), {
      target: { files: [coverFile('new-cover.jpg')] },
    });

    await waitFor(() =>
      expect(screen.getByAltText('Обложка новости')).toHaveAttribute(
        'src',
        'https://cdn.example.com/new-cover.jpg'
      )
    );
  });

  it('«Удалить» очищает обложку, onSave получает coverImage: null', () => {
    const onSave = vi.fn();
    render(
      <NewsEditor
        article={{ titleRu: 'Есть обложка', coverImage: 'https://cdn.example.com/old-cover.jpg' }}
        onSave={onSave}
        onCancel={vi.fn()}
        saving={false}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Удалить' }));
    expect(screen.queryByAltText('Обложка новости')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }));
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ coverImage: null }));
  });
});
