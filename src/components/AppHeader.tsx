import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";

import { COLORS } from "../styles/shared";

export function AppHeader() {
  const { t } = useTranslation();

  return (
    <View style={styles.header}>
      <View style={styles.titleGroup}>
        <Text style={styles.eyebrow}>keisetsu</Text>
        <Text style={styles.title}>{t("header.title")}</Text>
        <Text style={styles.subtitle}>{t("header.subtitle")}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 16,
  },
  titleGroup: {
    gap: 2,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.6,
    color: COLORS.accent,
  },
  title: {
    fontSize: 34,
    fontWeight: "900",
    color: "#0f172a",
    lineHeight: 38,
  },
  subtitle: {
    color: "#475569",
    fontSize: 12,
    fontWeight: "700",
  },
});
