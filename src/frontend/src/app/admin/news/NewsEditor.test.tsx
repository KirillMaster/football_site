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

  it('повторная замена обложки: второй файл заменяет первый', async () => {
    vi.mocked(uploadAdminNewsMedia)
      .mockResolvedValueOnce({
        status: 'uploaded',
        url: 'https://cdn.example.com/first-cover.jpg',
        key: 'k1',
        mediaType: 'image',
      })
      .mockResolvedValueOnce({
        status: 'uploaded',
        url: 'https://cdn.example.com/second-cover.jpg',
        key: 'k2',
        mediaType: 'image',
      });

    const onSave = vi.fn();
    render(<NewsEditor onSave={onSave} onCancel={vi.fn()} saving={false} />);

    fireEvent.change(screen.getByLabelText('Файл обложки'), {
      target: { files: [coverFile('first.jpg')] },
    });

    await waitFor(() =>
      expect(screen.getByAltText('Обложка новости')).toHaveAttribute(
        'src',
        'https://cdn.example.com/first-cover.jpg'
      )
    );

    fireEvent.change(screen.getByLabelText('Файл обложки'), {
      target: { files: [coverFile('second.jpg')] },
    });

    await waitFor(() =>
      expect(screen.getByAltText('Обложка новости')).toHaveAttribute(
        'src',
        'https://cdn.example.com/second-cover.jpg'
      )
    );
  });

  it('отказ загрузки (error) не затирает уже выбранную обложку', async () => {
    vi.mocked(uploadAdminNewsMedia).mockResolvedValue({
      status: 'error',
      url: '',
      key: '',
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

    fireEvent.change(screen.getByLabelText('Файл обложки'), {
      target: { files: [coverFile('bad.jpg')] },
    });

    await waitFor(() => expect(uploadAdminNewsMedia).toHaveBeenCalled());

    expect(screen.getByAltText('Обложка новости')).toHaveAttribute(
      'src',
      'https://cdn.example.com/old-cover.jpg'
    );
  });

  it('отказ загрузки (network_error) не затирает уже выбранную обложку', async () => {
    vi.mocked(uploadAdminNewsMedia).mockResolvedValue({
      status: 'network_error',
      url: '',
      key: '',
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

    fireEvent.change(screen.getByLabelText('Файл обложки'), {
      target: { files: [coverFile('bad.jpg')] },
    });

    await waitFor(() => expect(uploadAdminNewsMedia).toHaveBeenCalled());

    expect(screen.getByAltText('Обложка новости')).toHaveAttribute(
      'src',
      'https://cdn.example.com/old-cover.jpg'
    );
  });

  it('отказ загрузки (unauthorized) не затирает уже выбранную обложку', async () => {
    vi.mocked(uploadAdminNewsMedia).mockResolvedValue({
      status: 'unauthorized',
      url: '',
      key: '',
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

    fireEvent.change(screen.getByLabelText('Файл обложки'), {
      target: { files: [coverFile('forbidden.jpg')] },
    });

    await waitFor(() => expect(uploadAdminNewsMedia).toHaveBeenCalled());

    expect(screen.getByAltText('Обложка новости')).toHaveAttribute(
      'src',
      'https://cdn.example.com/old-cover.jpg'
    );
  });
});

describe('US3 @AS-8 @FR-011', () => {
  it('адрес автозаполняется из заголовка при создании новости', () => {
    const onSave = vi.fn();
    render(<NewsEditor onSave={onSave} onCancel={vi.fn()} saving={false} />);

    fireEvent.input(screen.getByLabelText('Заголовок'), { target: { value: 'Победа команды' } });
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }));

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ slug: 'pobeda-komandy' }));
  });

  it('адрес можно отредактировать вручную — автозаполнение перестаёт срабатывать', () => {
    const onSave = vi.fn();
    render(<NewsEditor onSave={onSave} onCancel={vi.fn()} saving={false} />);

    fireEvent.input(screen.getByLabelText('Заголовок'), { target: { value: 'Победа команды' } });
    fireEvent.input(screen.getByLabelText('Адрес (slug)'), { target: { value: 'custom-address' } });
    fireEvent.input(screen.getByLabelText('Заголовок'), { target: { value: 'Другой заголовок' } });
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }));

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ slug: 'custom-address' }));
  });
});

describe('US3 @AS-9 @FR-012', () => {
  it('невалидный формат адреса блокирует сохранение и показывает сообщение', () => {
    const onSave = vi.fn();
    render(<NewsEditor onSave={onSave} onCancel={vi.fn()} saving={false} />);

    fireEvent.input(screen.getByLabelText('Заголовок'), { target: { value: 'Заголовок' } });
    fireEvent.input(screen.getByLabelText('Адрес (slug)'), { target: { value: 'Некорректный Адрес' } });
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }));

    expect(onSave).not.toHaveBeenCalled();
    expect(
      screen.getByText('Адрес может содержать только строчные латинские буквы, цифры и дефисы')
    ).toBeInTheDocument();
  });
});

describe('US3 @FR-014', () => {
  it('добавление тегов по Enter и удаление тега передаются в onSave', () => {
    const onSave = vi.fn();
    render(<NewsEditor onSave={onSave} onCancel={vi.fn()} saving={false} />);

    fireEvent.input(screen.getByLabelText('Заголовок'), { target: { value: 'Заголовок' } });
    const tagInput = screen.getByLabelText('Теги');
    fireEvent.input(tagInput, { target: { value: 'новости' } });
    fireEvent.keyDown(tagInput, { key: 'Enter' });
    fireEvent.input(tagInput, { target: { value: 'школа' } });
    fireEvent.keyDown(tagInput, { key: 'Enter' });

    expect(screen.getByText('новости')).toBeInTheDocument();
    expect(screen.getByText('школа')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Удалить тег новости' }));
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }));

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ tags: ['школа'] }));
  });
});

describe('US3 @FR-015', () => {
  it('переключатель «Опубликовано» передаёт isPublished в onSave', () => {
    const onSave = vi.fn();
    render(<NewsEditor onSave={onSave} onCancel={vi.fn()} saving={false} />);

    fireEvent.input(screen.getByLabelText('Заголовок'), { target: { value: 'Заголовок' } });
    fireEvent.click(screen.getByLabelText('Опубликовано'));
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }));

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ isPublished: true }));
  });
});

describe('US3 @FR-013', () => {
  it('счётчики meta title/description показывают предупреждение при превышении лимита', () => {
    render(<NewsEditor onSave={vi.fn()} onCancel={vi.fn()} saving={false} />);

    fireEvent.input(screen.getByLabelText('SEO-заголовок (meta title)'), {
      target: { value: 'a'.repeat(161) },
    });
    fireEvent.input(screen.getByLabelText('SEO-описание (meta description)'), {
      target: { value: 'b'.repeat(301) },
    });

    expect(screen.getByText('161/160 — превышен лимит длины')).toBeInTheDocument();
    expect(screen.getByText('301/300 — превышен лимит длины')).toBeInTheDocument();
  });
});

describe('T010', () => {
  it('при открытии на редактирование все поля предзаполняются из полной новости и сохраняются целиком', () => {
    const onSave = vi.fn();
    render(
      <NewsEditor
        article={{
          id: 'news-1',
          slug: 'existing-slug',
          titleRu: 'Существующая новость',
          excerptRu: 'Краткое описание',
          contentRu: '<p>Текст</p>',
          coverImage: 'https://cdn.example.com/cover.jpg',
          tags: ['новости', 'школа'],
          metaTitle: 'Мета заголовок',
          metaDescription: 'Мета описание',
          isPublished: true,
        }}
        onSave={onSave}
        onCancel={vi.fn()}
        saving={false}
      />
    );

    expect(screen.getByLabelText('Заголовок')).toHaveValue('Существующая новость');
    expect(screen.getByLabelText('Адрес (slug)')).toHaveValue('existing-slug');
    expect(screen.getByLabelText('Адрес (slug)')).toBeDisabled();
    expect(screen.getByLabelText('Краткое описание')).toHaveValue('Краткое описание');
    expect(screen.getByLabelText('SEO-заголовок (meta title)')).toHaveValue('Мета заголовок');
    expect(screen.getByLabelText('SEO-описание (meta description)')).toHaveValue('Мета описание');
    expect(screen.getByLabelText('Опубликовано')).toBeChecked();
    expect(screen.getByText('новости')).toBeInTheDocument();
    expect(screen.getByText('школа')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        titleRu: 'Существующая новость',
        slug: 'existing-slug',
        excerptRu: 'Краткое описание',
        coverImage: 'https://cdn.example.com/cover.jpg',
        tags: ['новости', 'школа'],
        metaTitle: 'Мета заголовок',
        metaDescription: 'Мета описание',
        isPublished: true,
      })
    );
  });

  it('повторное сохранение без изменений сохраняет contentRu с галереей и видео без потерь', () => {
    const galleryVideoContent =
      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;margin-top:24px">' +
      '<img src="https://cdn.example.com/a.jpg" alt="Фото 1" />' +
      '<img src="https://cdn.example.com/b.jpg" alt="Фото 2" />' +
      '</div>' +
      '<p>Текст между блоками</p>' +
      '<video controls preload="metadata" playsinline style="width:100%;border-radius:12px;background:#000">' +
      '<source src="https://cdn.example.com/clip.mp4" type="video/mp4" />' +
      'Ваш браузер не поддерживает воспроизведение видео.' +
      '</video>';

    const onSave = vi.fn();
    render(
      <NewsEditor
        article={{
          id: 'news-2',
          slug: 'gallery-video-news',
          titleRu: 'Новость с галереей и видео',
          excerptRu: 'Описание',
          contentRu: galleryVideoContent,
          coverImage: null,
          tags: [],
          metaTitle: '',
          metaDescription: '',
          isPublished: false,
        }}
        onSave={onSave}
        onCancel={vi.fn()}
        saving={false}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }));

    expect(onSave).toHaveBeenCalledTimes(1);
    const saved = onSave.mock.calls[0][0] as { contentRu: string };
    expect(saved.contentRu).toContain('grid-template-columns');
    expect(saved.contentRu).toContain('https://cdn.example.com/a.jpg');
    expect(saved.contentRu).toContain('https://cdn.example.com/b.jpg');
    expect(saved.contentRu).toContain('<video');
    expect(saved.contentRu).toContain('https://cdn.example.com/clip.mp4');
  });
});
