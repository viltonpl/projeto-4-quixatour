import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { QuixaColors } from '@/constants/theme';
import { AppImages, resolveImage } from '@/constants/images';
import { ProviderTabBar } from '@/components/provider-tab-bar';
import { confirmAction, notify } from '@/components/ui/notify';
import { SessionStore } from '@/services/session';
import { PrestadorService, ProviderDashboard, TouristRequest } from '@/services/prestadorService';

const POLL_MS = 8000;

export default function PrestadorScreen() {
  const router = useRouter();
  const session = SessionStore.get();

  const [data, setData] = useState<ProviderDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawMsg, setWithdrawMsg] = useState<string | null>(null);
  const [respondedMsg, setRespondedMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const dashboard = await PrestadorService.getDashboard();
      setData(dashboard);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Carrega ao abrir a tela e atualiza periodicamente (novos pedidos de turistas chegam sozinhos)
  useFocusEffect(
    useCallback(() => {
      if (!SessionStore.guideId()) {
        router.replace('/');
        return;
      }
      load();
      const timer = setInterval(load, POLL_MS);
      return () => clearInterval(timer);
    }, [load, router])
  );

  const handleLogout = () => {
    confirmAction('Sair do painel', 'Deseja encerrar a sessão de prestador?', 'Sair', () => {
      SessionStore.clear();
      router.replace('/');
    });
  };

  const handleWithdraw = () => {
    if (!data || data.balance.available <= 0) {
      notify('Sem saldo', 'Você ainda não tem saldo disponível para saque. O valor é liberado quando o passeio é concluído.');
      return;
    }
    confirmAction(
      'Sacar via Pix',
      `Transferir ${data.balance.formatted} para sua chave Pix cadastrada?`,
      'Sacar',
      async () => {
        try {
          setWithdrawing(true);
          const res = await PrestadorService.withdraw();
          setWithdrawMsg(res.message);
          await load();
        } catch (err: any) {
          notify('Erro no saque', err.message);
        } finally {
          setWithdrawing(false);
        }
      }
    );
  };

  const handleAccept = async (req: TouristRequest) => {
    try {
      setBusyId(req.id);
      await PrestadorService.acceptRequest(req.id);
      setRespondedMsg(`Passeio confirmado com ${req.tourist_name}! Ele(a) já foi avisado(a) no chat.`);
      await load();
    } catch (err: any) {
      notify('Não foi possível aceitar', err.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = (req: TouristRequest) => {
    confirmAction(
      'Recusar pedido',
      `Recusar o pedido de ${req.tourist_name} para "${req.title}"? O turista recebe reembolso integral.`,
      'Recusar',
      async () => {
        try {
          setBusyId(req.id);
          await PrestadorService.rejectRequest(req.id, 'O guia não tem disponibilidade para essa data.');
          setRespondedMsg(`Pedido de ${req.tourist_name} recusado. O reembolso foi solicitado.`);
          await load();
        } catch (err: any) {
          notify('Não foi possível recusar', err.message);
        } finally {
          setBusyId(null);
        }
      },
      true
    );
  };

  const handleComplete = (req: TouristRequest) => {
    confirmAction(
      'Concluir passeio',
      `Marcar "${req.title}" com ${req.tourist_name} como realizado? O valor ${req.formatted_total} entra no seu saldo.`,
      'Concluir',
      async () => {
        try {
          setBusyId(req.id);
          await PrestadorService.completeReservation(req.id);
          await load();
        } catch (err: any) {
          notify('Erro', err.message);
        } finally {
          setBusyId(null);
        }
      }
    );
  };

  const handleToggle = async (id: number, value: boolean) => {
    // Atualização otimista do switch
    setData((prev) =>
      prev ? { ...prev, experiences: prev.experiences.map((e) => (e.id === id ? { ...e, is_active: value } : e)) } : prev
    );
    try {
      await PrestadorService.setExperienceActive(id, value);
    } catch (err: any) {
      notify('Erro', err.message);
      load();
    }
  };

  const openChat = (req: TouristRequest) =>
    router.push({ pathname: '/prestador-chat', params: { touristId: String(req.tourist_id), touristName: req.tourist_name } });

  const firstName = (session?.name || data?.guide.name || 'Guia').split(' ')[0];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image source={AppImages.logo} style={styles.headerLogo} resizeMode="contain" />
          <Text style={styles.headerTitle}>Painel do Prestador</Text>
        </View>
        <TouchableOpacity style={styles.iconBtn} onPress={handleLogout} accessibilityLabel="Sair">
          <Ionicons name="log-out-outline" size={22} color={QuixaColors.onSurfaceVariant} />
        </TouchableOpacity>
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
          {error && (
            <View style={styles.errorBox}>
              <Ionicons name="cloud-offline-outline" size={18} color={QuixaColors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {data && (
            <>
              {/* Saudação + selo Cadastur */}
              <View style={styles.greeting}>
                {data.guide.is_verified ? (
                  <View style={styles.verifiedPill}>
                    <View style={styles.dot} />
                    <Text style={styles.verifiedText}>Guia Credenciado</Text>
                  </View>
                ) : (
                  <TouchableOpacity style={[styles.verifiedPill, styles.pendingPill]} onPress={() => router.replace('/cadastur')}>
                    <Ionicons name="alert-circle" size={14} color={QuixaColors.error} />
                    <Text style={[styles.verifiedText, { color: QuixaColors.error }]}>
                      {data.guide.cadastur_status === 'em_analise' ? 'Cadastur em análise' : 'Verifique seu Cadastur'}
                    </Text>
                  </TouchableOpacity>
                )}
                <Text style={styles.hello}>Olá, {firstName}</Text>
                <Text style={styles.helloSub}>
                  {data.pending.length > 0
                    ? `Você tem ${data.pending.length} ${data.pending.length === 1 ? 'pedido novo' : 'pedidos novos'} de turistas esperando resposta.`
                    : 'Tudo em dia! Acompanhe aqui seus pedidos, passeios e ganhos.'}
                </Text>
              </View>

              {/* Saldo */}
              <View style={styles.balanceCard}>
                <View style={styles.balanceRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.balanceLabel}>Saldo para Saque</Text>
                    <Text style={styles.balanceValue}>{data.balance.formatted}</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.pixBtn, withdrawing && { opacity: 0.7 }]}
                    onPress={handleWithdraw}
                    disabled={withdrawing}
                  >
                    {withdrawing ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Ionicons name="flash" size={18} color="#fff" />
                    )}
                    <Text style={styles.pixBtnText}>{withdrawing ? 'Processando...' : 'Sacar via Pix'}</Text>
                  </TouchableOpacity>
                </View>
                {data.balance.to_receive > 0 && (
                  <Text style={styles.toReceive}>
                    + {data.balance.formatted_to_receive} a receber de passeios confirmados
                  </Text>
                )}
                {withdrawMsg && (
                  <View style={styles.successBox}>
                    <Ionicons name="checkmark-circle" size={18} color={QuixaColors.primary} />
                    <Text style={styles.successText}>{withdrawMsg}</Text>
                  </View>
                )}
              </View>

              {/* Pedidos de turistas */}
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <Text style={styles.sectionTitle}>Pedidos de Turistas</Text>
                  {data.pending.length > 0 && (
                    <View style={styles.countBadge}>
                      <Text style={styles.countBadgeText}>{data.pending.length}</Text>
                    </View>
                  )}
                </View>
                {data.pending.length > 0 && <Text style={styles.sectionHint}>Toque para responder</Text>}
              </View>

              {respondedMsg && (
                <View style={[styles.successBox, styles.respondedBox]}>
                  <Ionicons name="checkmark-done" size={20} color={QuixaColors.primary} />
                  <Text style={styles.successText}>{respondedMsg}</Text>
                </View>
              )}

              {data.pending.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Ionicons name="file-tray-outline" size={28} color={QuixaColors.outline} />
                  <Text style={styles.emptyText}>Nenhum pedido aguardando resposta.</Text>
                </View>
              ) : (
                data.pending.map((req) => (
                  <View key={req.id} style={styles.requestCard}>
                    <TouchableOpacity style={styles.requestTop} activeOpacity={0.8} onPress={() => openChat(req)}>
                      <View style={styles.personBox}>
                        <Ionicons name="person-outline" size={24} color={QuixaColors.onSurfaceVariant} />
                      </View>
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <View style={styles.requestNameRow}>
                          <Text style={styles.requestName} numberOfLines={1}>{req.tourist_name}</Text>
                          <Text style={styles.requestPrice}>{req.formatted_total}</Text>
                        </View>
                        <Text style={styles.requestTitle} numberOfLines={1}>{req.title}</Text>
                        <View style={styles.metaRow}>
                          <Ionicons name="calendar-outline" size={14} color={QuixaColors.tertiary} />
                          <Text style={styles.metaText}>{req.schedule_text}</Text>
                          <Text style={styles.metaDot}>•</Text>
                          <Ionicons name="people-outline" size={14} color={QuixaColors.tertiary} />
                          <Text style={styles.metaText}>
                            {req.participants} {req.participants === 1 ? 'pessoa' : 'pessoas'}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                    <View style={styles.actionsGrid}>
                      <TouchableOpacity
                        style={styles.rejectBtn}
                        onPress={() => handleReject(req)}
                        disabled={busyId === req.id}
                      >
                        <Ionicons name="close" size={18} color={QuixaColors.onSurfaceVariant} />
                        <Text style={styles.rejectText}>Recusar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.acceptBtn}
                        onPress={() => handleAccept(req)}
                        disabled={busyId === req.id}
                      >
                        {busyId === req.id ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <Ionicons name="checkmark" size={20} color="#fff" />
                        )}
                        <Text style={styles.acceptText}>Aceitar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}

              {/* Agenda confirmada */}
              {data.agenda.length > 0 && (
                <>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Agenda Confirmada</Text>
                    <Text style={styles.sectionCount}>{data.agenda.length} passeios</Text>
                  </View>
                  {data.agenda.map((req) => (
                    <View key={req.id} style={styles.agendaCard}>
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text style={styles.agendaTitle} numberOfLines={1}>{req.title}</Text>
                        <Text style={styles.agendaMeta} numberOfLines={1}>
                          {req.tourist_name} • {req.schedule_text} • {req.participants}{' '}
                          {req.participants === 1 ? 'pessoa' : 'pessoas'}
                        </Text>
                      </View>
                      <TouchableOpacity style={styles.smallIconBtn} onPress={() => openChat(req)} accessibilityLabel="Chat">
                        <Ionicons name="chatbubble-outline" size={18} color={QuixaColors.tertiary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.completeBtn}
                        onPress={() => handleComplete(req)}
                        disabled={busyId === req.id}
                      >
                        <Ionicons name="flag-outline" size={16} color={QuixaColors.primary} />
                        <Text style={styles.completeText}>Concluir</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </>
              )}

              {/* Meus passeios */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Meus Passeios</Text>
                <Text style={styles.sectionCount}>{data.experiences.length} cadastrados</Text>
              </View>

              {data.experiences.map((exp) => (
                <View key={exp.id} style={styles.expCard}>
                  <View style={styles.expTop}>
                    <Image source={resolveImage(exp.image_key)} style={styles.expImg} resizeMode="cover" />
                    <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                      <Text style={styles.expTitle} numberOfLines={2}>{exp.title}</Text>
                      <Text style={styles.expPrice}>
                        {exp.price_label.split(' /')[0]}
                        <Text style={styles.expPriceUnit}>
                          {' '}/ {exp.category_name === 'Hospedagens' ? 'noite' : 'pessoa'}
                        </Text>
                      </Text>
                      <View style={styles.metaRow}>
                        <Ionicons name="flag-outline" size={14} color={QuixaColors.tertiary} />
                        <Text style={styles.metaText}>
                          {exp.bookings_count} {exp.bookings_count === 1 ? 'reserva confirmada' : 'reservas confirmadas'}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.expControls}>
                    <View style={styles.toggleRow}>
                      <Switch
                        value={exp.is_active}
                        onValueChange={(v) => handleToggle(exp.id, v)}
                        trackColor={{ false: QuixaColors.surfaceContainerHigh, true: QuixaColors.primary }}
                        thumbColor="#fff"
                        {...({ activeThumbColor: '#fff' } as any)}
                      />
                      <Text style={[styles.toggleLabel, !exp.is_active && styles.toggleLabelOff]}>
                        {exp.is_active ? 'Disponível' : 'Pausado'}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.editBtn}
                      onPress={() => router.push({ pathname: '/novo-passeio', params: { id: String(exp.id) } })}
                    >
                      <Ionicons name="pencil" size={16} color={QuixaColors.tertiary} />
                      <Text style={styles.editText}>Editar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              <TouchableOpacity style={styles.newExpBtn} onPress={() => router.push('/novo-passeio')}>
                <Ionicons name="add" size={20} color={QuixaColors.primary} />
                <Text style={styles.newExpText}>Cadastrar novo passeio</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      )}

      <ProviderTabBar active="painel" unread={data?.unread_messages || 0} />
    </SafeAreaView>
  );
}

const cardShadow = {
  shadowColor: '#dc6e3d',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.07,
  shadowRadius: 24,
  elevation: 2,
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: QuixaColors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    height: 64,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: QuixaColors.background,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
    zIndex: 2,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  headerLogo: { width: 32, height: 32 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: QuixaColors.onSurface },
  iconBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 16, paddingBottom: 32, gap: 16, width: '100%', maxWidth: 520, alignSelf: 'center' },

  errorBox: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    backgroundColor: QuixaColors.errorContainer,
    padding: 12,
    borderRadius: 16,
  },
  errorText: { color: QuixaColors.error, fontSize: 13, flex: 1 },

  greeting: { gap: 4, paddingTop: 4 },
  verifiedPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: QuixaColors.secondaryContainer,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  pendingPill: { backgroundColor: QuixaColors.errorContainer },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: QuixaColors.primary },
  verifiedText: { fontSize: 11, fontWeight: '700', color: '#2d1509' },
  hello: { fontSize: 28, fontWeight: '700', color: QuixaColors.onSurface, letterSpacing: -0.5, marginTop: 4 },
  helloSub: { fontSize: 14, color: QuixaColors.onSurfaceVariant, lineHeight: 20 },

  balanceCard: {
    backgroundColor: QuixaColors.surfaceContainerLow,
    borderRadius: 24,
    padding: 20,
    gap: 12,
    ...cardShadow,
  },
  balanceRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  balanceLabel: { fontSize: 12, fontWeight: '600', color: QuixaColors.onSurfaceVariant },
  balanceValue: { fontSize: 30, fontWeight: '800', color: QuixaColors.onSurface, letterSpacing: -0.5 },
  pixBtn: {
    minHeight: 48,
    paddingHorizontal: 18,
    borderRadius: 999,
    backgroundColor: QuixaColors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pixBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  toReceive: { fontSize: 12, color: QuixaColors.secondary },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ffdbcc',
    padding: 12,
    borderRadius: 16,
  },
  respondedBox: { backgroundColor: QuixaColors.secondaryContainer },
  successText: { flex: 1, fontSize: 12, fontWeight: '600', color: '#2d1509' },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 22, fontWeight: '700', color: QuixaColors.onSurface, letterSpacing: -0.2 },
  sectionHint: { fontSize: 12, fontWeight: '600', color: QuixaColors.primary },
  sectionCount: { fontSize: 12, color: QuixaColors.onSurfaceVariant },
  countBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: QuixaColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadgeText: { color: '#fff', fontWeight: '800', fontSize: 11 },

  emptyCard: {
    alignItems: 'center',
    gap: 8,
    padding: 24,
    borderRadius: 24,
    backgroundColor: QuixaColors.surfaceContainerLowest,
  },
  emptyText: { color: QuixaColors.onSurfaceVariant, fontSize: 13 },

  requestCard: {
    backgroundColor: QuixaColors.surfaceContainerLowest,
    borderRadius: 24,
    padding: 20,
    gap: 16,
    ...cardShadow,
  },
  requestTop: { flexDirection: 'row', gap: 16, alignItems: 'flex-start' },
  personBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: QuixaColors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  requestNameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 4 },
  requestName: { fontSize: 18, fontWeight: '600', color: QuixaColors.onSurface, flexShrink: 1 },
  requestPrice: { fontSize: 13, fontWeight: '700', color: QuixaColors.primary },
  requestTitle: { fontSize: 14, fontWeight: '500', color: QuixaColors.onSurfaceVariant },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4, flexWrap: 'wrap' },
  metaText: { fontSize: 12, color: QuixaColors.onSurfaceVariant },
  metaDot: { color: QuixaColors.outlineVariant, marginHorizontal: 2 },
  actionsGrid: { flexDirection: 'row', gap: 8 },
  rejectBtn: {
    flex: 1,
    minHeight: 48,
    borderRadius: 999,
    backgroundColor: QuixaColors.surfaceContainerHigh,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  rejectText: { fontSize: 13, fontWeight: '600', color: QuixaColors.onSurfaceVariant },
  acceptBtn: {
    flex: 1,
    minHeight: 48,
    borderRadius: 999,
    backgroundColor: QuixaColors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  acceptText: { fontSize: 13, fontWeight: '700', color: '#fff' },

  agendaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: QuixaColors.surfaceContainerLowest,
    borderRadius: 20,
    padding: 14,
    ...cardShadow,
  },
  agendaTitle: { fontSize: 15, fontWeight: '600', color: QuixaColors.onSurface },
  agendaMeta: { fontSize: 12, color: QuixaColors.onSurfaceVariant, marginTop: 2 },
  smallIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: QuixaColors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 20,
    backgroundColor: QuixaColors.secondaryContainer,
  },
  completeText: { fontSize: 12, fontWeight: '700', color: QuixaColors.primary },

  expCard: {
    backgroundColor: QuixaColors.surfaceContainerLow,
    borderRadius: 24,
    padding: 16,
    gap: 8,
    ...cardShadow,
  },
  expTop: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  expImg: { width: 80, height: 80, borderRadius: 16, backgroundColor: QuixaColors.surfaceContainerHigh },
  expTitle: { fontSize: 18, fontWeight: '600', color: QuixaColors.onSurface },
  expPrice: { fontSize: 14, fontWeight: '700', color: QuixaColors.primary },
  expPriceUnit: { fontSize: 12, fontWeight: '400', color: QuixaColors.onSurfaceVariant },
  expControls: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  toggleLabel: { fontSize: 13, fontWeight: '600', color: QuixaColors.onSurface },
  toggleLabelOff: { color: QuixaColors.outline, fontWeight: '400' },
  editBtn: {
    minHeight: 44,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: QuixaColors.surfaceContainer,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editText: { fontSize: 13, fontWeight: '600', color: QuixaColors.tertiary },
  newExpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 52,
    borderRadius: 999,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: QuixaColors.outlineVariant,
  },
  newExpText: { fontSize: 14, fontWeight: '700', color: QuixaColors.primary },
});
