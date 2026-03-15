import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { DEFAULT_SOURCE_CONFIG } from "../constants";
import { shared } from "../styles/shared";
import type { RefType, SourceConfig } from "../types";
import { buildCatalogUrl } from "../utils";

type Props = {
  sourceConfig: SourceConfig;
  onBack: () => void;
  onUpdateSourceConfig: (patch: Partial<SourceConfig>) => void;
};

export function SourceSettingsScreen({
  sourceConfig,
  onBack,
  onUpdateSourceConfig,
}: Props) {
  function resetToDefault() {
    onUpdateSourceConfig({
      owner: DEFAULT_SOURCE_CONFIG.owner,
      repo: DEFAULT_SOURCE_CONFIG.repo,
      refType: DEFAULT_SOURCE_CONFIG.refType,
      refName: DEFAULT_SOURCE_CONFIG.refName,
    });
  }

  return (
    <View style={shared.sectionStack}>
      <View style={shared.card}>
        <Text style={shared.sectionTitle}>詳細設定</Text>
        <Text style={shared.sectionText}>
          GitHub から取得する単語帳の公開先を設定します。
        </Text>

        <Text style={styles.label}>公開している人の名前</Text>
        <TextInput
          autoCapitalize="none"
          value={sourceConfig.owner}
          onChangeText={(value) => onUpdateSourceConfig({ owner: value })}
          style={styles.input}
        />

        <Text style={styles.label}>保管先の名前</Text>
        <TextInput
          autoCapitalize="none"
          value={sourceConfig.repo}
          onChangeText={(value) => onUpdateSourceConfig({ repo: value })}
          style={styles.input}
        />

        <Text style={styles.label}>どこから読むか</Text>
        <View style={styles.segmentRow}>
          {(["branch", "tag"] as RefType[]).map((refType) => (
            <Pressable
              key={refType}
              onPress={() => onUpdateSourceConfig({ refType })}
              style={[
                styles.segmentButton,
                sourceConfig.refType === refType && styles.segmentButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.segmentText,
                  sourceConfig.refType === refType && styles.segmentTextActive,
                ]}
              >
                {refType === "branch" ? "ブランチ" : "タグ"}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>
          {sourceConfig.refType === "branch" ? "ブランチ名" : "タグ名"}
        </Text>
        <TextInput
          autoCapitalize="none"
          value={sourceConfig.refName}
          onChangeText={(value) => onUpdateSourceConfig({ refName: value })}
          style={styles.input}
        />

        <View style={styles.infoPanel}>
          <Text style={styles.infoLabel}>カタログURL</Text>
          <Text style={styles.infoValue}>
            {buildCatalogUrl(sourceConfig)}
          </Text>
        </View>

        <View style={shared.actionsRow}>
          <Pressable onPress={resetToDefault} style={shared.secondaryButton}>
            <Text style={shared.secondaryButtonText}>デフォルトに戻す</Text>
          </Pressable>
          <Pressable onPress={onBack} style={shared.primaryButton}>
            <Text style={shared.primaryButtonText}>戻る</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
  },
  input: {
    backgroundColor: "#f4efe5",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#111827",
  },
  segmentRow: {
    flexDirection: "row",
    gap: 10,
  },
  segmentButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#efe6d8",
  },
  segmentButtonActive: {
    backgroundColor: "#0f766e",
  },
  segmentText: {
    color: "#374151",
    fontWeight: "700",
  },
  segmentTextActive: {
    color: "#f0fdfa",
  },
  infoPanel: {
    backgroundColor: "#f4efe5",
    borderRadius: 16,
    padding: 14,
    gap: 6,
  },
  infoLabel: {
    color: "#6b7280",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  infoValue: {
    color: "#111827",
    lineHeight: 20,
  },
});
