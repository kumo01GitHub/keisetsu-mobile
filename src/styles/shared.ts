import { StyleSheet } from 'react-native';

export const shared = StyleSheet.create({
  sectionStack: {
    gap: 16,
  },
  card: {
    backgroundColor: '#fff', // surface
    borderRadius: 14,
    padding: 18,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
    borderWidth: 1,
    borderColor: '#ececec', // line
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1b1d', // foreground
    letterSpacing: 0.1,
  },
  sectionText: {
    color: '#444',
    lineHeight: 21,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  primaryButton: {
    backgroundColor: '#0f766e', // accent
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  secondaryButton: {
    backgroundColor: '#f5f0e5', // surface-strong
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ececec',
  },
  secondaryButtonText: {
    color: '#1a1b1d',
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  emptyText: {
    color: '#888',
    lineHeight: 20,
  },
});
