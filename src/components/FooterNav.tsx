import { Pressable, StyleSheet, Text, View } from "react-native";

import { SCREEN_TABS } from "../constants";
import type { Screen } from "../types";

type Props = {
  screen: Screen;
  onChangeScreen: (screen: Screen) => void;
};

export function FooterNav({ screen, onChangeScreen }: Props) {
  return (
    <View style={styles.footerNavWrap}>
      <View style={styles.footerNav}>
        {SCREEN_TABS.map((tab) => {
          const active = screen === tab.key;

          return (
            <Pressable
              key={tab.key}
              onPress={() => onChangeScreen(tab.key)}
              style={[
                styles.footerTabButton,
                active && styles.footerTabButtonActive,
              ]}
            >
              <View
                style={[
                  styles.footerTabDot,
                  active && styles.footerTabDotActive,
                ]}
              />
              <Text
                style={[
                  styles.footerTabLabel,
                  active && styles.footerTabLabelActive,
                ]}
              >
                {tab.label}
              </Text>
              <Text
                style={[
                  styles.footerTabCaption,
                  active && styles.footerTabCaptionActive,
                ]}
              >
                {tab.caption}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footerNavWrap: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 14,
  },
  footerNav: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: "#0f172a",
    borderRadius: 24,
    padding: 8,
    shadowColor: "#020617",
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  footerTabButton: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: "center",
    gap: 2,
  },
  footerTabButtonActive: {
    backgroundColor: "#1e293b",
  },
  footerTabDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: "#64748b",
  },
  footerTabDotActive: {
    backgroundColor: "#34d399",
  },
  footerTabLabel: {
    color: "#cbd5e1",
    fontWeight: "700",
    fontSize: 14,
  },
  footerTabLabelActive: {
    color: "#f8fafc",
    fontWeight: "800",
  },
  footerTabCaption: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "600",
  },
  footerTabCaptionActive: {
    color: "#6ee7b7",
  },
});
