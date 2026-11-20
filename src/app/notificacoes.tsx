import React, { useCallback, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { QuixaColors } from '@/constants/theme';
import { NotificacoesService, NotificationItem, NotificationType } from '@/services/notificacoesService';

const POLL_MS = 6000;

const TYPE_STYLE: Record<NotificationType, { icon: keyof typeof Ionicons.glyphMap; color: string; bg: string }> = {
  pedido_enviado: { icon: 'card-outline', color: '#8c3d17', bg: '#ffe9b8' },
  pedido_aceito: { icon: 'checkmark-circle', color: '#2e7d32', bg: '#dff3e0' },
  pedido_recusado: { icon: 'close-circle', color: '#ba1a1a', bg: '#ffdad6' },
  passeio_concluido: { icon: 'star', color: '#9c3f10', bg: '#fed0bc' },
  mensagem: { icon: 'chatbubble-ellipses', color: '#795747', bg: '#fdeae5' },
};

/** "2026-11-19 18:03:29" (UTC do SQLite) → "há 5 min", "ontem", "19/11 15:03" */
function timeAgo(sqliteDate: string): string {
  const date = new Date(sqliteDate.replace(' ', 'T') + 'Z');
  const diffMin = Math.floor((Date.now() - date.getTime()) / 60000);
  if (isNaN(diffMin)) return '';
  if (diffMin < 1) return 'agora';
  if (diffMin < 60) return `há ${diffMin} min`;
  if (diffMin < 24 * 60) return `há ${Math.floor(diffMin / 60)} h`;
  if (diffMin < 48 * 60) return 'ontem';
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export default function NotificacoesScreen() {
  const router = useRouter();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await NotificacoesService.list();
      setItems(data.items);
      setError(null);
      // Ao ver a lista, marca tudo como lido (o destaque "novo" continua visível nesta abertura)
      if (data.unread > 0) NotificacoesService.markAllRead();
    } catch (err: any) {
      setError('Não foi possível carregar as notificações. Verifique se o backend está rodando.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
      const timer = setInterval(load, POLL_MS);
      return () => clearInterval(timer);
    }, [load])
  );

  const handleOpen = (n: NotificationItem) => {
    if (n.type === 'mensagem' && n.guide_id) {
      router.push({
        pathname: '/chat',
        params: { guideId: String(n.guide_id), guideName: n.guide_name || 'Guia' },
      });
    } else {
      router.push('/reservas');
    }
  };

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/explore'));

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={goBack} accessibilityLabel="Voltar">
          <Ionicons name="arrow-back" size={24} color={QuixaColors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notificações</Text>
        <View style={styles.backBtn} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={QuixaColors.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
        >
          <Text style={styles.subtitle}>
            Confirmações de pagamento e respostas dos guias às suas reservas.
          </Text>

          {error && <Text style={styles.error}>{error}</Text>}

          {!error && items.length === 0 && (
            <View style={styles.empty}>
              <Ionicons name="notifications-off-outline" size={40} color={QuixaColors.outline} />
              <Text style={styles.emptyTitle}>Nenhuma notificação ainda</Text>
              <Text style={styles.emptyText}>
                Quando você reservar um passeio, a confirmação do pagamento e a resposta do guia aparecem aqui.
              </Text>
            </View>
          )}

          {items.map((n) => {
            const s = TYPE_STYLE[n.type] || TYPE_STYLE.mensagem;
            return (
              <TouchableOpacity
                key={n.id}
                style={[styles.card, !n.is_read && styles.cardUnread]}
                activeOpacity={0.85}
                onPress={() => handleOpen(n)}
              >
                <View style={[styles.iconCircle, { backgroundColor: s.bg }]}>
                  <Ionicons name={s.icon} size={22} color={s.color} />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <View style={styles.cardTop}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {n.title}
                    </Text>
                    <Text style={styles.time}>{timeAgo(n.created_at)}</Text>
                  </View>
                  <Text style={styles.cardBody}>{n.body}</Text>
                  <View style={styles.metaRow}>
                    {n.reservation_code && <Text style={styles.metaPill}>{n.reservation_code}</Text>}
                    {n.guide_name && <Text style={styles.metaText}>{n.guide_name}</Text>}
                    {!n.is_read && <Text style={styles.newPill}>Novo</Text>}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: QuixaColors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#fde0d4',
  },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: QuixaColors.onSurface },
  content: { padding: 16, gap: 10, width: '100%', maxWidth: 520, alignSelf: 'center' },
  subtitle: { fontSize: 13, color: QuixaColors.onSurfaceVariant, marginBottom: 4 },
  error: { color: QuixaColors.error, fontSize: 13 },
  empty: { alignItems: 'center', gap: 8, paddingVertical: 40, paddingHorizontal: 16 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: QuixaColors.onSurface },
  emptyText: { fontSize: 13, color: QuixaColors.onSurfaceVariant, textAlign: 'center', lineHeight: 19 },
  card: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    borderRadius: 20,
    backgroundColor: QuixaColors.surfaceContainerLowest,
    shadowColor: '#dc6e3d',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 1,
  },
  cardUnread: { backgroundColor: QuixaColors.surfaceContainerLow, borderWidth: 1, borderColor: QuixaColors.secondaryContainer },
  iconCircle: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  cardTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: QuixaColors.onSurface },
  time: { fontSize: 11, color: QuixaColors.onSurfaceVariant },
  cardBody: { fontSize: 13, color: QuixaColors.onSurfaceVariant, lineHeight: 18, marginTop: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8, flexWrap: 'wrap' },
  metaPill: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8c3d17',
    backgroundColor: '#fce5dc',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    overflow: 'hidden',
  },
  metaText: { fontSize: 11, color: QuixaColors.onSurfaceVariant },
  newPill: {
    fontSize: 10,
    fontWeight: '800',
    color: '#fff',
    backgroundColor: QuixaColors.primary,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    overflow: 'hidden',
  },
});
