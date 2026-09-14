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

  it('дубликат тега не добавляется дважды', () => {
    const onSave = vi.fn();
    render(<NewsEditor onSave={onSave} onCancel={vi.fn()} saving={false} />);

    fireEvent.input(screen.getByLabelText('Заголовок'), { target: { value: 'Заголовок' } });
    const tagInput = screen.getByLabelText('Теги');
    fireEvent.input(tagInput, { target: { value: 'новости' } });
    fireEvent.keyDown(tagInput, { key: 'Enter' });
    fireEvent.input(tagInput, { target: { value: 'новости' } });
    fireEvent.keyDown(tagInput, { key: 'Enter' });
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }));

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ tags: ['новости'] }));
  });

  it('пустая строка не добавляется как тег', () => {
    const onSave = vi.fn();
    render(<NewsEditor onSave={onSave} onCancel={vi.fn()} saving={false} />);

    fireEvent.input(screen.getByLabelText('Заголовок'), { target: { value: 'Заголовок' } });
    const tagInput = screen.getByLabelText('Теги');
    fireEvent.input(tagInput, { target: { value: '' } });
    fireEvent.keyDown(tagInput, { key: 'Enter' });
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }));

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ tags: [] }));
  });

  it('только пробелы не добавляются как тег', () => {
    const onSave = vi.fn();
    render(<NewsEditor onSave={onSave} onCancel={vi.fn()} saving={false} />);

    fireEvent.input(screen.getByLabelText('Заголовок'), { target: { value: 'Заголовок' } });
    const tagInput = screen.getByLabelText('Теги');
    fireEvent.input(tagInput, { target: { value: '   ' } });
    fireEvent.keyDown(tagInput, { key: 'Enter' });
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }));

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ tags: [] }));
  });

  it('удаление одного тега не трогает остальные', () => {
    const onSave = vi.fn();
    render(<NewsEditor onSave={onSave} onCancel={vi.fn()} saving={false} />);

    fireEvent.input(screen.getByLabelText('Заголовок'), { target: { value: 'Заголовок' } });
    const tagInput = screen.getByLabelText('Теги');
    fireEvent.input(tagInput, { target: { value: 'новости' } });
    fireEvent.keyDown(tagInput, { key: 'Enter' });
    fireEvent.input(tagInput, { target: { value: 'школа' } });
    fireEvent.keyDown(tagInput, { key: 'Enter' });
    fireEvent.input(tagInput, { target: { value: 'турниры' } });
    fireEvent.keyDown(tagInput, { key: 'Enter' });

    // Получаем все кнопки удаления тегов и кликаем на вторую (школа)
    const deleteButtons = screen.getAllByRole('button', { name: /^Удалить тег/ });
    fireEvent.click(deleteButtons[1]); // Удаляем тег "школа"
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }));

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ tags: ['новости', 'турниры'] }));
  });
});

describe('US3 @FR-015', () => {
  it('переключатель «Опубликовано» передаёт isPublished в onSave при создании', () => {
    const onSave = vi.fn();
    render(<NewsEditor onSave={onSave} onCancel={vi.fn()} saving={false} />);

    fireEvent.input(screen.getByLabelText('Заголовок'), { target: { value: 'Заголовок' } });
    fireEvent.click(screen.getByLabelText('Опубликовано'));
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }));

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ isPublished: true }));
  });

  it('переключатель «Опубликовано» передаёт isPublished в onSave при обновлении', () => {
    const onSave = vi.fn();
    render(
      <NewsEditor
        article={{
          id: 'news-1',
          slug: 'existing-slug',
          titleRu: 'Существующая новость',
          excerptRu: 'Описание',
          contentRu: '<p>Текст</p>',
          isPublished: false,
        }}
        onSave={onSave}
        onCancel={vi.fn()}
        saving={false}
      />
    );

    expect(screen.getByLabelText('Опубликовано')).not.toBeChecked();
    fireEvent.click(screen.getByLabelText('Опубликовано'));
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }));

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ isPublished: true }));
  });

  it('снятие публикации передаёт isPublished: false при обновлении', () => {
    const onSave = vi.fn();
    render(
      <NewsEditor
        article={{
          id: 'news-1',
          slug: 'existing-slug',
          titleRu: 'Существующая новость',
          excerptRu: 'Описание',
          contentRu: '<p>Текст</p>',
          isPublished: true,
        }}
        onSave={onSave}
        onCancel={vi.fn()}
        saving={false}
      />
    );

    expect(screen.getByLabelText('Опубликовано')).toBeChecked();
    fireEvent.click(screen.getByLabelText('Опубликовано'));
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }));

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ isPublished: false }));
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

  it('метаЗаголовок ровно 160 символов — без предупреждения', () => {
    render(<NewsEditor onSave={vi.fn()} onCancel={vi.fn()} saving={false} />);

    const metaInput = screen.getByLabelText('SEO-заголовок (meta title)');
    fireEvent.input(metaInput, { target: { value: 'a'.repeat(160) } });

    expect(screen.queryByText('160/160 — превышен лимит длины')).not.toBeInTheDocument();
  });

  it('метаЗаголовок 159 символов — без предупреждения', () => {
    render(<NewsEditor onSave={vi.fn()} onCancel={vi.fn()} saving={false} />);

    fireEvent.input(screen.getByLabelText('SEO-заголовок (meta title)'), {
      target: { value: 'a'.repeat(159) },
    });

    expect(screen.queryByText('159/160 — превышен лимит длины')).not.toBeInTheDocument();
  });

  it('метаОписание ровно 300 символов — без предупреждения', () => {
    render(<NewsEditor onSave={vi.fn()} onCancel={vi.fn()} saving={false} />);

    fireEvent.input(screen.getByLabelText('SEO-описание (meta description)'), {
      target: { value: 'a'.repeat(300) },
    });

    expect(screen.queryByText('300/300 — превышен лимит длины')).not.toBeInTheDocument();
  });

  it('метаОписание 299 символов — без предупреждения', () => {
    render(<NewsEditor onSave={vi.fn()} onCancel={vi.fn()} saving={false} />);

    fireEvent.input(screen.getByLabelText('SEO-описание (meta description)'), {
      target: { value: 'a'.repeat(299) },
    });

    expect(screen.queryByText('299/300 — превышен лимит длины')).not.toBeInTheDocument();
  });

  it('граничные значения передаются в onSave без изменений', () => {
    const onSave = vi.fn();
    render(<NewsEditor onSave={onSave} onCancel={vi.fn()} saving={false} />);

    fireEvent.input(screen.getByLabelText('Заголовок'), { target: { value: 'Заголовок' } });
    fireEvent.input(screen.getByLabelText('SEO-заголовок (meta title)'), {
      target: { value: 'a'.repeat(160) },
    });
    fireEvent.input(screen.getByLabelText('SEO-описание (meta description)'), {
      target: { value: 'b'.repeat(300) },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        metaTitle: 'a'.repeat(160),
        metaDescription: 'b'.repeat(300),
      })
    );
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
    expect(saved.contentRu).toContain('repeat(auto-fit,minmax(260px,1fr))');
    expect(saved.contentRu).toContain('gap: 12px');
    expect(saved.contentRu).toContain('margin-top: 24px');
    expect(saved.contentRu).toContain('https://cdn.example.com/a.jpg');
    expect(saved.contentRu).toContain('alt="Фото 1"');
    expect(saved.contentRu).toContain('https://cdn.example.com/b.jpg');
    expect(saved.contentRu).toContain('alt="Фото 2"');
    expect(saved.contentRu).toContain('Текст между блоками');
    expect(saved.contentRu).toContain('<video');
    expect(saved.contentRu).toContain('controls');
    expect(saved.contentRu).toContain('preload="metadata"');
    expect(saved.contentRu).toContain('playsinline');
    expect(saved.contentRu).toContain('https://cdn.example.com/clip.mp4');
    expect(saved.contentRu).toContain('type="video/mp4"');
    expect(saved.contentRu).toContain('</video>');
  });
});

// Сквозная проверка паритета с программно созданными новостями (004-admin-news-rich-editor,
// слайс slice-parity, quickstart:scenario-1..5, SC-001/SC-003/SC-004/SC-005).
describe('@quickstart-scenario-2 @SC-003 @FR-020', () => {
  it('полный цикл открытия и сохранения не теряет ни одно поле: обложка, теги, публикация, SEO, галерея и видео', () => {
    const fullContent =
      '<h2>Заголовок раздела</h2>' +
      '<p><strong>Абзац с выделением.</strong></p>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;margin-top:24px">' +
      '<img src="https://cdn.example.com/photo1.jpg" alt="Фото 1" />' +
      '<img src="https://cdn.example.com/photo2.jpg" alt="Фото 2" />' +
      '</div>' +
      '<video controls preload="metadata" playsinline style="width:100%;border-radius:12px;background:#000">' +
      '<source src="https://cdn.example.com/clip.mp4" type="video/mp4" />' +
      'Ваш браузер не поддерживает воспроизведение видео.' +
      '</video>';

    const onSave = vi.fn();
    render(
      <NewsEditor
        article={{
          id: 'news-full',
          slug: 'full-parity-news',
          titleRu: 'Новость с полным составом',
          excerptRu: 'Экспресс-описание',
          contentRu: fullContent,
          coverImage: 'https://cdn.example.com/cover.jpg',
          tags: ['новости', 'школа'],
          metaTitle: 'SEO заголовок',
          metaDescription: 'SEO описание',
          isPublished: true,
        }}
        onSave={onSave}
        onCancel={vi.fn()}
        saving={false}
      />
    );

    // Всё предзаполнено из открытой новости.
    expect(screen.getByAltText('Обложка новости')).toHaveAttribute(
      'src',
      'https://cdn.example.com/cover.jpg'
    );
    expect(screen.getByText('новости')).toBeInTheDocument();
    expect(screen.getByText('школа')).toBeInTheDocument();
    expect(screen.getByLabelText('Опубликовано')).toBeChecked();
    expect(screen.getByLabelText('SEO-заголовок (meta title)')).toHaveValue('SEO заголовок');
    expect(screen.getByLabelText('SEO-описание (meta description)')).toHaveValue('SEO описание');

    fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }));

    expect(onSave).toHaveBeenCalledTimes(1);
    const saved = onSave.mock.calls[0][0] as {
      coverImage: string | null;
      tags: string[];
      isPublished: boolean;
      metaTitle: string;
      metaDescription: string;
      contentRu: string;
      titleRu: string;
      slug: string;
      excerptRu: string;
    };

    // Проверка всех простых полей
    expect(saved.titleRu).toBe('Новость с полным составом');
    expect(saved.slug).toBe('full-parity-news');
    expect(saved.excerptRu).toBe('Экспресс-описание');
    expect(saved.coverImage).toBe('https://cdn.example.com/cover.jpg');
    expect(saved.tags).toEqual(['новости', 'школа']);
    expect(saved.isPublished).toBe(true);
    expect(saved.metaTitle).toBe('SEO заголовок');
    expect(saved.metaDescription).toBe('SEO описание');

    // Проверка структуры контента
    expect(saved.contentRu).toContain('<h2>Заголовок раздела</h2>');
    expect(saved.contentRu).toContain('<strong>Абзац с выделением.</strong>');
    expect(saved.contentRu).toContain('grid-template-columns');
    expect(saved.contentRu).toContain('repeat(auto-fit,minmax(260px,1fr))');
    expect(saved.contentRu).toContain('gap: 12px');
    expect(saved.contentRu).toContain('margin-top: 24px');

    // Проверка всех фото с атрибутами
    expect(saved.contentRu).toContain('https://cdn.example.com/photo1.jpg');
    expect(saved.contentRu).toContain('alt="Фото 1"');
    expect(saved.contentRu).toContain('https://cdn.example.com/photo2.jpg');
    expect(saved.contentRu).toContain('alt="Фото 2"');

    // Проверка видео со всеми атрибутами
    expect(saved.contentRu).toContain('<video');
    expect(saved.contentRu).toContain('controls');
    expect(saved.contentRu).toContain('preload="metadata"');
    expect(saved.contentRu).toContain('playsinline');
    expect(saved.contentRu).toContain('border-radius: 12px');
    expect(saved.contentRu).toContain('background:');
    expect(saved.contentRu).toContain('https://cdn.example.com/clip.mp4');
    expect(saved.contentRu).toContain('type="video/mp4"');
    expect(saved.contentRu).toContain('</video>');
  });
});

function galleryFiles(names: string[]) {
  return names.map((name) => new File(['x'], name, { type: 'image/jpeg' }));
}

describe('@quickstart-scenario-5 @SC-005 @EC-1', () => {
  it('часть файлов галереи отклонена (превышен размер) — успешные вставляются, ошибка показывает остальные', async () => {
    vi.mocked(uploadAdminNewsMedia)
      .mockResolvedValueOnce({
        status: 'uploaded',
        url: 'https://cdn.example.com/g1.jpg',
        key: 'g1',
        mediaType: 'image',
      })
      .mockResolvedValueOnce({
        status: 'uploaded',
        url: 'https://cdn.example.com/g2.jpg',
        key: 'g2',
        mediaType: 'image',
      })
      .mockResolvedValueOnce({
        status: 'uploaded',
        url: 'https://cdn.example.com/g3.jpg',
        key: 'g3',
        mediaType: 'image',
      })
      .mockResolvedValueOnce({
        status: 'rejected',
        message: 'Файл превышает допустимый размер 20 МБ',
      });

    const onSave = vi.fn();
    render(<NewsEditor onSave={onSave} onCancel={vi.fn()} saving={false} />);

    fireEvent.input(screen.getByLabelText('Заголовок'), { target: { value: 'Галерея с отказом' } });
    fireEvent.change(screen.getByLabelText('Файлы галереи'), {
      target: { files: galleryFiles(['ok1.jpg', 'ok2.jpg', 'ok3.jpg', 'huge.jpg']) },
    });

    await waitFor(() => expect(uploadAdminNewsMedia).toHaveBeenCalledTimes(4));
    await waitFor(() =>
      expect(
        screen.getAllByText(/huge\.jpg: Файл превышает допустимый размер 20 МБ/).length
      ).toBeGreaterThan(0)
    );

    fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }));

    expect(onSave).toHaveBeenCalledTimes(1);
    const saved = onSave.mock.calls[0][0] as { contentRu: string };
    // Успешные файлы должны быть вставлены
    expect(saved.contentRu).toContain('https://cdn.example.com/g1.jpg');
    expect(saved.contentRu).toContain('https://cdn.example.com/g2.jpg');
    expect(saved.contentRu).toContain('https://cdn.example.com/g3.jpg');
    // Структура галереи сохранена
    expect(saved.contentRu).toContain('grid-template-columns');
    expect(saved.contentRu).toContain('repeat(auto-fit,minmax(260px,1fr))');
    expect(saved.contentRu).toContain('gap: 12px');
  });
});

describe('@quickstart-scenario-5 @SC-005 @EC-2', () => {
  it('файл неподдерживаемого типа в галерее не блокирует вставку остальных', async () => {
    vi.mocked(uploadAdminNewsMedia)
      .mockResolvedValueOnce({
        status: 'uploaded',
        url: 'https://cdn.example.com/photo.jpg',
        key: 'p1',
        mediaType: 'image',
      })
      .mockResolvedValueOnce({
        status: 'rejected',
        message: 'Недопустимый тип файла. Поддерживаются: JPEG, PNG, WebP',
      });

    const onSave = vi.fn();
    render(<NewsEditor onSave={onSave} onCancel={vi.fn()} saving={false} />);

    fireEvent.input(screen.getByLabelText('Заголовок'), { target: { value: 'Галерея с плохим типом' } });
    fireEvent.change(screen.getByLabelText('Файлы галереи'), {
      target: { files: galleryFiles(['photo.jpg', 'document.pdf']) },
    });

    await waitFor(() => expect(uploadAdminNewsMedia).toHaveBeenCalledTimes(2));
    await waitFor(() =>
      expect(
        screen.getAllByText(/document\.pdf: Недопустимый тип файла\. Поддерживаются: JPEG, PNG, WebP/)
          .length
      ).toBeGreaterThan(0)
    );

    fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }));

    expect(onSave).toHaveBeenCalledTimes(1);
    const saved = onSave.mock.calls[0][0] as { contentRu: string };
    // Успешная фотография сохранена
    expect(saved.contentRu).toContain('https://cdn.example.com/photo.jpg');
    // Структура галереи не потеряна
    expect(saved.contentRu).toContain('grid-template-columns');
    // Отклонённый файл не попал в контент
    expect(saved.contentRu).not.toContain('document.pdf');
  });
});

describe('@quickstart-scenario-5 @SC-005 @EC-3', () => {
  it('сетевая ошибка при загрузке видео не стирает уже введённый текст новости', async () => {
    vi.mocked(uploadAdminNewsMedia).mockResolvedValue({ status: 'network_error' });

    const onSave = vi.fn();
    render(
      <NewsEditor
        article={{
          id: 'news-net-err',
          slug: 'video-network-error',
          titleRu: 'Новость с видео',
          excerptRu: 'Описание',
          contentRu: '<p>Важный текст, который нельзя потерять.</p>',
          tags: [],
          isPublished: false,
        }}
        onSave={onSave}
        onCancel={vi.fn()}
        saving={false}
      />
    );

    const videoFile = new File(['x'], 'clip.mp4', { type: 'video/mp4' });
    fireEvent.change(screen.getByLabelText('Файл видео'), { target: { files: [videoFile] } });

    await waitFor(() => expect(uploadAdminNewsMedia).toHaveBeenCalled());
    await waitFor(() =>
      expect(
        screen.getAllByText(/clip\.mp4: нет соединения с сервером/).length
      ).toBeGreaterThan(0)
    );

    fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }));

    expect(onSave).toHaveBeenCalledTimes(1);
    const saved = onSave.mock.calls[0][0] as { contentRu: string };
    // Важный текст сохранён несмотря на ошибку видео
    expect(saved.contentRu).toContain('Важный текст, который нельзя потерять.');
    // Видео не вставлено из-за ошибки
    expect(saved.contentRu).not.toContain('<video');
    expect(saved.contentRu).not.toContain('clip.mp4');
    // Абзац с текстом сохранён
    expect(saved.contentRu).toContain('<p>');
  });
});
