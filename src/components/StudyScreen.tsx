import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { DeckSelector } from "./DeckSelector";
import { shared } from "../styles/shared";
import type { Card, DeckOption } from "../types";
import { shuffleCards } from "../utils";

type Props = {
  activeDatabaseName: string | null;
  deckOptions: DeckOption[];
  cards: Card[];
  selectedStudyCardId: string | null;
  onSelectDeck: (databaseName: string | null) => void;
  onOpenSource: () => void;
  onSelectCard: (id: string) => void;
};

export function StudyScreen({
  activeDatabaseName,
  deckOptions,
  cards,
  selectedStudyCardId,
  onSelectDeck,
  onOpenSource,
  onSelectCard,
}: Props) {
  const [flipped, setFlipped] = useState(false);
  const [shuffled, setShuffled] = useState(false);
  const [orderedCards, setOrderedCards] = useState<Card[]>(cards);
  const [listExpanded, setListExpanded] = useState(true);

  useEffect(() => {
    setShuffled(false);
    setOrderedCards(cards);
  }, [cards]);

  useEffect(() => {
    setFlipped(false);
  }, [selectedStudyCardId]);

  const currentIndex = orderedCards.findIndex(
    (c) => c.id === selectedStudyCardId,
  );
  const resolvedIndex = currentIndex >= 0 ? currentIndex : 0;
  const currentStudyCard = orderedCards[resolvedIndex] ?? null;
  const isFirst = resolvedIndex === 0;
  const isLast = resolvedIndex === orderedCards.length - 1;

  function handlePrev() {
    if (!isFirst) {
      onSelectCard(orderedCards[resolvedIndex - 1].id);
    }
  }

  function handleNext() {
    if (isLast) {
      if (shuffled) {
        const next = shuffleCards(cards);
        setOrderedCards(next);
        if (next.length > 0) {
          onSelectCard(next[0].id);
        }
        return;
      }

      onSelectCard(orderedCards[0].id);
      return;
    }

    if (!isLast) {
      onSelectCard(orderedCards[resolvedIndex + 1].id);
    }
  }

  function handleShuffle() {
    const next = shuffled ? [...cards] : shuffleCards(cards);
    setOrderedCards(next);
    setShuffled(!shuffled);
    if (next.length > 0) {
      onSelectCard(next[0].id);
    }
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
        <View style={styles.cardHeader}>
          <Text style={shared.sectionTitle}>学習モード</Text>
          {cards.length > 0 && (
            <View style={styles.headerRight}>
              <Pressable
                onPress={handleShuffle}
                style={[
                  styles.shuffleButton,
                  shuffled && styles.shuffleButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.shuffleButtonText,
                    shuffled && styles.shuffleButtonTextActive,
                  ]}
                >
                  シャッフル
                </Text>
              </Pressable>
              <Text style={styles.progressBadge}>
                {resolvedIndex + 1} / {orderedCards.length}
              </Text>
            </View>
          )}
        </View>

        {currentStudyCard ? (
          <>
            <Pressable
              style={[styles.flashCard, flipped && styles.flashCardFlipped]}
              onPress={() => setFlipped((f) => !f)}
            >
              <Text style={styles.flashTerm}>{currentStudyCard.term}</Text>
              {flipped ? (
                <>
                  <View style={styles.divider} />
                  <Text style={styles.flashSummary}>
                    {currentStudyCard.summary}
                  </Text>
                  {currentStudyCard.detail ? (
                    <Text style={styles.flashDetail}>
                      {currentStudyCard.detail}
                    </Text>
                  ) : null}
                  {currentStudyCard.category ? (
                    <Text style={styles.categoryBadge}>
                      {currentStudyCard.category}
                    </Text>
                  ) : null}
                </>
              ) : (
                <Text style={styles.flipHint}>タップして答えを確認 →</Text>
              )}
            </Pressable>

            <View style={styles.navRow}>
              <Pressable
                style={[
                  shared.secondaryButton,
                  styles.navButton,
                  isFirst && styles.navButtonDisabled,
                ]}
                onPress={handlePrev}
                disabled={isFirst}
              >
                <Text style={shared.secondaryButtonText}>← 前へ</Text>
              </Pressable>
              <Pressable
                style={[shared.secondaryButton, styles.navButton]}
                onPress={handleNext}
              >
                <Text style={shared.secondaryButtonText}>
                  {isLast ? "最初から" : "次へ →"}
                </Text>
              </Pressable>
            </View>
          </>
        ) : (
          <Text style={shared.sectionText}>
            単語帳を選ぶとカードが表示されます。
          </Text>
        )}
      </View>

      {orderedCards.length > 0 && (
        <View style={shared.card}>
          <Pressable
            onPress={() => setListExpanded((e) => !e)}
            style={styles.listHeader}
          >
            <Text style={shared.sectionTitle}>カード一覧</Text>
            <Text style={styles.accordionChevron}>
              {listExpanded ? "▲" : "▼"}
            </Text>
          </Pressable>
          {listExpanded &&
            orderedCards.map((card) => {
              const selected = card.id === selectedStudyCardId;

              return (
                <Pressable
                  key={card.id}
                  onPress={() => onSelectCard(card.id)}
                  style={[styles.studyRow, selected && styles.studyRowActive]}
                >
                  <View style={styles.studyRowTextGroup}>
                    <Text
                      style={[
                        styles.studyRowTerm,
                        selected && styles.studyRowTermActive,
                      ]}
                    >
                      {card.term}
                    </Text>
                    <Text style={styles.studyRowSummary} numberOfLines={1}>
                      {card.summary}
                    </Text>
                  </View>
                  <Text style={styles.studyRowCategory}>
                    {card.category || "未分類"}
                  </Text>
                </Pressable>
              );
            })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  accordionChevron: {
    color: "#6b7280",
    fontSize: 13,
    fontWeight: "700",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  shuffleButton: {
    backgroundColor: "#e5e7eb",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  shuffleButtonActive: {
    backgroundColor: "#fde68a",
  },
  shuffleButtonText: {
    color: "#374151",
    fontWeight: "700",
    fontSize: 13,
  },
  shuffleButtonTextActive: {
    color: "#92400e",
  },
  progressBadge: {
    backgroundColor: "#e0f2fe",
    color: "#0369a1",
    fontWeight: "700",
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    overflow: "hidden",
  },
  flashCard: {
    backgroundColor: "#1f2937",
    borderRadius: 22,
    padding: 18,
    gap: 8,
    minHeight: 140,
  },
  flashCardFlipped: {
    backgroundColor: "#134e4a",
  },
  flashTerm: {
    color: "#f9fafb",
    fontSize: 28,
    fontWeight: "800",
  },
  flipHint: {
    color: "#9ca3af",
    fontStyle: "italic",
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: "#374151",
    marginVertical: 4,
  },
  flashSummary: {
    color: "#e5e7eb",
    lineHeight: 22,
  },
  flashDetail: {
    color: "#d1fae5",
    lineHeight: 21,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#0f766e",
    color: "#f0fdfa",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    overflow: "hidden",
    fontWeight: "700",
  },
  navRow: {
    flexDirection: "row",
    gap: 10,
  },
  navButton: {
    flex: 1,
    alignItems: "center",
  },
  navButtonDisabled: {
    opacity: 0.35,
  },
  studyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
    backgroundColor: "#f8f5ec",
    borderRadius: 16,
    padding: 14,
  },
  studyRowActive: {
    backgroundColor: "#d9f99d",
  },
  studyRowTextGroup: {
    flex: 1,
    gap: 3,
  },
  studyRowTerm: {
    color: "#111827",
    fontWeight: "800",
    fontSize: 16,
  },
  studyRowTermActive: {
    color: "#365314",
  },
  studyRowSummary: {
    color: "#4b5563",
  },
  studyRowCategory: {
    color: "#6b7280",
    fontWeight: "700",
  },
});
