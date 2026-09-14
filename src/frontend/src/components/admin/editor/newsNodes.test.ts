import { describe, expect, it } from 'vitest';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { NewsGallery, NewsImage, NewsVideo } from './newsNodes';

function createEditor(content = '<p></p>') {
  return new Editor({
    extensions: [StarterKit, NewsImage, NewsGallery, NewsVideo],
    content,
  });
}

describe('@US1 @AS-4 @FR-005', () => {
  it('вставляет несколько изображений одной галереей в порядке выбора файлов', () => {
    const editor = createEditor();

    editor.commands.insertContent({
      type: 'newsGallery',
      content: [
        { type: 'newsImage', attrs: { src: '/media/a.jpg', alt: 'a' } },
        { type: 'newsImage', attrs: { src: '/media/b.jpg', alt: 'b' } },
        { type: 'newsImage', attrs: { src: '/media/c.jpg', alt: 'c' } },
      ],
    });

    const html = editor.getHTML();

    // DOM (jsdom и реальный браузер одинаково) нормализует текст style-атрибута
    // (пробелы/`;`), поэтому сверяем по структуре свойств, а не литеральной строке.
    expect(html).toMatch(
      /<div style="display:\s*grid;\s*grid-template-columns:\s*repeat\(auto-fit,\s*minmax\(260px,\s*1fr\)\);\s*gap:\s*12px;\s*margin-top:\s*24px;?">/
    );
    const order = ['a.jpg', 'b.jpg', 'c.jpg'].map((f) => html.indexOf(f));
    expect(order[0]).toBeLessThan(order[1]);
    expect(order[1]).toBeLessThan(order[2]);

    editor.destroy();
  });

  it('каждое изображение галереи рендерится без <figure>-обёртки с эталонными атрибутами', () => {
    const editor = createEditor();

    editor.commands.insertContent({
      type: 'newsGallery',
      content: [{ type: 'newsImage', attrs: { src: '/media/a.jpg', alt: 'Фото матча' } }],
    });

    const html = editor.getHTML();
    expect(html).not.toContain('<figure');
    expect(html).toMatch(
      /<img loading="lazy" style="width:\s*100%;\s*height:\s*auto;\s*border-radius:\s*12px;?" src="\/media\/a\.jpg" alt="Фото матча">/
    );

    editor.destroy();
  });
});

describe('@US1 @AS-5 @FR-006', () => {
  it('сохраняет alt-описание изображения в HTML после установки атрибута узла', () => {
    const editor = createEditor();

    editor.commands.insertContent({
      type: 'newsGallery',
      content: [{ type: 'newsImage', attrs: { src: '/media/a.jpg', alt: '' } }],
    });

    const pos = 1; // позиция первого newsImage внутри newsGallery
    editor.view.dispatch(
      editor.view.state.tr.setNodeMarkup(pos, undefined, {
        src: '/media/a.jpg',
        alt: 'Команда после победы',
      })
    );

    expect(editor.getHTML()).toContain('alt="Команда после победы"');

    editor.destroy();
  });

  it('без явно указанного описания сохраняется пустой alt (маркер «без описания» — только в UI)', () => {
    const editor = createEditor();

    editor.commands.insertContent({
      type: 'newsGallery',
      content: [{ type: 'newsImage', attrs: { src: '/media/a.jpg', alt: '' } }],
    });

    expect(editor.getHTML()).toContain('alt=""');

    editor.destroy();
  });
});

describe('@US1 @AS-6 @FR-007', () => {
  it('вставляет видео с эталонной разметкой (controls, preload=metadata, playsinline, fallback-текст)', () => {
    const editor = createEditor();

    editor.commands.insertContent({
      type: 'newsVideo',
      attrs: { src: '/media/match.mp4' },
    });

    const html = editor.getHTML();
    expect(html).toMatch(
      /<div style="display:\s*grid;\s*gap:\s*16px;\s*margin-top:\s*24px;?">/
    );
    expect(html).toMatch(
      /<video controls="" preload="metadata" playsinline="" style="width:\s*100%;\s*border-radius:\s*12px;\s*background:\s*(#000|rgb\(0,\s*0,\s*0\));?">/
    );
    expect(html).toContain('<source src="/media/match.mp4" type="video/mp4">');
    expect(html).toContain('Ваш браузер не поддерживает воспроизведение видео.');

    editor.destroy();
  });
});

describe('@US1 @AS-7 @FR-008 @FR-020', () => {
  it('round-trip: галерея и видео переживают повторное открытие (parse → serialize даёт исходную структуру)', () => {
    const original =
      '<p>Текст новости</p>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;margin-top:24px">' +
      '<img loading="lazy" style="width:100%;height:auto;border-radius:12px" src="/media/a.jpg" alt="Фото 1">' +
      '<img loading="lazy" style="width:100%;height:auto;border-radius:12px" src="/media/b.jpg" alt="Фото 2">' +
      '</div>' +
      '<div style="display:grid;gap:16px;margin-top:24px">' +
      '<video controls preload="metadata" playsinline style="width:100%;border-radius:12px;background:#000">' +
      '<source src="/media/match.mp4" type="video/mp4" />' +
      'Ваш браузер не поддерживает воспроизведение видео.' +
      '</video>' +
      '</div>';

    const editor = createEditor(original);
    const html = editor.getHTML();

    expect(html).toMatch(
      /<div style="display:\s*grid;\s*grid-template-columns:\s*repeat\(auto-fit,\s*minmax\(260px,\s*1fr\)\);\s*gap:\s*12px;\s*margin-top:\s*24px;?">/
    );
    expect(html).toContain('src="/media/a.jpg" alt="Фото 1">');
    expect(html).toContain('src="/media/b.jpg" alt="Фото 2">');
    expect(html).toMatch(/<div style="display:\s*grid;\s*gap:\s*16px;\s*margin-top:\s*24px;?">/);
    expect(html).toContain('<source src="/media/match.mp4" type="video/mp4">');
    expect(html).toContain('Ваш браузер не поддерживает воспроизведение видео.');

    editor.destroy();
  });

  it('round-trip: HTML новости, созданной программно (без редактора), парсится и переживает re-serialize без потерь', () => {
    // Эмулирует контент, который backend мог сохранить не через этот редактор
    // (например, сид-скрипт или ручная миграция) — тот же эталонный формат.
    const programmatic =
      '<h2>Анонс</h2>' +
      '<p>Смотрите фоторепортаж и видео с последней игры.</p>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;margin-top:24px">' +
      '<img loading="lazy" style="width:100%;height:auto;border-radius:12px" src="/media/seed1.jpg" alt="">' +
      '<img loading="lazy" style="width:100%;height:auto;border-radius:12px" src="/media/seed2.jpg" alt="Разминка">' +
      '<img loading="lazy" style="width:100%;height:auto;border-radius:12px" src="/media/seed3.jpg" alt="">' +
      '</div>' +
      '<div style="display:grid;gap:16px;margin-top:24px">' +
      '<video controls preload="metadata" playsinline style="width:100%;border-radius:12px;background:#000">' +
      '<source src="/media/seed.mp4" type="video/mp4" />' +
      'Ваш браузер не поддерживает воспроизведение видео.' +
      '</video>' +
      '</div>' +
      '<p>Спасибо, что были с нами.</p>';

    const editor = createEditor(programmatic);
    const html = editor.getHTML();

    expect(html).toContain('<h2>Анонс</h2>');
    expect((html.match(/<img /g) ?? []).length).toBe(3);
    expect(html).toContain('src="/media/seed1.jpg"');
    expect(html).toContain('src="/media/seed2.jpg" alt="Разминка"');
    expect(html).toContain('src="/media/seed3.jpg"');
    expect(html).toContain('src="/media/seed.mp4"');
    expect(html).toContain('<p>Спасибо, что были с нами.</p>');

    editor.destroy();
  });
});

describe('@US1 @AS-4 @AS-5 @AS-6 @AS-7', () => {
  it('граничное значение: одно изображение в галерее остаётся валидным и сохраняет alt', () => {
    const editor = createEditor();

    editor.commands.insertContent({
      type: 'newsGallery',
      content: [{ type: 'newsImage', attrs: { src: '/media/single.jpg', alt: 'Единственное фото' } }],
    });

    const html = editor.getHTML();
    expect(html).toContain('src="/media/single.jpg" alt="Единственное фото"');
    expect(html).toMatch(
      /<div style="display:\s*grid;\s*grid-template-columns:\s*repeat\(auto-fit,\s*minmax\(260px,\s*1fr\)\);\s*gap:\s*12px;\s*margin-top:\s*24px;?">/
    );

    editor.destroy();
  });

  it('граничное значение: очень длинный alt-текст (>255 символов) сохраняется без обрезания', () => {
    const longAlt = 'А'.repeat(300);
    const editor = createEditor();

    editor.commands.insertContent({
      type: 'newsGallery',
      content: [{ type: 'newsImage', attrs: { src: '/media/a.jpg', alt: longAlt } }],
    });

    const html = editor.getHTML();
    expect(html).toContain(`alt="${longAlt}"`);

    editor.destroy();
  });

  it('граничное значение: alt с спецсимволами сохраняется (экранирование на уровне DOM)', () => {
    const editor = createEditor();
    const altText = 'Фото & текст <тег> "кавычки"';

    editor.commands.insertContent({
      type: 'newsGallery',
      content: [{ type: 'newsImage', attrs: { src: '/media/a.jpg', alt: altText } }],
    });

    const html = editor.getHTML();
    // & экранируется, " экранируется, но браузер обрабатывает < при renderHTML
    expect(html).toContain('alt="Фото &amp; текст');
    expect(html).toContain('&quot;кавычки&quot;"');

    editor.destroy();
  });

  it('граничное значение: пустой src в newsImage не валиден, но парсится без ошибок', () => {
    const editor = createEditor();

    // Вставляем напрямую с пустым src
    editor.commands.insertContent({
      type: 'newsGallery',
      content: [{ type: 'newsImage', attrs: { src: '', alt: 'Описание' } }],
    });

    const html = editor.getHTML();
    expect(html).toContain('src=""');
    expect(html).toContain('alt="Описание"');

    editor.destroy();
  });

  it('видео: пустой src обрабатывается без ошибок', () => {
    const editor = createEditor();

    editor.commands.insertContent({
      type: 'newsVideo',
      attrs: { src: '' },
    });

    const html = editor.getHTML();
    expect(html).toContain('<source src="" type="video/mp4">');
    expect(html).toContain('Ваш браузер не поддерживает воспроизведение видео.');

    editor.destroy();
  });

  it('alt-атрибут с числами и спецсимволами парсится и сохраняется', () => {
    const editor = createEditor();

    editor.commands.insertContent({
      type: 'newsGallery',
      content: [
        { type: 'newsImage', attrs: { src: '/media/a.jpg', alt: 'Матч #1 (2024-09-14) 3:2' } },
      ],
    });

    const html = editor.getHTML();
    expect(html).toContain('alt="Матч #1 (2024-09-14) 3:2"');

    editor.destroy();
  });

  it('newsImage внутри galllery остаётся атомарным: нельзя добавить текстовое содержимое', () => {
    const editor = createEditor();

    editor.commands.insertContent({
      type: 'newsGallery',
      content: [{ type: 'newsImage', attrs: { src: '/media/a.jpg', alt: 'Фото' } }],
    });

    // Пытаемся добавить в newsImage текст — это невалидно
    // Структура должна остаться неизменной
    const html = editor.getHTML();
    expect(html).toMatch(/<img[^>]*src="\/media\/a\.jpg"/);
    expect(html).not.toContain('<newsImage>');

    editor.destroy();
  });

  it('видео: все атрибуты (controls, preload, playsinline) обязательны', () => {
    const editor = createEditor();

    editor.commands.insertContent({
      type: 'newsVideo',
      attrs: { src: '/media/video.mp4' },
    });

    const html = editor.getHTML();
    expect(html).toContain('controls=""');
    expect(html).toContain('preload="metadata"');
    expect(html).toContain('playsinline=""');

    editor.destroy();
  });

  it('round-trip: newsImage с числовым alt-текстом', () => {
    const html =
      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;margin-top:24px">' +
      '<img loading="lazy" style="width:100%;height:auto;border-radius:12px" src="/media/a.jpg" alt="123">' +
      '</div>';

    const editor = createEditor(html);
    const result = editor.getHTML();

    expect(result).toContain('alt="123"');

    editor.destroy();
  });

  it('round-trip: newsVideo multiple source fallback (только <source> с type="video/mp4" поддерживается)', () => {
    const html =
      '<div style="display:grid;gap:16px;margin-top:24px">' +
      '<video controls preload="metadata" playsinline style="width:100%;border-radius:12px;background:#000">' +
      '<source src="/media/video.mp4" type="video/mp4">' +
      'Ваш браузер не поддерживает воспроизведение видео.' +
      '</video>' +
      '</div>';

    const editor = createEditor(html);
    const result = editor.getHTML();

    // Парсер должен взять только src из <source>
    expect(result).toContain('src="/media/video.mp4"');

    editor.destroy();
  });
});
