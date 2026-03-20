import { Directory, File } from "expo-file-system";
import * as SQLite from "expo-sqlite";

import i18n from "../i18n";
import type { Card, CardRow } from "../types";

/**
 * Minimal deck identity stored alongside card content in each local database.
 */
export type DeckMetadata = {
  /** Human-readable deck name shown in the UI. */
  displayName: string;
  /** File name persisted in deck metadata and catalog manifests. */
  fileName: string;
};

const DECK_METADATA_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS deck_metadata (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    display_name TEXT NOT NULL,
    file_name TEXT NOT NULL,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`;

/**
 * Returns the directory where Expo SQLite stores local deck databases.
 */
export function getDatabaseDirectory(): Directory {
  return new Directory(SQLite.defaultDatabaseDirectory);
}

/**
 * Loads cards from a local database file and maps legacy schemas to the app's current card model.
 */
export async function readCardsFromDatabase(
  databaseName: string,
): Promise<Card[]> {
  const database = await SQLite.openDatabaseAsync(
    databaseName,
    undefined,
    SQLite.defaultDatabaseDirectory,
  );

  try {
    const cardsTable = await database.getFirstAsync<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'cards'",
    );

    if (!cardsTable) {
      throw new Error(i18n.t('error.invalidDeckFile'));
    }

    const columns = await database.getAllAsync<{ name: string }>(
      "PRAGMA table_info(cards)",
    );
    const columnNames = new Set(columns.map((column) => column.name));
    const summaryColumn = columnNames.has("summary")
      ? "summary"
      : columnNames.has("meaning")
        ? "meaning"
        : null;
    const detailColumn = columnNames.has("detail")
      ? "detail"
      : columnNames.has("example")
        ? "example"
        : null;

    if (!summaryColumn) {
      throw new Error(i18n.t('error.missingColumns'));
    }

    const detailSelect = detailColumn
      ? `COALESCE(${detailColumn}, '') AS detail`
      : "'' AS detail";

    const rows = await database.getAllAsync<CardRow>(
      `SELECT CAST(id AS TEXT) AS id, term, ${summaryColumn} AS summary, ${detailSelect}, COALESCE(category, '') AS category
       FROM cards
       ORDER BY term COLLATE NOCASE`,
    );

    if (!rows.length) {
      throw new Error(i18n.t('error.emptyDeck'));
    }

    return rows.map((row) => ({
      id: row.id,
      term: row.term,
      summary: row.summary,
      detail: row.detail ?? "",
      category: row.category ?? "",
    }));
  } finally {
    await database.closeAsync();
  }
}

/**
 * Lists user-visible deck database files while excluding SQLite sidecar artifacts.
 */
export async function listDatabaseNames(): Promise<string[]> {
  const directory = getDatabaseDirectory();
  directory.create({ idempotent: true, intermediates: true });

  return directory
    .list()
    .filter((entry): entry is File => entry instanceof File)
    .filter((entry) => /\.(kdb|db|sqlite|sqlite3)$/i.test(entry.name))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));
}

/**
 * Reads deck metadata when available without requiring every imported file to be fully normalized.
 */
export async function readDeckMetadata(
  databaseName: string,
): Promise<DeckMetadata | null> {
  const database = await SQLite.openDatabaseAsync(
    databaseName,
    undefined,
    SQLite.defaultDatabaseDirectory,
  );

  try {
    const metadataTable = await database.getFirstAsync<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'deck_metadata'",
    );

    if (!metadataTable) {
      return null;
    }

    const row = await database.getFirstAsync<{
      display_name: string;
      file_name: string;
    }>(
      `SELECT display_name, file_name
       FROM deck_metadata
       ORDER BY id ASC
       LIMIT 1`,
    );

    if (!row?.display_name?.trim()) {
      return null;
    }

    return {
      displayName: row.display_name.trim(),
      fileName: row.file_name?.trim() || databaseName,
    };
  } finally {
    await database.closeAsync();
  }
}

/**
 * Creates or updates the single metadata row used to label a local deck database.
 */
export async function upsertDeckMetadata(
  databaseName: string,
  metadata: DeckMetadata,
): Promise<void> {
  const database = await SQLite.openDatabaseAsync(
    databaseName,
    undefined,
    SQLite.defaultDatabaseDirectory,
  );

  try {
    await database.execAsync(DECK_METADATA_TABLE_SQL);
    await database.runAsync(
      `INSERT INTO deck_metadata (id, display_name, file_name, updated_at)
       VALUES (1, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(id)
       DO UPDATE SET
         display_name = excluded.display_name,
         file_name = excluded.file_name,
         updated_at = CURRENT_TIMESTAMP`,
      metadata.displayName.trim(),
      metadata.fileName.trim() || databaseName,
    );
  } finally {
    await database.closeAsync();
  }
}

/**
 * Deletes a local database file if it exists.
 */
export function deleteDatabaseFile(databaseName: string): void {
  const targetFile = new File(SQLite.defaultDatabaseDirectory, databaseName);

  if (targetFile.exists) {
    targetFile.delete();
  }
}
