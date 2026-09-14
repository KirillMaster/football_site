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

  it('принимает дефисы в начале и конце (валиден формат)', () => {
    expect(isValidSlug('-winter-cup')).toBe(true);
    expect(isValidSlug('winter-cup-')).toBe(true);
  });

  it('отказывает на пробел', () => {
    expect(isValidSlug('winter cup')).toBe(false);
  });

  it('принимает цифры в начале и конце', () => {
    expect(isValidSlug('2023-winter-cup')).toBe(true);
    expect(isValidSlug('winter-cup-2023')).toBe(true);
  });

  it('принимает длинные slugs (валидатор не проверяет длину)', () => {
    const longSlug = 'a'.repeat(500);
    expect(isValidSlug(longSlug)).toBe(true);
  });
});

describe('US3 @AS-8 @FR-011 — граничные случаи slugify', () => {
  it('идемпотентность: уже валидный slug не изменяется', () => {
    const validSlug = 'pobeda-komandy';
    expect(slugify(validSlug)).toBe(validSlug);
  });

  it('пустой заголовок → пустой slug', () => {
    expect(slugify('')).toBe('');
  });

  it('только пробелы → пустой slug', () => {
    expect(slugify('   ')).toBe('');
  });

  it('только дефисы → пустой slug', () => {
    expect(slugify('---')).toBe('');
  });

  it('дефис в начале и конце обрезаются', () => {
    expect(slugify('-Тест-')).toBe('test');
  });

  it('множественные дефисы схлопываются', () => {
    expect(slugify('Привет   мир---это тест')).toBe('privet-mir-eto-test');
  });

  it('очень длинный заголовок обрезается до 200 символов', () => {
    const longTitle = 'Победа'.repeat(50);
    const result = slugify(longTitle);
    expect(result.length).toBeLessThanOrEqual(200);
  });

  it('цифры сохраняются', () => {
    expect(slugify('Кубок 2024 года')).toBe('kubok-2024-goda');
  });

  it('специальные символы → дефис', () => {
    const result = slugify('Первое: второе, третье!');
    expect(result).toBe('pervoe-vtoroe-trete');
    expect(result.length).toBeLessThanOrEqual(200);
  });

  it('слэш → дефис', () => {
    expect(slugify('Сезон 2023/24')).toBe('sezon-2023-24');
  });
});
