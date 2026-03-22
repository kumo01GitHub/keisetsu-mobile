import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { DeckSelector } from "./DeckSelector";
import { shared, COLORS } from "../styles/shared";
import type { Card, DeckOption, TestRecord, TestScore } from "../types";
import { shuffleArray, formatDateTime } from "../utils";

/**
 * Props for the test screen, including quiz state, answer handling, and score history.
 */
type Props = {
  /** Currently selected local database file, or null when no deck is active. */
  activeDatabaseName: string | null;
  /** Available decks that can be selected from the shared deck picker. */
  deckOptions: DeckOption[];
  /** Full card list for the active deck, used to build answer choices. */
  cards: Card[];
  /** Current quiz queue derived from the active deck. */
  testQueue: Card[];
  /** Zero-based index of the current quiz item. */
  testIndex: number;
  /** Running correct and incorrect totals for the active quiz. */
  testScore: TestScore;
  /** Whether the current quiz session has finished. */
  testComplete: boolean;
  /** Previously completed test sessions shown in the history panel. */
  testHistory: TestRecord[];
  /** Switches the active deck. */
  onSelectDeck: (databaseName: string | null) => void;
  /** Opens the source screen so the user can add or manage decks. */
  onOpenSource: () => void;
  /** Records whether the user answered the current question correctly. */
  onAnswer: (correct: boolean) => void;
  /** Starts a fresh quiz from the active deck. */
  onStartNewTest: () => void;
};

/**
 * Test mode screen that generates multiple-choice prompts and shows recent score history.
 */
export function TestScreen({
  activeDatabaseName,
  deckOptions,
  cards,
  testQueue,
  testIndex,
  testScore,
  testComplete,
  testHistory,
  onSelectDeck,
  onOpenSource,
  onAnswer,
  onStartNewTest,
}: Props) {
  const [choiceLocked, setChoiceLocked] = useState(false);
  const [expandedHistoryKey, setExpandedHistoryKey] = useState<string | null>(
    null,
  );
  const currentTestCard = testQueue[testIndex];
  const answerCount = testQueue.length;
  const { t } = useTranslation();

  useEffect(() => {
    setChoiceLocked(false);
  }, [testIndex, testComplete]);

  const multipleChoiceOptions = useMemo(() => {
    if (!currentTestCard) {
      return [];
    }

    const wrongSummaryCandidates = shuffleArray(
      Array.from(
        new Set(
          cards
            .filter((card) => card.id !== currentTestCard.id)
            .map((card) => card.summary.trim())
            .filter(
              (summary) =>
                Boolean(summary) && summary !== currentTestCard.summary,
            ),
        ),
      ),
    ).slice(0, 3);

    return shuffleArray([currentTestCard.summary, ...wrongSummaryCandidates]);
  }, [cards, currentTestCard]);

  /**
   * Records the selected answer once and prevents double submission from repeated taps.
   */
  function handleMultipleChoiceAnswer(selectedSummary: string) {
    if (!currentTestCard || choiceLocked) {
      return;
    }

    setChoiceLocked(true);
    onAnswer(selectedSummary === currentTestCard.summary);
  }

  /**
   * Expands or collapses a past test result to reveal mistake details.
   */
  function toggleHistoryRecord(recordKey: string) {
    setExpandedHistoryKey((current) =>
      current === recordKey ? null : recordKey,
    );
  }

  return (
    <View style={shared.sectionStack}>
      <DeckSelector
        activeDatabaseName={activeDatabaseName}
        deckOptions={deckOptions}
        onSelectDeck={onSelectDeck}
        onAddDeck={onOpenSource}
      />

      <View style={shared.card}>
        <Text style={shared.sectionTitle}>{t("test.title")}</Text>
        <Text style={shared.sectionText}>{t("test.description")}</Text>

        {testComplete ? (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>{t("test.resultTitle")}</Text>
            <Text style={styles.summaryScore}>
              {t("test.score", {
                correct: testScore.correct,
                total: answerCount,
              })}
            </Text>
            <Text style={styles.summaryDetail}>
              {t("test.mistakes", { count: testScore.incorrect })}
            </Text>
            <Pressable onPress={onStartNewTest} style={shared.primaryButton}>
              <Text style={shared.primaryButtonText}>{t("test.retake")}</Text>
            </Pressable>
          </View>
        ) : currentTestCard ? (
          <View style={styles.testCard}>
            <Text style={styles.progressText}>
              {t("test.progress", {
                current: testIndex + 1,
                total: testQueue.length,
              })}
            </Text>
            <Text style={styles.testTerm}>{currentTestCard.term}</Text>
            <View style={styles.choicesWrap}>
              {multipleChoiceOptions.map((summary) => (
                <Pressable
                  key={`${currentTestCard.id}-${summary}`}
                  onPress={() => handleMultipleChoiceAnswer(summary)}
                  style={[
                    styles.choiceButton,
                    choiceLocked && styles.choiceButtonDisabled,
                  ]}
                  disabled={choiceLocked}
                >
                  <Text style={styles.choiceText}>{summary}</Text>
                </Pressable>
              ))}
              {multipleChoiceOptions.length < 4 ? (
                <Text style={styles.choiceHint}>{t("test.minCardsHint")}</Text>
              ) : null}
            </View>
          </View>
        ) : (
          <Text style={shared.emptyText}>{t("test.noCards")}</Text>
        )}
      </View>

      <View style={shared.card}>
        <Text style={shared.sectionTitle}>{t("test.recentResults")}</Text>
        {testHistory.length ? (
          testHistory.map((record) => (
            <View key={`${record.finishedAt}-${record.databaseLabel}`}>
              <Pressable
                onPress={() =>
                  toggleHistoryRecord(
                    `${record.finishedAt}-${record.databaseLabel}`,
                  )
                }
                style={styles.historyRow}
              >
                <View>
                  <Text style={styles.historyDeck}>{record.databaseLabel}</Text>
                  <Text style={styles.historyDate}>
                    {formatDateTime(record.finishedAt)}
                  </Text>
                </View>
                <View style={styles.historyRight}>
                  <Text style={styles.historyScore}>
                    {record.correct}/{record.total}
                  </Text>
                  <Text style={styles.historyTapHint}>
                    {t("test.tapForDetails")}
                  </Text>
                </View>
              </Pressable>

              {expandedHistoryKey ===
              `${record.finishedAt}-${record.databaseLabel}` ? (
                <View style={styles.historyDetailCard}>
                  <Text style={styles.historyDetailTitle}>
                    {t("test.resultDetailsTitle", "テスト結果")}
                  </Text>
                  {record.results && record.results.length > 0 ? (
                    record.results.map((result, index) => (
                      <View
                        key={`${record.finishedAt}-${result.term}-${index}`}
                        style={styles.mistakeRow}
                      >
                        <Text style={styles.mistakeTerm}>{result.term}</Text>
                        <Text style={styles.mistakeSummary}>
                          {result.summary}
                        </Text>
                        <Text
                          style={{
                            color: result.correct
                              ? COLORS.correct
                              : COLORS.incorrect,
                            fontWeight: "bold",
                            marginLeft: 8,
                          }}
                        >
                          {result.correct
                            ? t("test.correct", "正解")
                            : t("test.incorrect", "不正解")}
                        </Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.historyNoMistake}>
                      {t("test.noResultData", "記録データなし")}
                    </Text>
                  )}
                </View>
              ) : null}
            </View>
          ))
        ) : (
          <Text style={shared.emptyText}>{t("test.noHistory")}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  testCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    gap: 16,
  },
  progressText: {
    color: "#0f766e",
    fontWeight: "800",
  },
  testTerm: {
    fontSize: 30,
    lineHeight: 34,
    fontWeight: "800",
    color: "#1a1b1d",
  },
  choicesWrap: {
    gap: 10,
  },
  choiceButton: {
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: "#ececec",
    marginVertical: 4,
    shadowColor: "#000",
    shadowOpacity: 0.02,
    shadowRadius: 1,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
    flexDirection: "row",
    alignItems: "center",
    minHeight: 44,
  },
  choiceButtonDisabled: {
    opacity: 0.5,
  },
  choiceButtonActive: {
    backgroundColor: "#e6f7f5",
    borderColor: "#0f766e",
    shadowColor: "#0f766e",
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  choiceText: {
    color: "#1a1b1d",
    lineHeight: 20,
    fontWeight: "700",
    fontSize: 15,
    letterSpacing: 0.1,
    flex: 1,
  },
  choiceHint: {
    color: "#888",
    fontSize: 12,
  },
  summaryCard: {
    backgroundColor: "#ececec",
    borderRadius: 16,
    padding: 18,
    gap: 10,
  },
  summaryTitle: {
    color: "#1a1b1d",
    fontWeight: "800",
  },
  summaryScore: {
    color: "#0f766e",
    fontSize: 34,
    fontWeight: "900",
  },
  summaryDetail: {
    color: "#888",
    marginBottom: 4,
  },
  historyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ececec",
    borderRadius: 14,
    padding: 14,
  },
  historyRight: {
    alignItems: "flex-end",
    gap: 2,
  },
  historyDeck: {
    color: "#1a1b1d",
    fontWeight: "800",
  },
  historyDate: {
    color: "#888",
    marginTop: 4,
  },
  historyScore: {
    color: "#0f766e",
    fontWeight: "900",
    fontSize: 20,
  },
  historyTapHint: {
    color: "#888",
    fontSize: 11,
    fontWeight: "600",
  },
  historyDetailCard: {
    marginTop: 8,
    marginBottom: 10,
    backgroundColor: "#ececec",
    borderRadius: 10,
    padding: 12,
    gap: 8,
  },
  historyDetailTitle: {
    color: "#0f766e",
    fontWeight: "800",
  },
  mistakeRow: {
    gap: 2,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
  },
  mistakeTerm: {
    color: "#0f766e",
    fontWeight: "800",
  },
  mistakeSummary: {
    color: "#1a1b1d",
    lineHeight: 20,
  },
  historyNoMistake: {
    color: "#0f766e",
  },
});
