import type { Card, SourceConfig } from '../types';

export function shuffleArray<T>(items: T[]): T[] {
  const next = [...items];

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const current = next[index];
    next[index] = next[swapIndex];
    next[swapIndex] = current;
  }

  return next;
}

export function shuffleCards(cards: Card[]): Card[] {
  return shuffleArray(cards);
}

export function sanitizeFileName(value: string): string {
  return value.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/-+/g, '-');
}

export function getTailName(path: string): string {
  const segments = path.split('/').filter(Boolean);
  return segments[segments.length - 1] ?? 'deck.kdb';
}

export function buildGitHubRawUrl(config: SourceConfig): string {
  const normalizedPath = config.dbPath.replace(/^\/+/, '');
  return `https://raw.githubusercontent.com/${config.owner}/${config.repo}/${config.refName}/${normalizedPath}`;
}

export function buildCatalogUrl(config: Pick<SourceConfig, 'owner' | 'repo' | 'refName'>): string {
  return `https://raw.githubusercontent.com/${config.owner}/${config.repo}/${config.refName}/catalog/catalog.json`;
}

export function buildDeckDisplayNameFromFileName(databaseName: string): string {
  return databaseName
    .replace(/\.(kdb|db|sqlite|sqlite3)$/i, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function resolveDeckDisplayName(
  databaseName: string,
  deckDisplayNames: Record<string, string>
): string {
  const explicitName = deckDisplayNames[databaseName]?.trim();
  if (explicitName) {
    return explicitName;
  }

  const fallback = buildDeckDisplayNameFromFileName(databaseName);
  return fallback || databaseName;
}
