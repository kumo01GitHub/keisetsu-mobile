import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from 'react-i18next';

import { DeckSelector } from "./DeckSelector";
import { shared } from "../styles/shared";
import type { Card, DeckOption, TestRecord, TestScore } from "../types";
import { shuffleArray } from "../utils";

type Props = {
  activeDatabaseName: string | null;
  deckOptions: DeckOption[];
  cards: Card[];
  testQueue: Card[];
  testIndex: number;
  testScore: TestScore;
  testComplete: boolean;
  testHistory: TestRecord[];
  onSelectDeck: (databaseName: string | null) => void;
  onOpenSource: () => void;
  onAnswer: (correct: boolean) => void;
  onStartNewTest: () => void;
};

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

  function handleMultipleChoiceAnswer(selectedSummary: string) {
    if (!currentTestCard || choiceLocked) {
      return;
    }

    setChoiceLocked(true);
    onAnswer(selectedSummary === currentTestCard.summary);
  }

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
        <Text style={shared.sectionTitle}>{t('test.title')}</Text>
        <Text style={shared.sectionText}>
          {t('test.description')}
        </Text>

        {testComplete ? (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>{t('test.resultTitle')}</Text>
            <Text style={styles.summaryScore}>
              {t('test.score', { correct: testScore.correct, total: answerCount })}
            </Text>
            <Text style={styles.summaryDetail}>
              {t('test.mistakes', { count: testScore.incorrect })}
            </Text>
            <Pressable onPress={onStartNewTest} style={shared.primaryButton}>
              <Text style={shared.primaryButtonText}>{t('test.retake')}</Text>
            </Pressable>
          </View>
        ) : currentTestCard ? (
          <View style={styles.testCard}>
            <Text style={styles.progressText}>
              {t('test.progress', { current: testIndex + 1, total: testQueue.length })}
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
                <Text style={styles.choiceHint}>
                  {t('test.minCardsHint')}
                </Text>
              ) : null}
            </View>
          </View>
        ) : (
          <Text style={shared.emptyText}>{t('test.noCards')}</Text>
        )}
      </View>

      <View style={shared.card}>
        <Text style={shared.sectionTitle}>{t('test.recentResults')}</Text>
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
                  <Text style={styles.historyDate}>{record.finishedAt}</Text>
                </View>
                <View style={styles.historyRight}>
                  <Text style={styles.historyScore}>
                    {record.correct}/{record.total}
                  </Text>
                  <Text style={styles.historyTapHint}>
                    {t('test.tapForMistakes')}
                  </Text>
                </View>
              </Pressable>

              {expandedHistoryKey ===
              `${record.finishedAt}-${record.databaseLabel}` ? (
                <View style={styles.historyDetailCard}>
                  <Text style={styles.historyDetailTitle}>{t('test.mistakesTitle')}</Text>
                  {record.mistakes?.length ? (
                    record.mistakes.map((mistake, index) => (
                      <View
                        key={`${record.finishedAt}-${mistake.term}-${index}`}
                        style={styles.mistakeRow}
                      >
                        <Text style={styles.mistakeTerm}>{mistake.term}</Text>
                        <Text style={styles.mistakeSummary}>
                          {mistake.summary}
                        </Text>
                      </View>
                    ))
                  ) : record.incorrect === 0 ? (
                    <Text style={styles.historyNoMistake}>
                      {t('test.allCorrect')}
                    </Text>
                  ) : (
                    <Text style={styles.historyNoMistake}>
                      {t('test.noMistakeData')}
                    </Text>
                  )}
                </View>
              ) : null}
            </View>
          ))
        ) : (
          <Text style={shared.emptyText}>{t('test.noHistory')}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  testCard: {
    backgroundColor: "#fff7ed",
    borderRadius: 22,
    padding: 18,
    gap: 16,
  },
  progressText: {
    color: "#9a3412",
    fontWeight: "800",
  },
  testTerm: {
    fontSize: 30,
    lineHeight: 34,
    fontWeight: "800",
    color: "#7c2d12",
  },
  choicesWrap: {
    gap: 10,
  },
  choiceButton: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#fed7aa",
  },
  choiceButtonDisabled: {
    opacity: 0.6,
  },
  choiceText: {
    color: "#1f2937",
    lineHeight: 20,
    fontWeight: "700",
  },
  choiceHint: {
    color: "#9a3412",
    fontSize: 12,
  },
  summaryCard: {
    backgroundColor: "#ecfccb",
    borderRadius: 22,
    padding: 18,
    gap: 10,
  },
  summaryTitle: {
    color: "#365314",
    fontWeight: "800",
  },
  summaryScore: {
    color: "#14532d",
    fontSize: 34,
    fontWeight: "900",
  },
  summaryDetail: {
    color: "#3f6212",
    marginBottom: 4,
  },
  historyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f8f5ec",
    borderRadius: 16,
    padding: 14,
  },
  historyRight: {
    alignItems: "flex-end",
    gap: 2,
  },
  historyDeck: {
    color: "#111827",
    fontWeight: "800",
  },
  historyDate: {
    color: "#6b7280",
    marginTop: 4,
  },
  historyScore: {
    color: "#0f766e",
    fontWeight: "900",
    fontSize: 20,
  },
  historyTapHint: {
    color: "#6b7280",
    fontSize: 11,
    fontWeight: "600",
  },
  historyDetailCard: {
    marginTop: 8,
    marginBottom: 10,
    backgroundColor: "#f0fdf4",
    borderRadius: 14,
    padding: 12,
    gap: 8,
  },
  historyDetailTitle: {
    color: "#166534",
    fontWeight: "800",
  },
  mistakeRow: {
    gap: 2,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 10,
  },
  mistakeTerm: {
    color: "#14532d",
    fontWeight: "800",
  },
  mistakeSummary: {
    color: "#1f2937",
    lineHeight: 20,
  },
  historyNoMistake: {
    color: "#166534",
  },
});
