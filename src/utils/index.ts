// ISO文字列→「YYYY/MM/DD HH:mm」形式（ローカル時刻）
export function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString;
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const d = date.getDate().toString().padStart(2, '0');
  const hh = date.getHours().toString().padStart(2, '0');
  const mm = date.getMinutes().toString().padStart(2, '0');
  return `${y}/${m}/${d} ${hh}:${mm}`;
}
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
