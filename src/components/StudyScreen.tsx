import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { DeckSelector } from "./DeckSelector";
import { COLORS, shared } from "../styles/shared";
import type { Card, DeckOption } from "../types";
import { shuffleCards } from "../utils";

/**
 * Props for the study screen, including the active deck, study order, and navigation callbacks.
 */
type Props = {
  /** Currently selected local database file, or null when no deck is active. */
  activeDatabaseName: string | null;
  /** Available decks that can be selected from the shared deck picker. */
  deckOptions: DeckOption[];
  /** Cards loaded from the active deck. */
  cards: Card[];
  /** Card currently focused in study mode. */
  selectedStudyCardId: string | null;
  /** Switches the active deck. */
  onSelectDeck: (databaseName: string | null) => void;
  /** Opens the source screen so the user can add or manage decks. */
  onOpenSource: () => void;
  /** Selects a specific card in the current study order. */
  onSelectCard: (id: string) => void;
};

/**
 * Study mode screen that shows a flash card, supports shuffling, and allows quick card navigation.
 */
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
  const { t } = useTranslation();

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

  /**
   * Advances through the current study order and reshuffles when repeat mode is enabled.
   */
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

  /**
   * Toggles shuffled study order while preserving the original order from props when disabled.
   */
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
      <View style={shared.card}>
        <Text style={shared.sectionTitle}>{t("deck.activeDeck")}</Text>
        <DeckSelector
          activeDatabaseName={activeDatabaseName}
          deckOptions={deckOptions}
          onSelectDeck={onSelectDeck}
          onAddDeck={onOpenSource}
        />
      </View>
      {/* restore previous color for study card */}
      <View style={shared.card}>
        <View style={styles.cardHeader}>
          <Text style={shared.sectionTitle}>{t("study.title")}</Text>
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
                  {t("study.shuffle")}
                </Text>
              </Pressable>
              <Text style={styles.progressBadge}>
                {t("study.progress", {
                  current: resolvedIndex + 1,
                  total: orderedCards.length,
                })}
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
                <Text style={styles.flipHint}>{t("study.flipHint")}</Text>
              )}
            </Pressable>

            <View style={styles.navRow}>
              <Pressable
                style={[styles.navButton, isFirst && styles.navButtonDisabled]}
                onPress={handlePrev}
                disabled={isFirst}
              >
                <Text style={shared.secondaryButtonText}>
                  {t("study.prev")}
                </Text>
              </Pressable>
              <Pressable style={styles.navButton} onPress={handleNext}>
                <Text style={shared.secondaryButtonText}>
                  {isLast ? t("study.restart") : t("study.next")}
                </Text>
              </Pressable>
            </View>
          </>
        ) : (
          <Text style={shared.sectionText}>{t("study.emptyHint")}</Text>
        )}
      </View>

      {orderedCards.length > 0 && (
        <View style={shared.card}>
          <Pressable
            onPress={() => setListExpanded((e) => !e)}
            style={styles.listHeader}
          >
            <Text style={shared.sectionTitle}>{t("study.cardList")}</Text>
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
                    {card.category || t("study.uncategorized")}
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
    backgroundColor: COLORS.accent,
  },
  shuffleButtonText: {
    color: "#374151",
    fontWeight: "700",
    fontSize: 13,
  },
  shuffleButtonTextActive: {
    color: COLORS.white,
  },
  progressBadge: {
    backgroundColor: COLORS.accent,
    color: COLORS.white,
    fontWeight: "700",
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    overflow: "hidden",
  },
  flashCard: {
    backgroundColor: COLORS.black,
    borderRadius: 10,
    padding: 18,
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.02,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
    borderWidth: 1,
    borderColor: COLORS.gray,
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
    backgroundColor: COLORS.accent,
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
    justifyContent: "center",
    backgroundColor: "#f8f8f8",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: "#ececec",
    marginVertical: 3,
    shadowColor: "#000",
    shadowOpacity: 0.02,
    shadowRadius: 1,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
    flexDirection: "row",
    minHeight: 48,
  },
  navButtonDisabled: {
    opacity: 0.35,
  },
  studyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
    backgroundColor: "#f8f8f8",
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
