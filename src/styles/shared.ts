import { StyleSheet } from 'react-native';

export const shared = StyleSheet.create({
  sectionStack: {
    gap: 14,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 26,
    padding: 18,
    gap: 12,
    shadowColor: '#0f172a',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  sectionText: {
    color: '#4b5563',
    lineHeight: 21,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  primaryButton: {
    backgroundColor: '#0f766e',
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: 16,
  },
  primaryButtonText: {
    color: '#f0fdfa',
    fontWeight: '800',
  },
  secondaryButton: {
    backgroundColor: '#efe6d8',
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: 16,
  },
  secondaryButtonText: {
    color: '#374151',
    fontWeight: '800',
  },
  emptyText: {
    color: '#6b7280',
    lineHeight: 20,
  },
});
