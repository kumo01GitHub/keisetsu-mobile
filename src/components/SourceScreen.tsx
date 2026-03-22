import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { COLORS, shared } from "../styles/shared";
import type { CatalogDeck, DeckOption, SourceConfig } from "../types";

const CATALOG_PAGE_SIZE = 10;

/**
 * Props for the source screen, covering catalog access, local imports, and saved deck management.
 */
type Props = {
  /** Currently selected local database file, or null when nothing is active. */
  activeDatabaseName: string | null;
  /** Editable source configuration state for local import and remote catalog settings. */
  sourceConfig: SourceConfig;
  /** Decks already stored on the device. */
  deckOptions: DeckOption[];
  /** Remote catalog entries available for download. */
  catalogDecks: CatalogDeck[];
  /** Whether a catalog fetch is currently in progress. */
  catalogBusy: boolean;
  /** Whether remote catalog operations are available in the current environment. */
  catalogAvailable: boolean;
  /** Switches the active deck. */
  onSelectDeck: (databaseName: string) => void;
  /** Removes a saved local database file. */
  onDeleteDatabase: (databaseName: string) => void;
  /** Opens advanced source configuration. */
  onOpenAdvancedSettings: () => void;
  /** Updates source configuration state. */
  onUpdateSourceConfig: (patch: Partial<SourceConfig>) => void;
  /** Fetches or refreshes the remote deck catalog. */
  onFetchCatalog: () => void;
  /** Downloads a deck from the remote catalog. */
  onDownloadFromCatalog: (deck: CatalogDeck) => void;
  /** Imports a local database file under the provided display name. */
  onImportLocalDatabase: (displayName: string) => void;
};

/**
 * Source management screen for downloading catalog decks, importing local files, and managing saved decks.
 */
export function SourceScreen({
  activeDatabaseName,
  sourceConfig,
  deckOptions,
  catalogDecks,
  catalogBusy,
  catalogAvailable,
  onDeleteDatabase,
  onOpenAdvancedSettings,
  onUpdateSourceConfig,
  onFetchCatalog,
  onDownloadFromCatalog,
  onImportLocalDatabase,
}: Props) {
  const [catalogPage, setCatalogPage] = useState(1);
  const { t } = useTranslation();

  useEffect(() => {
    setCatalogPage(1);
  }, [catalogDecks]);

  const totalCatalogPages = Math.max(
    1,
    Math.ceil(catalogDecks.length / CATALOG_PAGE_SIZE),
  );
  const currentCatalogPage = Math.min(catalogPage, totalCatalogPages);
  const pagedCatalogDecks = useMemo(() => {
    const start = (currentCatalogPage - 1) * CATALOG_PAGE_SIZE;
    return catalogDecks.slice(start, start + CATALOG_PAGE_SIZE);
  }, [catalogDecks, currentCatalogPage]);
  const catalogPageStart = (currentCatalogPage - 1) * CATALOG_PAGE_SIZE + 1;
  const catalogPageEnd = Math.min(
    currentCatalogPage * CATALOG_PAGE_SIZE,
    catalogDecks.length,
  );
  const fetchButtonLabel = catalogBusy
    ? t("source.fetching")
    : catalogDecks.length > 0
      ? t("source.refresh")
      : t("source.fetchCatalog");

  return (
    <View style={shared.sectionStack}>
      <View style={shared.card}>
        <Text style={shared.sectionTitle}>{t("source.addDeckTitle")}</Text>
        <Text style={shared.sectionText}>{t("source.addDeckDescription")}</Text>
        <View style={shared.actionsRow}>
          <Pressable
            onPress={onOpenAdvancedSettings}
            style={shared.secondaryButton}
          >
            <Text style={shared.secondaryButtonText}>
              {t("source.advancedSettings")}
            </Text>
          </Pressable>
          <Pressable
            onPress={onFetchCatalog}
            disabled={catalogBusy}
            style={[shared.primaryButton, catalogBusy && styles.disabledButton]}
          >
            <Text style={shared.primaryButtonText}>{fetchButtonLabel}</Text>
          </Pressable>
        </View>

        {catalogDecks.length > 0 ? (
          <Text style={styles.catalogPageStatus}>
            {t("source.paginationStatus", {
              count: catalogDecks.length,
              start: catalogPageStart,
              end: catalogPageEnd,
            })}
          </Text>
        ) : null}

        {pagedCatalogDecks.map((deck) => (
          <View key={deck.id} style={styles.catalogItem}>
            <View style={styles.catalogMeta}>
              <Text style={styles.catalogTitle}>{deck.title}</Text>
              {deck.description ? (
                <Text style={styles.catalogDesc}>{deck.description}</Text>
              ) : null}
              {deck.cardCount != null ? (
                <Text style={styles.catalogCount}>
                  {t("source.cardCount", { count: deck.cardCount })}
                </Text>
              ) : null}
            </View>
            <Pressable
              onPress={() => onDownloadFromCatalog(deck)}
              disabled={!catalogAvailable}
              style={[
                styles.addButton,
                !catalogAvailable && styles.disabledButton,
              ]}
            >
              <Text style={styles.addButtonText}>{t("action.add")}</Text>
            </Pressable>
          </View>
        ))}

        {catalogDecks.length > CATALOG_PAGE_SIZE ? (
          <View style={styles.pagerRow}>
            <Pressable
              onPress={() => setCatalogPage((page) => Math.max(1, page - 1))}
              disabled={currentCatalogPage <= 1}
              style={[
                styles.pagerButton,
                currentCatalogPage <= 1 && styles.disabledButton,
              ]}
            >
              <Text style={styles.pagerButtonText}>{t("action.prev")}</Text>
            </Pressable>

            <Text style={styles.pagerLabel}>
              {currentCatalogPage} / {totalCatalogPages}
            </Text>

            <Pressable
              onPress={() =>
                setCatalogPage((page) => Math.min(totalCatalogPages, page + 1))
              }
              disabled={currentCatalogPage >= totalCatalogPages}
              style={[
                styles.pagerButton,
                currentCatalogPage >= totalCatalogPages &&
                  styles.disabledButton,
              ]}
            >
              <Text style={styles.pagerButtonText}>{t("action.next")}</Text>
            </Pressable>
          </View>
        ) : null}

        {!catalogAvailable && !catalogBusy ? (
          <Text style={styles.offlineHint}>{t("source.offlineHint")}</Text>
        ) : null}
      </View>

      <View style={shared.card}>
        <Text style={shared.sectionTitle}>{t("source.localAddTitle")}</Text>
        <Text style={shared.sectionText}>
          {t("source.localAddDescription")}
        </Text>

        <Text style={styles.label}>{t("source.deckNameLabel")}</Text>
        <TextInput
          value={sourceConfig.localImportDeckName}
          onChangeText={(value) =>
            onUpdateSourceConfig({ localImportDeckName: value })
          }
          style={styles.input}
          placeholder={t("source.deckNamePlaceholder")}
          placeholderTextColor="#9ca3af"
        />

        <Pressable
          onPress={() =>
            onImportLocalDatabase(sourceConfig.localImportDeckName)
          }
          style={shared.primaryButton}
        >
          <Text style={shared.primaryButtonText}>{t("source.selectFile")}</Text>
        </Pressable>
      </View>

      <View style={shared.card}>
        <Text style={shared.sectionTitle}>{t("source.savedDecksTitle")}</Text>
        <Text style={shared.sectionText}>
          {t("source.savedDecksDescription")}
        </Text>
        {deckOptions.length ? (
          deckOptions.map((deckOption) => (
            <View
              key={deckOption.databaseName}
              style={[
                styles.databaseRow,
                activeDatabaseName === deckOption.databaseName &&
                  styles.databaseRowActive,
              ]}
            >
              <View style={styles.databaseMeta}>
                <Text style={styles.databaseName}>
                  {deckOption.displayName}
                </Text>
                <Text style={styles.databaseHint}>
                  {activeDatabaseName === deckOption.databaseName
                    ? t("source.activeDeckHint")
                    : t("source.savedDeckHint")}
                </Text>
              </View>

              <View style={styles.databaseActions}>
                <Pressable
                  onPress={() => onDeleteDatabase(deckOption.databaseName)}
                  style={styles.deleteButton}
                >
                  <Text style={styles.deleteButtonText}>
                    {t("action.delete")}
                  </Text>
                </Pressable>
              </View>
            </View>
          ))
        ) : (
          <Text style={shared.emptyText}>{t("source.noSavedDecks")}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
  },
  input: {
    backgroundColor: "#f4efe5",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#111827",
  },
  disabledButton: {
    opacity: 0.45,
  },
  offlineHint: {
    color: "#b45309",
    fontWeight: "700",
    lineHeight: 20,
  },
  catalogPageStatus: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.accent,
  },
  pagerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  pagerButton: {
    backgroundColor: "#dcfce7",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  pagerButtonText: {
    color: "#166534",
    fontWeight: "800",
  },
  pagerLabel: {
    color: "#374151",
    fontWeight: "700",
  },
  databaseRow: {
    backgroundColor: "#f8f5ec",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  databaseRowActive: {
    backgroundColor: "#d9f99d",
  },
  databaseMeta: {
    flex: 1,
    paddingRight: 12,
  },
  databaseActions: {
    alignItems: "flex-end",
    gap: 8,
  },
  databaseName: {
    fontWeight: "800",
    color: "#1f2937",
  },
  databaseHint: {
    color: "#6b7280",
    marginTop: 4,
  },
  deleteButton: {
    backgroundColor: "#fee2e2",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  deleteButtonText: {
    color: "#b91c1c",
    fontWeight: "800",
  },
  catalogItem: {
    backgroundColor: "#f8f5ec",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  catalogMeta: {
    flex: 1,
    paddingRight: 10,
  },
  catalogTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  catalogDesc: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 3,
    lineHeight: 18,
  },
  catalogCount: {
    fontSize: 12,
    color: COLORS.accent,
    fontWeight: "700",
    marginTop: 2,
  },
  addButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  addButtonText: {
    color: "#f0fdfa",
    fontWeight: "700",
  },
});
