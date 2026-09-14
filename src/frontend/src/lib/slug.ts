// US3 @AS-8 @FR-011: автогенерация адреса новости из заголовка + правила
// допустимого формата адреса, общие для автозаполнения и ручного ввода.

const TRANSLIT: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z',
  и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
  с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh',
  щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
};

// Допустимый формат адреса: только строчные латинские буквы, цифры и дефисы (@AS-9, @EC-4).
export const SLUG_PATTERN = /^[a-z0-9-]+$/;

export function isValidSlug(slug: string): boolean {
  return SLUG_PATTERN.test(slug);
}

// Транслитерация + нормализация заголовка в адрес: строчные буквы, пробелы и
// пунктуация → дефис, повторные дефисы схлопываются, ведущие/конечные — обрезаются.
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .split('')
    .map((ch) => TRANSLIT[ch] ?? ch)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 200);
}
