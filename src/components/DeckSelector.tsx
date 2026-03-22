import { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { COLORS } from "../styles/shared";
import type { DeckOption } from "../types";

type Props = {
  activeDatabaseName: string | null;
  deckOptions: DeckOption[];
  onSelectDeck: (databaseName: string | null) => void;
  onAddDeck?: () => void;
};

export function DeckSelector({
  activeDatabaseName,
  deckOptions,
  onSelectDeck,
  onAddDeck,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [menuFrame, setMenuFrame] = useState<{
    left: number;
    top: number;
    width: number;
  } | null>(null);
  const triggerWrapRef = useRef<View>(null);
  const showSampleOption = deckOptions.length === 0;
  const { t } = useTranslation();

  const selectedLabel = useMemo(() => {
    if (!activeDatabaseName) {
      return showSampleOption
        ? t("deck.sampleDeck")
        : (deckOptions[0]?.displayName ?? t("deck.selectDeck"));
    }

    return (
      deckOptions.find(
        (deckOption) => deckOption.databaseName === activeDatabaseName,
      )?.displayName ??
      (showSampleOption ? t("deck.sampleDeck") : t("deck.selectDeck"))
    );
  }, [activeDatabaseName, deckOptions, showSampleOption, t]);

  function handleSelect(databaseName: string | null) {
    onSelectDeck(databaseName);
    setExpanded(false);
  }

  function handleAddDeck() {
    setExpanded(false);
    onAddDeck?.();
  }

  function closeDropdown() {
    setExpanded(false);
  }

  function openDropdown() {
    triggerWrapRef.current?.measureInWindow((left, top, width, height) => {
      setMenuFrame({
        left,
        top: top + height + 6,
        width,
      });
      setExpanded(true);
    });
  }

  function toggleDropdown() {
    if (expanded) {
      closeDropdown();
      return;
    }

    openDropdown();
  }

  const optionItems = (
    <>
      {showSampleOption ? (
        <Pressable
          onPress={() => handleSelect(null)}
          style={[
            styles.dropdownItem,
            !activeDatabaseName && styles.dropdownItemActive,
          ]}
        >
          <Text
            style={[
              styles.dropdownItemText,
              !activeDatabaseName && styles.dropdownItemTextActive,
            ]}
          >
            {t("deck.sampleDeck")}
          </Text>
        </Pressable>
      ) : null}

      {deckOptions.map((deckOption) => {
        const selected = activeDatabaseName === deckOption.databaseName;

        return (
          <Pressable
            key={deckOption.databaseName}
            onPress={() => handleSelect(deckOption.databaseName)}
            style={[styles.dropdownItem, selected && styles.dropdownItemActive]}
          >
            <Text
              style={[
                styles.dropdownItemText,
                selected && styles.dropdownItemTextActive,
              ]}
              numberOfLines={1}
            >
              {deckOption.displayName}
            </Text>
          </Pressable>
        );
      })}

      <Pressable onPress={handleAddDeck} style={styles.dropdownAddItem}>
        <Text style={styles.dropdownAddItemText}>{t("deck.addDeck")}</Text>
      </Pressable>
    </>
  );

  return (
    <View style={styles.dropdownWrap}>
      <View ref={triggerWrapRef} collapsable={false}>
        <Pressable
          onPress={toggleDropdown}
          style={styles.dropdownButton}
          accessibilityRole="button"
          accessibilityLabel={t("deck.selectDeck")}
        >
          <Text style={styles.dropdownSelectedText} numberOfLines={1}>
            {selectedLabel}
          </Text>
          <Text style={styles.dropdownChevron}>{expanded ? "▲" : "▼"}</Text>
        </Pressable>
      </View>

      <Modal
        transparent
        animationType="fade"
        visible={expanded}
        onRequestClose={closeDropdown}
      >
        <View style={styles.modalRoot}>
          <Pressable style={styles.modalBackdrop} onPress={closeDropdown} />
          <View
            style={[
              styles.modalListWrap,
              menuFrame
                ? {
                    left: menuFrame.left,
                    top: menuFrame.top,
                    width: menuFrame.width,
                  }
                : styles.modalListFallback,
            ]}
          >
            <View style={styles.dropdownList}>
              <ScrollView
                style={styles.dropdownScroll}
                contentContainerStyle={styles.dropdownScrollContent}
                showsVerticalScrollIndicator={false}
              >
                {optionItems}
              </ScrollView>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  dropdownWrap: {
    backgroundColor: "#f8f8f8",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.gray,
    overflow: "hidden",
  },
  dropdownButton: {
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  dropdownSelectedText: {
    flex: 1,
    color: "#111827",
    fontWeight: "700",
  },
  dropdownChevron: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: "800",
  },
  dropdownList: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    overflow: "hidden",
  },
  dropdownScroll: {
    maxHeight: 280,
  },
  dropdownScrollContent: {
    paddingVertical: 4,
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dropdownItemActive: {
    backgroundColor: "#d9f99d",
  },
  dropdownItemText: {
    color: "#111827",
  },
  dropdownItemTextActive: {
    color: "#365314",
    fontWeight: "800",
  },
  dropdownAddItem: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#ecfeff",
  },
  dropdownAddItemText: {
    color: COLORS.accent,
    fontWeight: "800",
  },
  modalRoot: {
    flex: 1,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalListWrap: {
    position: "absolute",
  },
  modalListFallback: {
    left: 18,
    right: 18,
    top: 120,
    width: undefined,
  },
});
