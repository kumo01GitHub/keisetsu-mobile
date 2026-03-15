import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { shared } from "../styles/shared";
import type { CatalogDeck, DeckOption, SourceConfig } from "../types";

const CATALOG_PAGE_SIZE = 10;

type Props = {
  activeDatabaseName: string | null;
  sourceConfig: SourceConfig;
  deckOptions: DeckOption[];
  catalogDecks: CatalogDeck[];
  catalogBusy: boolean;
  catalogAvailable: boolean;
  onSelectDeck: (databaseName: string) => void;
  onDeleteDatabase: (databaseName: string) => void;
  onOpenAdvancedSettings: () => void;
  onUpdateSourceConfig: (patch: Partial<SourceConfig>) => void;
  onFetchCatalog: () => void;
  onDownloadFromCatalog: (deck: CatalogDeck) => void;
  onImportLocalDatabase: (displayName: string) => void;
};

export function SourceScreen({
  activeDatabaseName,
  sourceConfig,
  deckOptions,
  catalogDecks,
  catalogBusy,
  catalogAvailable,
  onSelectDeck,
  onDeleteDatabase,
  onOpenAdvancedSettings,
  onUpdateSourceConfig,
  onFetchCatalog,
  onDownloadFromCatalog,
  onImportLocalDatabase,
}: Props) {
  const [catalogPage, setCatalogPage] = useState(1);

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
    ? "取得中…"
    : catalogDecks.length > 0
      ? "リフレッシュ"
      : "カタログを取得";

  return (
    <View style={shared.sectionStack}>
      <View style={shared.card}>
        <Text style={shared.sectionTitle}>単語帳を追加</Text>
        <Text style={shared.sectionText}>
          カタログを取得して、追加したい単語帳を選んでください。取得先を変えるときは詳細設定を開いてください。
        </Text>

        <View style={shared.actionsRow}>
          <Pressable
            onPress={onOpenAdvancedSettings}
            style={shared.secondaryButton}
          >
            <Text style={shared.secondaryButtonText}>詳細設定</Text>
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
            {catalogDecks.length}件中 {catalogPageStart}-{catalogPageEnd}
            件を表示
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
                <Text style={styles.catalogCount}>{deck.cardCount}件</Text>
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
              <Text style={styles.addButtonText}>追加</Text>
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
              <Text style={styles.pagerButtonText}>前へ</Text>
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
              <Text style={styles.pagerButtonText}>次へ</Text>
            </Pressable>
          </View>
        ) : null}

        {!catalogAvailable && !catalogBusy ? (
          <Text style={styles.offlineHint}>
            catalog.json を取得できないため、GitHubからの追加は利用できません。
            取得ボタンで再試行してください。
          </Text>
        ) : null}
      </View>

      <View style={shared.card}>
        <Text style={shared.sectionTitle}>端末から単語帳を追加</Text>
        <Text style={shared.sectionText}>
          Filesなどから単語帳ファイルを選んで追加します。端末の中を自動で探すことはしないので、使いたいファイルを自分で選んでください。
        </Text>

        <Text style={styles.label}>追加時の単語帳名</Text>
        <TextInput
          value={sourceConfig.localImportDeckName}
          onChangeText={(value) =>
            onUpdateSourceConfig({ localImportDeckName: value })
          }
          style={styles.input}
          placeholder="例: TOEIC 基本"
          placeholderTextColor="#9ca3af"
        />

        <Pressable
          onPress={() =>
            onImportLocalDatabase(sourceConfig.localImportDeckName)
          }
          style={shared.primaryButton}
        >
          <Text style={shared.primaryButtonText}>単語帳ファイルを選ぶ</Text>
        </Pressable>
      </View>

      <View style={shared.card}>
        <Text style={shared.sectionTitle}>使える単語帳</Text>
        <Text style={shared.sectionText}>
          追加した単語帳の一覧です。学習とテストで使う単語帳は、各画面の上にある選択欄から切り替えられます。
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
                    ? "いま使っている単語帳です"
                    : "あとで選べるように保存されています"}
                </Text>
              </View>

              <View style={styles.databaseActions}>
                <Pressable
                  onPress={() => onDeleteDatabase(deckOption.databaseName)}
                  style={styles.deleteButton}
                >
                  <Text style={styles.deleteButtonText}>削除</Text>
                </Pressable>
              </View>
            </View>
          ))
        ) : (
          <Text style={shared.emptyText}>まだ追加した単語帳はありません。</Text>
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
    color: "#0f766e",
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
    color: "#0f766e",
    fontWeight: "700",
    marginTop: 2,
  },
  addButton: {
    backgroundColor: "#0f766e",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  addButtonText: {
    color: "#f0fdfa",
    fontWeight: "700",
  },
});
