import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { Analytics } from './Analytics';

// next/script в jsdom вставляет <script> императивно напрямую в document.head,
// в обход React-дерева — cleanup() из testing-library его не удаляет между тестами.
// Мокаем декларативным <script>, чтобы монтирование/размонтирование управлялось React.
vi.mock('next/script', () => ({
  default: ({ id, children, dangerouslySetInnerHTML }: {
    id?: string;
    children?: string;
    dangerouslySetInnerHTML?: { __html: string };
  }) => (
    <script id={id} dangerouslySetInnerHTML={dangerouslySetInnerHTML ?? { __html: children ?? '' }} />
  ),
}));

const ORIGINAL_ENV = process.env;

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

afterEach(() => {
  process.env = ORIGINAL_ENV;
  cleanup();
});

describe('@US2-AS1', () => {
  it('рендерит скрипт счётчика mc.yandex.ru и инициализирует webvisor + clickmap при заданном NEXT_PUBLIC_YM_ID', () => {
    process.env.NEXT_PUBLIC_YM_ID = '12345678';

    render(<Analytics />);

    const ymInitScript = document.getElementById('ym-init');
    expect(ymInitScript).not.toBeNull();
    expect(ymInitScript?.textContent).toContain('mc.yandex.ru');
    expect(ymInitScript?.textContent).toContain('webvisor:true');
    expect(ymInitScript?.textContent).toContain('clickmap:true');
    expect(ymInitScript?.textContent).toContain('trackLinks:true');
    expect(ymInitScript?.textContent).toContain('accurateTrackBounce:true');
    expect(ymInitScript?.textContent).toContain('trackHash:true');
    expect(ymInitScript?.textContent).toContain('12345678');
  });
});

describe('@US2-AS1b', () => {
  it('не рендерит скрипт счётчика при пустом NEXT_PUBLIC_YM_ID', () => {
    process.env.NEXT_PUBLIC_YM_ID = '';

    render(<Analytics />);

    expect(document.getElementById('ym-init')).toBeNull();
  });

  it('не рендерит скрипт счётчика при незаданном NEXT_PUBLIC_YM_ID', () => {
    delete process.env.NEXT_PUBLIC_YM_ID;

    render(<Analytics />);

    expect(document.getElementById('ym-init')).toBeNull();
  });
});
