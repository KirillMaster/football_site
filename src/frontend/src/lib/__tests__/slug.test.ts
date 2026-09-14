import { describe, expect, it } from 'vitest';
import { isValidSlug, slugify } from '../slug';

describe('US3 @AS-8 @FR-011', () => {
  it('транслитерирует кириллицу в латиницу', () => {
    expect(slugify('Победа команды')).toBe('pobeda-komandy');
  });

  it('заменяет пробелы на дефисы', () => {
    expect(slugify('Новый   турнир   школы')).toBe('novyy-turnir-shkoly');
  });

  it('убирает пунктуацию', () => {
    expect(slugify('Итоги: сезон 2023/24!')).toBe('itogi-sezon-2023-24');
  });

  it('схлопывает повторные дефисы и обрезает по краям', () => {
    expect(slugify('  -- Тест -- ')).toBe('test');
  });

  it('результат соответствует допустимому формату адреса', () => {
    expect(isValidSlug(slugify('Кубок Крыма 2024 — финал!'))).toBe(true);
  });
});

describe('US3 @AS-9 @FR-012', () => {
  it('допускает только строчные латинские буквы, цифры и дефисы', () => {
    expect(isValidSlug('winter-cup-2023')).toBe(true);
    expect(isValidSlug('Winter-Cup')).toBe(false);
    expect(isValidSlug('winter_cup')).toBe(false);
    expect(isValidSlug('зимний-кубок')).toBe(false);
    expect(isValidSlug('')).toBe(false);
  });
});
