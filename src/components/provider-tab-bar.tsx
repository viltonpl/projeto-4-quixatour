import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { QuixaColors } from '@/constants/theme';

export type ProviderTab = 'painel' | 'mensagens' | 'novo' | 'cadastur';

const TABS: { key: ProviderTab; icon: keyof typeof Ionicons.glyphMap; label: string; path: string }[] = [
  { key: 'painel', icon: 'grid-outline', label: 'Painel', path: '/prestador' },
  { key: 'mensagens', icon: 'chatbubbles-outline', label: 'Mensagens', path: '/prestador-mensagens' },
  { key: 'novo', icon: 'add-circle-outline', label: 'Novo passeio', path: '/novo-passeio' },
  { key: 'cadastur', icon: 'shield-checkmark-outline', label: 'Cadastur', path: '/cadastur' },
];

/** Barra inferior das telas do prestador (baseada no Painel do Stitch). */
export function ProviderTabBar({ active, unread = 0 }: { active: ProviderTab; unread?: number }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        return (
          <TouchableOpacity
            key={tab.key}
            activeOpacity={0.8}
            accessibilityLabel={tab.label}
            accessibilityState={{ selected: isActive }}
            style={[styles.item, isActive && styles.itemActive]}
            onPress={() => {
              if (!isActive) router.replace(tab.path as any);
            }}
          >
            <Ionicons
              name={tab.icon}
              size={22}
              color={isActive ? QuixaColors.onPrimary : QuixaColors.onSurfaceVariant}
            />
            {isActive && <Text style={styles.labelActive}>{tab.label}</Text>}
            {tab.key === 'mensagens' && unread > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unread > 9 ? '9+' : unread}</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 12,
    paddingHorizontal: 8,
    backgroundColor: QuixaColors.surfaceContainerLowest,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#2b211e',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 48,
    minHeight: 44,
    paddingHorizontal: 12,
    borderRadius: 999,
    justifyContent: 'center',
  },
  itemActive: {
    backgroundColor: QuixaColors.primary,
    paddingHorizontal: 16,
  },
  labelActive: {
    color: QuixaColors.onPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 6,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: QuixaColors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
});
