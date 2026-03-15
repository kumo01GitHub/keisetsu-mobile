export type Screen = 'source' | 'study' | 'test';
export type RefType = 'branch' | 'tag';
export type SourceKind = 'sample' | 'downloaded' | 'imported';

export type Card = {
  id: string;
  term: string;
  summary: string;
  detail?: string;
  category?: string;
};

export type SourceConfig = {
  owner: string;
  repo: string;
  refType: RefType;
  refName: string;
  dbPath: string;
  localImportDeckName: string;
  activeDbName: string | null;
  activeSource: SourceKind;
};

export type TestScore = {
  correct: number;
  incorrect: number;
};

export type TestMistake = {
  term: string;
  summary: string;
};

export type TestRecord = TestScore & {
  finishedAt: string;
  total: number;
  databaseLabel: string;
  mistakes?: TestMistake[];
};

export type CardRow = {
  id: string;
  term: string;
  summary: string;
  detail: string | null;
  category: string | null;
};

export type DeckOption = {
  databaseName: string;
  displayName: string;
};

export type CatalogDeck = {
  id: string;
  title: string;
  description?: string;
  path: string;
  language?: string;
  cardCount?: number;
};
