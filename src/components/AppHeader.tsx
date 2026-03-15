import { StyleSheet, Text, View } from "react-native";

export function AppHeader() {
  return (
    <View style={styles.header}>
      <View style={styles.titleGroup}>
        <Text style={styles.eyebrow}>keisetsu</Text>
        <Text style={styles.title}>単語帳で学ぶ</Text>
        <Text style={styles.subtitle}>今日のカードを、短く深く。</Text>
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
    color: "#0f766e",
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
