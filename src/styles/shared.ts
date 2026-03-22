import { StyleSheet } from "react-native";

export const COLORS = {
  accent: "#0f766e",
  correct: "#0f766e",
  incorrect: "#d32f2f",
  black: "#1a1b1d",
  white: "#fff",
  gray: "#ececec",
  darkGray: "#888",
};

export const shared = StyleSheet.create({
  sectionStack: {
    gap: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 18,
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.02,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
    borderWidth: 1,
    borderColor: "#ececec",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1b1d",
    letterSpacing: 0.1,
  },
  sectionText: {
    color: "#1a1b1d",
    opacity: 0.7,
    lineHeight: 21,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  primaryButton: {
    backgroundColor: "#0f766e", // accent
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  secondaryButton: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ececec",
  },
  secondaryButtonText: {
    color: "#1a1b1d",
    fontWeight: "700",
    letterSpacing: 0.2,
    opacity: 0.8,
  },
  emptyText: {
    color: "#888",
    lineHeight: 20,
  },
});
