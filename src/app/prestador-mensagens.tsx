import React, { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { QuixaColors } from '@/constants/theme';
import { ProviderTabBar } from '@/components/provider-tab-bar';
import { SessionStore } from '@/services/session';
import { Conversation, PrestadorService } from '@/services/prestadorService';

export default function PrestadorMensagensScreen() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setConversations(await PrestadorService.getConversations());
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!SessionStore.guideId()) {
        router.replace('/');
        return;
      }
      load();
      const timer = setInterval(load, 5000);
      return () => clearInterval(timer);
    }, [load, router])
  );

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread, 0);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mensagens</Text>
        <Text style={styles.headerSub}>Converse com os turistas que reservaram ou têm dúvidas</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={QuixaColors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {error && <Text style={styles.error}>{error}</Text>}
          {conversations.length === 0 && !error && (
            <View style={styles.empty}>
              <Ionicons name="chatbubbles-outline" size={36} color={QuixaColors.outline} />
              <Text style={styles.emptyText}>Nenhuma conversa ainda. Quando um turista te chamar, aparece aqui.</Text>
            </View>
          )}
          {conversations.map((c) => (
            <TouchableOpacity
              key={c.tourist_id}
              style={styles.row}
              activeOpacity={0.85}
              onPress={() =>
                router.push({
                  pathname: '/prestador-chat',
                  params: { touristId: String(c.tourist_id), touristName: c.tourist_name },
                })
              }
            >
              <View style={styles.avatar}>
                <Ionicons name="person" size={22} color="#8e4523" />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <View style={styles.rowTop}>
                  <Text style={[styles.name, c.unread > 0 && styles.nameUnread]} numberOfLines={1}>
                    {c.tourist_name}
                  </Text>
                  <Text style={styles.time}>{c.last_time}</Text>
                </View>
                <Text style={[styles.preview, c.unread > 0 && styles.previewUnread]} numberOfLines={1}>
                  {c.last_text}
                </Text>
              </View>
              {c.unread > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{c.unread}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <ProviderTabBar active="mensagens" unread={totalUnread} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: QuixaColors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8, gap: 4 },
  headerTitle: { fontSize: 28, fontWeight: '700', color: QuixaColors.onSurface, letterSpacing: -0.5 },
  headerSub: { fontSize: 14, color: QuixaColors.onSurfaceVariant },
  content: { padding: 16, gap: 10, width: '100%', maxWidth: 520, alignSelf: 'center' },
  error: { color: QuixaColors.error, fontSize: 13 },
  empty: { alignItems: 'center', gap: 10, padding: 32 },
  emptyText: { textAlign: 'center', color: QuixaColors.onSurfaceVariant, fontSize: 13 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 24,
    backgroundColor: QuixaColors.surfaceContainerLowest,
    shadowColor: '#dc6e3d',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: QuixaColors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  name: { fontSize: 16, fontWeight: '600', color: QuixaColors.onSurface, flexShrink: 1 },
  nameUnread: { fontWeight: '800' },
  time: { fontSize: 11, color: QuixaColors.onSurfaceVariant },
  preview: { fontSize: 13, color: QuixaColors.onSurfaceVariant, marginTop: 2 },
  previewUnread: { color: QuixaColors.onSurface, fontWeight: '600' },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 6,
    backgroundColor: QuixaColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '800' },
});
