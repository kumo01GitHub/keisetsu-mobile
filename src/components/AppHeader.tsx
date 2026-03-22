import { StyleSheet, Text, View } from "react-native";

import { COLORS } from "../styles/shared";

export function AppHeader() {
  return (
    <View style={styles.header}>
      <Text style={styles.eyebrow}>keisetsu</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 16,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.6,
    color: COLORS.accent,
    marginBottom: 8,
  },
});
