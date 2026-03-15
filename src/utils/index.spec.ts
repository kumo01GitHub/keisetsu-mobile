import {
  buildCatalogUrl,
  getTailName,
  resolveDeckDisplayName,
  sanitizeFileName,
  shuffleArray,
} from './index';

describe('utils', () => {
  test('sanitizeFileName replaces unsafe characters', () => {
    expect(sanitizeFileName('abc / def?.kdb')).toBe('abc-def-.kdb');
  });

  test('getTailName returns last segment', () => {
    expect(getTailName('/databases/starter-basic.kdb')).toBe('starter-basic.kdb');
    expect(getTailName('')).toBe('deck.kdb');
  });

  test('buildCatalogUrl builds GitHub raw URL', () => {
    const url = buildCatalogUrl({
      owner: 'kumo01GitHub',
      repo: 'keisetsu-database',
      refName: 'main',
    });

    expect(url).toBe(
      'https://raw.githubusercontent.com/kumo01GitHub/keisetsu-database/main/catalog/catalog.json'
    );
  });

  test('resolveDeckDisplayName prefers metadata and falls back to filename', () => {
    expect(
      resolveDeckDisplayName('french-a1.kdb', {
        'french-a1.kdb': 'French A1',
      })
    ).toBe('French A1');

    expect(resolveDeckDisplayName('french-a1.kdb', {})).toBe('french a1');
  });

  test('shuffleArray keeps all values and does not mutate original', () => {
    const source = [1, 2, 3, 4, 5];
    const shuffled = shuffleArray(source);

    expect(shuffled).toHaveLength(source.length);
    expect([...shuffled].sort()).toEqual([...source].sort());
    expect(source).toEqual([1, 2, 3, 4, 5]);
  });
});
