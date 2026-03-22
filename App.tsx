import * as DocumentPicker from "expo-document-picker";
import { File } from "expo-file-system";
import * as SQLite from "expo-sqlite";
import Storage from "expo-sqlite/kv-store";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import "./src/i18n";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import { AppHeader } from "./src/components/AppHeader";
import { FooterNav } from "./src/components/FooterNav";
import { SourceScreen } from "./src/components/SourceScreen";
import { SourceSettingsScreen } from "./src/components/SourceSettingsScreen";
import { StudyScreen } from "./src/components/StudyScreen";
import { TestScreen } from "./src/components/TestScreen";
import {
  DEFAULT_SOURCE_CONFIG,
  SAMPLE_CARDS,
  STORAGE_KEYS,
} from "./src/constants";
import {
  deleteDatabaseFile,
  getDatabaseDirectory,
  listDatabaseNames,
  readDeckMetadata,
  readCardsFromDatabase,
  upsertDeckMetadata,
} from "./src/services/database";
import { COLORS } from "./src/styles/shared";
import type {
  Card,
  CatalogDeck,
  DeckOption,
  Screen,
  SourceConfig,
  SourceKind,
  TestMistake,
  TestRecord,
  TestScore,
} from "./src/types";
import {
  buildCatalogUrl,
  getTailName,
  resolveDeckDisplayName,
  sanitizeFileName,
  shuffleCards,
} from "./src/utils";

const TEST_QUESTION_COUNT = 10;

function buildTestQueue(cards: Card[]): Card[] {
  return shuffleCards(cards).slice(0, TEST_QUESTION_COUNT);
}

export default function App() {
  const { t } = useTranslation();
  const [screen, setScreen] = useState<Screen | "source-settings">("study");
  const [sourceConfig, setSourceConfig] = useState<SourceConfig>(
    DEFAULT_SOURCE_CONFIG,
  );
  const [cards, setCards] = useState<Card[]>(SAMPLE_CARDS);
  const [selectedStudyCardId, setSelectedStudyCardId] = useState<string | null>(
    SAMPLE_CARDS[0]?.id ?? null,
  );
  const [databaseNames, setDatabaseNames] = useState<string[]>([]);
  const [deckDisplayNames, setDeckDisplayNames] = useState<
    Record<string, string>
  >({});
  const [busyMessage, setBusyMessage] = useState<string | null>(
    t("loading.preparing"),
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [testQueue, setTestQueue] = useState<Card[]>(
    buildTestQueue(SAMPLE_CARDS),
  );
  const [testIndex, setTestIndex] = useState(0);
  const [testMistakes, setTestMistakes] = useState<TestMistake[]>([]);
  const [testScore, setTestScore] = useState<TestScore>({
    correct: 0,
    incorrect: 0,
  });
  const [testComplete, setTestComplete] = useState(false);
  const [testHistory, setTestHistory] = useState<TestRecord[]>([]);
  const [catalogAvailable, setCatalogAvailable] = useState(false);
  const [catalogDecks, setCatalogDecks] = useState<CatalogDeck[]>([]);
  const [catalogBusy, setCatalogBusy] = useState(false);

  useEffect(() => {
    bootstrap();
  }, []);

  useEffect(() => {
    if (screen === "source-settings") {
      return;
    }

    refreshDatabaseNames();

    if (screen === "source") {
      fetchCatalog();
    }
  }, [screen]);

  async function bootstrap() {
    try {
      const directory = getDatabaseDirectory();
      directory.create({ idempotent: true, intermediates: true });

      const [storedConfig, storedHistory, availableDatabases] =
        await Promise.all([
          Storage.getItem(STORAGE_KEYS.sourceConfig),
          Storage.getItem(STORAGE_KEYS.testHistory),
          listDatabaseNames(),
        ]);

      const parsedConfig = storedConfig
        ? ({
            ...DEFAULT_SOURCE_CONFIG,
            ...JSON.parse(storedConfig),
          } as SourceConfig)
        : DEFAULT_SOURCE_CONFIG;
      const parsedHistory = storedHistory
        ? (JSON.parse(storedHistory) as TestRecord[])
        : [];
      const nextDeckDisplayNames =
        await loadDeckDisplayNames(availableDatabases);
      const fallbackDatabaseName = availableDatabases[0] ?? null;
      const hydratedConfig =
        parsedConfig.activeDbName &&
        availableDatabases.includes(parsedConfig.activeDbName)
          ? parsedConfig
          : fallbackDatabaseName
            ? {
                ...parsedConfig,
                activeDbName: fallbackDatabaseName,
                activeSource: "imported" as const,
              }
            : {
                ...parsedConfig,
                activeDbName: null,
                activeSource: "sample" as const,
              };

      setSourceConfig(hydratedConfig);
      setTestHistory(parsedHistory);
      setDatabaseNames(availableDatabases);
      setDeckDisplayNames(nextDeckDisplayNames);

      if (hydratedConfig.activeDbName) {
        const loadedCards = await readCardsFromDatabase(
          hydratedConfig.activeDbName,
        );
        applyCards(loadedCards);
      } else {
        applyCards(SAMPLE_CARDS);
      }

      if (hydratedConfig !== parsedConfig) {
        await Storage.setItem(
          STORAGE_KEYS.sourceConfig,
          JSON.stringify(hydratedConfig),
        );
      }
    } catch (error) {
      applyCards(SAMPLE_CARDS);
      setErrorMessage(
        error instanceof Error ? error.message : t("error.initFailed"),
      );
    } finally {
      setBusyMessage(null);
    }
  }

  function applyCards(nextCards: Card[]) {
    setCards(nextCards);
    setSelectedStudyCardId(nextCards[0]?.id ?? null);
    setTestQueue(buildTestQueue(nextCards));
    setTestIndex(0);
    setTestMistakes([]);
    setTestScore({ correct: 0, incorrect: 0 });
    setTestComplete(false);
  }

  function updateSourceConfig(patch: Partial<SourceConfig>) {
    setSourceConfig((current) => {
      const next = { ...current, ...patch };
      Storage.setItem(STORAGE_KEYS.sourceConfig, JSON.stringify(next));
      return next;
    });
  }

  async function loadDeckDisplayNames(
    names: string[],
  ): Promise<Record<string, string>> {
    const entries = await Promise.all(
      names.map(async (databaseName) => {
        const metadata = await readDeckMetadata(databaseName);
        return [databaseName, metadata?.displayName?.trim() ?? ""] as const;
      }),
    );

    return Object.fromEntries(
      entries.filter(([, displayName]) => Boolean(displayName)),
    );
  }

  async function refreshDatabaseNames() {
    const nextNames = await listDatabaseNames();
    setDatabaseNames(nextNames);

    const nextDeckDisplayNames = await loadDeckDisplayNames(nextNames);
    setDeckDisplayNames(nextDeckDisplayNames);
  }

  function resolveActiveDatabaseLabel() {
    if (!sourceConfig.activeDbName) {
      return t("deck.sampleDeck");
    }

    return resolveDeckDisplayName(sourceConfig.activeDbName, deckDisplayNames);
  }

  async function activateDatabase(
    databaseName: string,
    activeSource: SourceKind,
    nextScreen: Screen = "study",
  ) {
    setBusyMessage(t("loading.openingDeck"));
    setErrorMessage(null);

    try {
      const loadedCards = await readCardsFromDatabase(databaseName);
      applyCards(loadedCards);
      updateSourceConfig({ activeDbName: databaseName, activeSource });
      await refreshDatabaseNames();
      setScreen(nextScreen);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t("error.openDeckFailed");
      setErrorMessage(message);
      Alert.alert(t("error.cannotOpenDeck"), message);
    } finally {
      setBusyMessage(null);
    }
  }

  async function fetchCatalog() {
    const url = buildCatalogUrl(sourceConfig);
    setCatalogBusy(true);
    setErrorMessage(null);

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(
          t("error.catalogHttpFailed", { status: response.status }),
        );
      }

      const data = (await response.json()) as {
        decks?: (CatalogDeck | { id: string; manifest: string })[];
      };

      const decks = data.decks ?? [];
      const baseUrl = `https://raw.githubusercontent.com/${sourceConfig.owner}/${sourceConfig.repo}/${sourceConfig.refName}`;

      const resolvedDecks = await Promise.all(
        decks.map(async (deck) => {
          if ("manifest" in deck) {
            const manifestPath = deck.manifest.replace(/^\/+/, "");
            const manifestUrl = `${baseUrl}/catalog/${manifestPath}`;
            const manifestResponse = await fetch(manifestUrl);

            if (!manifestResponse.ok) {
              throw new Error(
                t("error.deckInfoHttpFailed", {
                  id: deck.id,
                  status: manifestResponse.status,
                }),
              );
            }

            return (await manifestResponse.json()) as CatalogDeck;
          }

          return deck;
        }),
      );

      setCatalogDecks(resolvedDecks);
      setCatalogAvailable(true);
    } catch (error) {
      setCatalogAvailable(false);
      setCatalogDecks([]);
      const message =
        error instanceof Error ? error.message : t("error.catalogFetchFailed");
      setErrorMessage(message);
      Alert.alert(t("error.cannotFetchCatalog"), message);
    } finally {
      setCatalogBusy(false);
    }
  }

  async function downloadFromCatalog(deck: CatalogDeck) {
    const ref = sourceConfig.refName;
    const normalizedPath = deck.path.replace(/^\/+/, "");
    const rawUrl = `https://raw.githubusercontent.com/${sourceConfig.owner}/${sourceConfig.repo}/${ref}/${normalizedPath}`;
    const targetName = sanitizeFileName(
      `${sourceConfig.owner}-${sourceConfig.repo}-${ref}-${getTailName(deck.path)}`,
    );

    setBusyMessage(t("loading.addingDeckFromGitHub"));
    setErrorMessage(null);

    try {
      const response = await fetch(rawUrl);

      if (!response.ok) {
        throw new Error(
          t("error.githubHttpFailed", { status: response.status }),
        );
      }

      const bytes = new Uint8Array(await response.arrayBuffer());
      const targetFile = new File(SQLite.defaultDatabaseDirectory, targetName);
      targetFile.parentDirectory.create({
        idempotent: true,
        intermediates: true,
      });

      if (targetFile.exists) {
        targetFile.delete();
      }

      targetFile.create({ overwrite: true, intermediates: true });
      targetFile.write(bytes);

      await upsertDeckMetadata(targetName, {
        displayName: deck.title,
        fileName: targetName,
      });

      await activateDatabase(targetName, "downloaded", "study");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : t("error.addDeckFromGitHubFailed");
      setErrorMessage(message);
      Alert.alert(t("error.cannotAddDeck"), message);
      setBusyMessage(null);
    }
  }

  async function importLocalDatabase(displayName: string) {
    const normalizedDisplayName = displayName.trim();

    if (!normalizedDisplayName) {
      Alert.alert(t("error.deckNameRequired"));
      return;
    }

    setErrorMessage(null);

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const asset = result.assets[0];
      const sourceFile = new File(asset.uri);
      const targetName = sanitizeFileName(asset.name || getTailName(asset.uri));
      const targetFile = new File(SQLite.defaultDatabaseDirectory, targetName);
      targetFile.parentDirectory.create({
        idempotent: true,
        intermediates: true,
      });

      if (targetFile.exists) {
        targetFile.delete();
      }

      sourceFile.copy(targetFile);
      await upsertDeckMetadata(targetName, {
        displayName: normalizedDisplayName,
        fileName: targetName,
      });

      updateSourceConfig({ localImportDeckName: "" });
      await activateDatabase(targetName, "imported", "study");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t("error.addLocalDeckFailed");
      setErrorMessage(message);
      Alert.alert(t("error.cannotAddDeck"), message);
    }
  }

  async function switchToSampleDeck(nextScreen: Screen = "study") {
    applyCards(SAMPLE_CARDS);
    updateSourceConfig({ activeDbName: null, activeSource: "sample" });
    await refreshDatabaseNames();
    setScreen(nextScreen);
  }

  async function selectDeck(databaseName: string | null, nextScreen: Screen) {
    if (!databaseName) {
      if (databaseNames.length > 0) {
        await activateDatabase(databaseNames[0], "imported", nextScreen);
        return;
      }

      await switchToSampleDeck(nextScreen);
      return;
    }

    const activeSource =
      sourceConfig.activeDbName === databaseName
        ? sourceConfig.activeSource
        : "imported";
    await activateDatabase(databaseName, activeSource, nextScreen);
  }

  async function deleteDatabase(databaseName: string) {
    const isActiveDatabase = sourceConfig.activeDbName === databaseName;

    setBusyMessage(t("loading.deletingDeck"));
    setErrorMessage(null);

    try {
      deleteDatabaseFile(databaseName);

      if (isActiveDatabase) {
        const remainingDatabaseNames = databaseNames.filter(
          (name) => name !== databaseName,
        );
        const fallbackDatabaseName = remainingDatabaseNames[0] ?? null;

        if (fallbackDatabaseName) {
          const loadedCards = await readCardsFromDatabase(fallbackDatabaseName);
          applyCards(loadedCards);
          updateSourceConfig({
            activeDbName: fallbackDatabaseName,
            activeSource: "imported",
          });
        } else {
          applyCards(SAMPLE_CARDS);
          updateSourceConfig({ activeDbName: null, activeSource: "sample" });
        }
      }

      if (deckDisplayNames[databaseName]) {
        const nextDeckDisplayNames = { ...deckDisplayNames };
        delete nextDeckDisplayNames[databaseName];
        setDeckDisplayNames(nextDeckDisplayNames);
      }

      await refreshDatabaseNames();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t("error.deleteDeckFailed");
      setErrorMessage(message);
      Alert.alert(t("error.deleteFailed"), message);
    } finally {
      setBusyMessage(null);
    }
  }

  function confirmDeleteDatabase(databaseName: string) {
    const displayName = resolveDeckDisplayName(databaseName, deckDisplayNames);
    const description =
      sourceConfig.activeDbName === databaseName
        ? t("confirm.deleteActiveMessage")
        : t("confirm.deleteInactiveMessage");

    Alert.alert(t("confirm.deleteTitle"), `${displayName}\n\n${description}`, [
      { text: t("action.cancel"), style: "cancel" },
      {
        text: t("action.delete"),
        style: "destructive",
        onPress: () => {
          deleteDatabase(databaseName);
        },
      },
    ]);
  }

  function startNewTest() {
    setTestQueue(buildTestQueue(cards));
    setTestIndex(0);
    setTestMistakes([]);
    setTestScore({ correct: 0, incorrect: 0 });
    setTestComplete(false);
  }

  async function saveTestRecord(
    nextScore: TestScore,
    mistakes: TestMistake[],
    results: { term: string; summary: string; correct: boolean }[],
  ) {
    const nextHistory = [
      {
        ...nextScore,
        total: testQueue.length,
        finishedAt: new Date().toISOString(),
        databaseLabel: resolveActiveDatabaseLabel(),
        mistakes,
        results,
      },
      ...testHistory,
    ].slice(0, 8);

    setTestHistory(nextHistory);
    await Storage.setItem(
      STORAGE_KEYS.testHistory,
      JSON.stringify(nextHistory),
    );
  }

  const [testResults, setTestResults] = useState<
    { term: string; summary: string; correct: boolean }[]
  >([]);

  async function answerTest(correct: boolean) {
    const currentCard = testQueue[testIndex];
    const nextMistakes =
      !correct && currentCard
        ? [
            ...testMistakes,
            { term: currentCard.term, summary: currentCard.summary },
          ]
        : testMistakes;

    if (!correct && currentCard) {
      setTestMistakes(nextMistakes);
    }

    const nextScore = {
      correct: testScore.correct + (correct ? 1 : 0),
      incorrect: testScore.incorrect + (correct ? 0 : 1),
    };

    setTestScore(nextScore);

    // 正誤記録を追加
    if (currentCard) {
      setTestResults((prev) => [
        ...prev,
        { term: currentCard.term, summary: currentCard.summary, correct },
      ]);
    }

    if (testIndex >= testQueue.length - 1) {
      setTestComplete(true);
      // 最終問題の正誤も含めて保存
      const finalResults = currentCard
        ? [
            ...testResults,
            { term: currentCard.term, summary: currentCard.summary, correct },
          ]
        : testResults;
      await saveTestRecord(nextScore, nextMistakes, finalResults);
      setTestResults([]); // 次回テストのためリセット
      return;
    }

    setTestIndex((current) => current + 1);
  }

  const deckOptions: DeckOption[] = databaseNames
    .map((databaseName) => ({
      databaseName,
      displayName: resolveDeckDisplayName(databaseName, deckDisplayNames),
    }))
    .sort((left, right) => {
      const byName = left.displayName.localeCompare(right.displayName, "ja");
      if (byName !== 0) {
        return byName;
      }

      return left.databaseName.localeCompare(right.databaseName);
    });

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <View style={styles.shell}>
          <AppHeader />

          <View style={styles.mainContent}>
            {busyMessage ? (
              <View style={styles.loadingCard}>
                <ActivityIndicator size="small" color={COLORS.accent} />
                <Text style={styles.loadingText}>{busyMessage}</Text>
              </View>
            ) : null}

            {errorMessage ? (
              <View style={styles.errorCard}>
                <Text style={styles.errorTitle}>{t("error.latestError")}</Text>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            <ScrollView contentContainerStyle={styles.content}>
              {screen === "source" ? (
                <SourceScreen
                  activeDatabaseName={sourceConfig.activeDbName}
                  sourceConfig={sourceConfig}
                  deckOptions={deckOptions}
                  catalogDecks={catalogDecks}
                  catalogBusy={catalogBusy}
                  catalogAvailable={catalogAvailable}
                  onSelectDeck={(databaseName) =>
                    selectDeck(databaseName, "source")
                  }
                  onDeleteDatabase={confirmDeleteDatabase}
                  onOpenAdvancedSettings={() => setScreen("source-settings")}
                  onUpdateSourceConfig={updateSourceConfig}
                  onFetchCatalog={() => fetchCatalog()}
                  onDownloadFromCatalog={(deck) => downloadFromCatalog(deck)}
                  onImportLocalDatabase={(displayName) =>
                    importLocalDatabase(displayName)
                  }
                />
              ) : null}

              {screen === "source-settings" ? (
                <SourceSettingsScreen
                  sourceConfig={sourceConfig}
                  onBack={() => setScreen("source")}
                  onUpdateSourceConfig={updateSourceConfig}
                />
              ) : null}

              {screen === "study" ? (
                <StudyScreen
                  activeDatabaseName={sourceConfig.activeDbName}
                  deckOptions={deckOptions}
                  cards={cards}
                  selectedStudyCardId={selectedStudyCardId}
                  onSelectDeck={(databaseName) =>
                    selectDeck(databaseName, "study")
                  }
                  onOpenSource={() => setScreen("source")}
                  onSelectCard={setSelectedStudyCardId}
                />
              ) : null}

              {screen === "test" ? (
                <TestScreen
                  activeDatabaseName={sourceConfig.activeDbName}
                  deckOptions={deckOptions}
                  cards={cards}
                  testQueue={testQueue}
                  testIndex={testIndex}
                  testScore={testScore}
                  testComplete={testComplete}
                  testHistory={testHistory}
                  onSelectDeck={(databaseName) =>
                    selectDeck(databaseName, "test")
                  }
                  onOpenSource={() => setScreen("source")}
                  onAnswer={(correct) => answerTest(correct)}
                  onStartNewTest={startNewTest}
                />
              ) : null}
            </ScrollView>
          </View>

          <FooterNav
            screen={screen === "source-settings" ? "source" : screen}
            onChangeScreen={setScreen}
          />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#eceff7",
  },
  shell: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  mainContent: {
    flex: 1,
  },
  content: {
    paddingBottom: 132,
  },
  loadingCard: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    backgroundColor: "#f0f9ff",
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
  },
  loadingText: {
    color: "#155e75",
    fontWeight: "600",
  },
  errorCard: {
    backgroundColor: "#fef2f2",
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
  },
  errorTitle: {
    color: "#991b1b",
    fontWeight: "800",
    marginBottom: 6,
  },
  errorText: {
    color: "#7f1d1d",
    lineHeight: 20,
  },
});
