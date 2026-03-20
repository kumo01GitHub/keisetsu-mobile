import {
  buildDeckDisplayNameFromFileName,
  buildCatalogUrl,
  buildGitHubRawUrl,
  getTailName,
  resolveDeckDisplayName,
  sanitizeFileName,
  shuffleArray,
  shuffleCards,
} from './index';

import type { Card } from '../types';

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

  test('buildGitHubRawUrl normalizes leading slash in dbPath', () => {
    const url = buildGitHubRawUrl({
      owner: 'kumo01GitHub',
      repo: 'keisetsu-database',
      refType: 'branch',
      refName: 'main',
      dbPath: '/databases/starter-basic.kdb',
      localImportDeckName: '',
      activeDbName: null,
      activeSource: 'sample',
    });

    expect(url).toBe(
      'https://raw.githubusercontent.com/kumo01GitHub/keisetsu-database/main/databases/starter-basic.kdb'
    );
  });

  test('buildDeckDisplayNameFromFileName strips extension and separators', () => {
    expect(buildDeckDisplayNameFromFileName('math-geometry.kdb')).toBe('math geometry');
    expect(buildDeckDisplayNameFromFileName('french_travel.sqlite3')).toBe('french travel');
  });

  test('resolveDeckDisplayName prefers metadata and falls back to filename', () => {
    expect(
      resolveDeckDisplayName('french-a1.kdb', {
        'french-a1.kdb': 'French A1',
      })
    ).toBe('French A1');

    expect(resolveDeckDisplayName('french-a1.kdb', {})).toBe('french a1');
  });

  test('resolveDeckDisplayName falls back to raw database name when filename is blank-like', () => {
    expect(resolveDeckDisplayName('.kdb', {})).toBe('.kdb');
  });

  test('shuffleArray keeps all values and does not mutate original', () => {
    const source = [1, 2, 3, 4, 5];
    const shuffled = shuffleArray(source);

    expect(shuffled).toHaveLength(source.length);
    expect([...shuffled].sort()).toEqual([...source].sort());
    expect(source).toEqual([1, 2, 3, 4, 5]);
  });

  test('shuffleCards delegates to generic shuffle without dropping cards', () => {
    const cards: Card[] = [
      { id: '1', term: 'a', summary: 'A' },
      { id: '2', term: 'b', summary: 'B' },
      { id: '3', term: 'c', summary: 'C' },
    ];

    const shuffled = shuffleCards(cards);

    expect(shuffled).toHaveLength(3);
    expect(shuffled.map((card) => card.id).sort()).toEqual(['1', '2', '3']);
    expect(cards.map((card) => card.id)).toEqual(['1', '2', '3']);
  });
});
