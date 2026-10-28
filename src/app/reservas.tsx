import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  StatusBar,
  Alert,
  Modal,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { QuixaColors } from '@/constants/theme';
import { AppImages } from '@/constants/images';
import { ReservasService, ReservationItem } from '@/services/reservasService';

export default function ReservasScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'proximas' | 'concluidas'>('proximas');
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<{
    code: string;
    title: string;
    qrCode: string;
    instructions: string;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [proximas, setProximas] = useState<ReservationItem[]>([]);
  const [concluidas, setConcluidas] = useState<ReservationItem[]>([]);
  const [counts, setCounts] = useState({ proximas: 0, concluidas: 0 });

  const loadReservations = useCallback(async () => {
    try {
      const data = await ReservasService.getReservations();
      if (data) {
        setProximas(data.proximas || []);
        setConcluidas(data.concluidas || []);
        setCounts(data.counts || {
          proximas: (data.proximas || []).length,
          concluidas: (data.concluidas || []).length,
        });
      }
    } catch (err) {
      console.warn('Erro ao carregar reservas:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadReservations();
  }, [loadReservations]);

  const onRefresh = () => {
    setRefreshing(true);
    loadReservations();
  };

  const handleOpenVoucher = async (item: ReservationItem) => {
    try {
      const voucherData = await ReservasService.getVoucher(item.reservation_code || item.id);
      setSelectedVoucher({
        code: voucherData.reservation_code || item.reservation_code,
        title: voucherData.title || item.title,
        qrCode: voucherData.qr_code_data || item.qr_code_data || 'QUIXATOUR-VOUCHER',
        instructions: voucherData.voucher_instructions || item.voucher_instructions || 'Apresente este código ao condutor/guia credenciado no início do passeio.',
      });
      setShowVoucherModal(true);
    } catch (err) {
      setSelectedVoucher({
        code: item.reservation_code,
        title: item.title,
        qrCode: item.qr_code_data || 'QUIXATOUR-VOUCHER',
        instructions: item.voucher_instructions || 'Apresente este código ao condutor/guia credenciado.',
      });
      setShowVoucherModal(true);
    }
  };

  const handleReceipt = async (item: ReservationItem) => {
    try {
      const receipt = await ReservasService.getReceipt(item.reservation_code || item.id);
      Alert.alert(
        'Comprovante de Reserva',
        `Código: ${receipt.reservation_code || item.reservation_code}\n` +
        `Experiência: ${receipt.title || item.title}\n` +
        `Data: ${receipt.date || item.date_label}\n` +
        `Participantes: ${receipt.participants || item.participants}\n` +
        `Total Pago: R$ ${(receipt.total || item.total).toFixed(2).replace('.', ',')}\n` +
        `Método: ${receipt.payment_method || 'Pix'}\n\n` +
        `Status: Transação concluída com sucesso.`,
        [{ text: 'Fechar', style: 'default' }]
      );
    } catch (err) {
      Alert.alert('Recibo', `Recibo da reserva ${item.reservation_code} verificado.`);
    }
  };

  const handleReview = (item: ReservationItem) => {
    router.push({
      pathname: '/avaliar',
      params: {
        reservationId: String(item.id),
        experienceId: String(item.id),
        title: item.title,
        guideName: item.guide?.name || 'Guia Zé',
      },
    });
  };

  const getImageSource = (key: string) => {
    if (key === 'trilha') return AppImages.trilha;
    if (key === 'voo') return AppImages.voo;
    if (key === 'chale') return AppImages.chale;
    if (key && key.startsWith('http')) return { uri: key };
    return AppImages.trilha;
  };

  const heroItem = proximas.length > 0 ? proximas[0] : null;
  const remainingUpcoming = proximas.slice(1);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff8f6" />

      {/* Main Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[QuixaColors.primary]} />
        }
      >
        <View style={styles.mainContainer}>
          {/* Screen Title Bar */}
          <View style={styles.titleRow}>
            <Text style={styles.screenTitle}>Minhas Reservas</Text>
            <TouchableOpacity activeOpacity={0.8} style={styles.ticketBtn}>
              <Ionicons name="ticket-outline" size={22} color="#a34b1d" />
            </TouchableOpacity>
          </View>

          {/* Segmented Tabs Filter */}
          <View style={styles.segmentedContainer}>
            <TouchableOpacity
              activeOpacity={0.9}
              style={[
                styles.segmentBtn,
                activeTab === 'proximas' && styles.segmentBtnActive,
              ]}
              onPress={() => setActiveTab('proximas')}
            >
              <Text
                style={[
                  styles.segmentText,
                  activeTab === 'proximas' && styles.segmentTextActive,
                ]}
              >
                Próximas
              </Text>
              <View
                style={[
                  styles.countBadge,
                  activeTab === 'proximas' && styles.countBadgeActive,
                ]}
              >
                <Text
                  style={[
                    styles.countBadgeText,
                    activeTab === 'proximas' && styles.countBadgeTextActive,
                  ]}
                >
                  {counts.proximas}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.9}
              style={[
                styles.segmentBtn,
                activeTab === 'concluidas' && styles.segmentBtnActive,
              ]}
              onPress={() => setActiveTab('concluidas')}
            >
              <Text
                style={[
                  styles.segmentText,
                  activeTab === 'concluidas' && styles.segmentTextActive,
                ]}
              >
                Concluídas
              </Text>
              <Text style={styles.concluidasSubtext}>({counts.concluidas})</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <ActivityIndicator size="large" color={QuixaColors.primary} />
            </View>
          ) : null}

          {/* TAB 1: Próximas Reservas */}
          {!loading && activeTab === 'proximas' && (
            <View style={styles.tabContentGroup}>
              {heroItem ? (
                /* Card Principal Hero */
                <View style={styles.heroCard}>
                  <View style={styles.cardStatusRow}>
                    <View style={styles.confirmedTag}>
                      <Ionicons name="checkmark-circle" size={14} color="#8c3d17" />
                      <Text style={styles.confirmedTagText}>Confirmado</Text>
                    </View>
                    <Text style={styles.reservationCodeText}>{heroItem.reservation_code}</Text>
                  </View>

                  {/* Hero Image */}
                  <View style={styles.heroImageWrapper}>
                    <Image
                      source={getImageSource(heroItem.image_key)}
                      style={styles.heroImg}
                      resizeMode="cover"
                    />
                    <View style={styles.scheduleOverlay}>
                      <Ionicons name="time-outline" size={14} color="#ffffff" />
                      <Text style={styles.scheduleOverlayText}>{heroItem.schedule_text}</Text>
                    </View>
                  </View>

                  {/* Title & Location */}
                  <View style={styles.titleBlock}>
                    <Text style={styles.heroTitle}>
                      {heroItem.title}
                    </Text>
                    <View style={styles.locationSubRow}>
                      <Ionicons name="location" size={15} color={QuixaColors.primary} />
                      <Text style={styles.locationSubText}>
                        {heroItem.meeting_point || 'Cancela Monumental Cedro • 3h 30m'}
                      </Text>
                    </View>
                  </View>

                  {/* Guide Information Strip */}
                  <View style={styles.guideStrip}>
                    <View style={styles.guideStripLeft}>
                      <View style={styles.guideStripAvatar}>
                        <Ionicons name="person" size={20} color="#8e4523" />
                      </View>
                      <View style={styles.guideStripCol}>
                        <Text style={styles.guideStripName}>
                          {heroItem.guide?.name || 'Guia Zé'}
                        </Text>
                        <Text style={styles.guideStripRole}>
                          {heroItem.guide?.role || 'Guia Credenciado'}
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={styles.chatMiniBtn}
                      onPress={() =>
                        router.push({
                          pathname: '/chat',
                          params: {
                            guideId: String(heroItem.guide?.id || 1),
                            guideName: heroItem.guide?.name || 'Guia Zé',
                            guideRole: heroItem.guide?.role || 'Guia Credenciado',
                          },
                        })
                      }
                    >
                      <Ionicons name="chatbubble-outline" size={16} color="#783616" />
                      <Text style={styles.chatMiniBtnText}>Chat</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Primary Action Button: Ver Voucher */}
                  <TouchableOpacity
                    activeOpacity={0.88}
                    style={styles.voucherBtn}
                    onPress={() => handleOpenVoucher(heroItem)}
                  >
                    <Ionicons name="qr-code-outline" size={20} color="#ffffff" />
                    <Text style={styles.voucherBtnText}>Ver Voucher</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={{ padding: 24, alignItems: 'center' }}>
                  <Text style={{ color: QuixaColors.onSurfaceVariant, fontSize: 14 }}>
                    Nenhuma reserva futura no momento.
                  </Text>
                </View>
              )}

              {/* Section: EM SEGUIDA (Se houver mais de 1 reserva) */}
              {remainingUpcoming.length > 0 && (
                <View style={styles.nextSection}>
                  <Text style={styles.nextSectionTitle}>EM SEGUIDA</Text>

                  {remainingUpcoming.map((item) => (
                    <View key={item.id} style={styles.compactCard}>
                      <View style={styles.cardStatusRow}>
                        <View style={styles.confirmedTag}>
                          <Ionicons name="checkmark" size={13} color="#8c3d17" />
                          <Text style={styles.confirmedTagText}>Confirmado</Text>
                        </View>
                        <Text style={styles.reservationCodeText}>{item.reservation_code}</Text>
                      </View>

                      <View style={styles.compactBodyRow}>
                        <Image
                          source={getImageSource(item.image_key)}
                          style={styles.compactThumb}
                          resizeMode="cover"
                        />

                        <View style={styles.compactInfoCol}>
                          <View style={styles.dateTagRow}>
                            <Ionicons name="calendar-outline" size={13} color={QuixaColors.primary} />
                            <Text style={styles.dateTagText}>{item.schedule_text}</Text>
                          </View>

                          <Text style={styles.compactTitle} numberOfLines={1}>
                            {item.title}
                          </Text>

                          <View style={styles.instructorRow}>
                            <Ionicons name="navigate-outline" size={14} color={QuixaColors.primary} />
                            <Text style={styles.instructorText}>
                              {item.guide?.name || 'Condutor Credenciado'}
                            </Text>
                          </View>
                        </View>
                      </View>

                      <View style={styles.compactFooterRow}>
                        <Text style={styles.compactPrice}>{item.formatted_price}</Text>
                        <View style={styles.concluidasActionsRow}>
                          <TouchableOpacity
                            activeOpacity={0.8}
                            style={styles.detailsMiniBtn}
                            onPress={() => handleOpenVoucher(item)}
                          >
                            <Text style={styles.detailsMiniBtnText}>Voucher</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            activeOpacity={0.8}
                            style={[styles.detailsMiniBtn, { backgroundColor: '#fbdcd0' }]}
                            onPress={() =>
                              router.push({
                                pathname: '/details',
                                params: {
                                  id: String(item.id),
                                  title: item.title,
                                  price: item.formatted_price,
                                  image: item.image_key,
                                },
                              })
                            }
                          >
                            <Text style={[styles.detailsMiniBtnText, { color: '#783616' }]}>Detalhes</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* TAB 2: Concluídas */}
          {!loading && activeTab === 'concluidas' && (
            <View style={styles.tabContentGroup}>
              {concluidas.length === 0 ? (
                <View style={{ padding: 24, alignItems: 'center' }}>
                  <Text style={{ color: QuixaColors.onSurfaceVariant, fontSize: 14 }}>
                    Nenhuma reserva concluída ainda.
                  </Text>
                </View>
              ) : (
                concluidas.map((item) => (
                  <View key={item.id} style={styles.compactCard}>
                    <View style={styles.cardStatusRow}>
                      <View style={styles.completedTag}>
                        <Ionicons name="checkmark-done-outline" size={13} color="#6b5650" />
                        <Text style={styles.completedTagText}>Concluído</Text>
                      </View>
                      <Text style={styles.completedDateText}>{item.date_label}</Text>
                    </View>

                    <View style={styles.compactBodyRow}>
                      <Image
                        source={getImageSource(item.image_key)}
                        style={styles.compactThumb}
                        resizeMode="cover"
                      />

                      <View style={styles.compactInfoCol}>
                        <Text style={styles.compactTitle}>
                          {item.title}
                        </Text>
                        <Text style={styles.completedMetaText}>
                          {item.guide?.name ? `Guia ${item.guide.name}` : 'Guia Local'} • {item.participants} {item.participants === 1 ? 'Pessoa' : 'Pessoas'}
                        </Text>
                        <Text style={styles.completedPriceText}>{item.formatted_price}</Text>
                      </View>
                    </View>

                    <View style={styles.compactFooterRow}>
                      <View style={styles.starsRow}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Ionicons
                            key={s}
                            name={s <= (item.rating || 5) ? 'star' : 'star-outline'}
                            size={16}
                            color={QuixaColors.primary}
                          />
                        ))}
                      </View>
                      <View style={styles.concluidasActionsRow}>
                        <TouchableOpacity
                          activeOpacity={0.8}
                          style={styles.detailsMiniBtn}
                          onPress={() => handleReceipt(item)}
                        >
                          <Text style={styles.detailsMiniBtnText}>Recibo</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          activeOpacity={0.85}
                          style={styles.avaliarBtn}
                          onPress={() => handleReview(item)}
                        >
                          <Ionicons name="star" size={13} color="#ffffff" />
                          <Text style={styles.avaliarBtnText}>Avaliar</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Voucher Modal */}
      <Modal
        visible={showVoucherModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowVoucherModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.voucherModalCard}>
            <View style={styles.voucherHeaderRow}>
              <Text style={styles.voucherModalTitle}>Voucher Digital</Text>
              <TouchableOpacity
                onPress={() => setShowVoucherModal(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={22} color={QuixaColors.onSurface} />
              </TouchableOpacity>
            </View>

            <Text style={styles.voucherCodeBig}>
              {selectedVoucher?.code || '#QX-4892'}
            </Text>

            {/* Simulated QR Code Box */}
            <View style={styles.qrCodeBox}>
              <Ionicons name="qr-code" size={140} color={QuixaColors.onSurface} />
            </View>

            <Text style={styles.voucherExpTitle}>
              {selectedVoucher?.title || 'Experiência QuixaTour'}
            </Text>
            <Text style={styles.voucherExpSub}>
              {selectedVoucher?.instructions || 'Apresente este código ao guia no local de partida.'}
            </Text>

            <TouchableOpacity
              activeOpacity={0.88}
              style={styles.modalOkBtn}
              onPress={() => setShowVoucherModal(false)}
            >
              <Text style={styles.modalOkBtnText}>Fechar Voucher</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        {/* Tab 1: Explorar */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.navBtn}
          onPress={() => router.replace('/explore')}
        >
          <Ionicons
            name="compass-outline"
            size={24}
            color={QuixaColors.secondary}
          />
        </TouchableOpacity>

        {/* Tab 2: Favoritos */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.navBtn}
          onPress={() => router.replace('/explore')}
        >
          <Ionicons
            name="heart-outline"
            size={24}
            color={QuixaColors.secondary}
          />
        </TouchableOpacity>

        {/* Tab 3: Notificações */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.navBtn}
          onPress={() => Alert.alert('Notificações', 'Você está com todas as reservas confirmadas!')}
        >
          <Ionicons
            name="notifications-outline"
            size={24}
            color={QuixaColors.secondary}
          />
        </TouchableOpacity>

        {/* Tab 4: Ticket / Minhas Reservas (Ativo) */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.navBtn, styles.navBtnActive]}
          accessibilityLabel="Minhas Reservas"
        >
          <Ionicons
            name="ticket"
            size={24}
            color="#ffffff"
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: QuixaColors.background,
  },
  scrollContent: {
    paddingBottom: 90,
    paddingTop: 24,
  },
  mainContainer: {
    maxWidth: 390,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 16,
    gap: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: QuixaColors.onSurface,
    letterSpacing: -0.5,
  },
  ticketBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fdeae5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  segmentedContainer: {
    width: '100%',
    backgroundColor: '#faece7',
    padding: 6,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
  },
  segmentBtn: {
    flex: 1,
    height: 38,
    borderRadius: 19,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  segmentBtnActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b5650',
  },
  segmentTextActive: {
    color: QuixaColors.primary,
  },
  countBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#f1dfd9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  countBadgeActive: {
    backgroundColor: QuixaColors.primary,
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: QuixaColors.onSurfaceVariant,
  },
  countBadgeTextActive: {
    color: '#ffffff',
  },
  concluidasSubtext: {
    fontSize: 12,
    color: '#7d6761',
  },
  tabContentGroup: {
    gap: 16,
  },
  heroCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f5ded5',
    gap: 12,
    shadowColor: QuixaColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  cardStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  confirmedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fce5dc',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  confirmedTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8c3d17',
  },
  reservationCodeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8c3d17',
    letterSpacing: 0.5,
  },
  heroImageWrapper: {
    width: '100%',
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  heroImg: {
    width: '100%',
    height: '100%',
  },
  scheduleOverlay: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  scheduleOverlayText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#ffffff',
  },
  titleBlock: {
    gap: 4,
  },
  heroTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: QuixaColors.onSurface,
    lineHeight: 22,
  },
  locationSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationSubText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#7a645d',
  },
  guideStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fbf1ed',
    padding: 10,
    borderRadius: 16,
  },
  guideStripLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  guideStripAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fae0d5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideStripCol: {
    flexDirection: 'column',
  },
  guideStripName: {
    fontSize: 12,
    fontWeight: '700',
    color: QuixaColors.onSurface,
  },
  guideStripRole: {
    fontSize: 11,
    color: '#7a645d',
  },
  chatMiniBtn: {
    height: 32,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: '#fbdcd0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chatMiniBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#783616',
  },
  voucherBtn: {
    height: 48,
    borderRadius: 16,
    backgroundColor: QuixaColors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: QuixaColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  voucherBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  nextSection: {
    gap: 8,
    marginTop: 4,
  },
  nextSectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#806a64',
    letterSpacing: 0.5,
    marginLeft: 4,
  },
  compactCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 14,
    borderWidth: 1,
    borderColor: '#f5ded5',
    gap: 10,
  },
  compactBodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  compactThumb: {
    width: 64,
    height: 64,
    borderRadius: 16,
  },
  compactInfoCol: {
    flex: 1,
    gap: 2,
  },
  dateTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: QuixaColors.primary,
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: QuixaColors.onSurface,
  },
  instructorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  instructorText: {
    fontSize: 11,
    color: '#7a645d',
  },
  compactFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  compactPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: QuixaColors.onSurface,
  },
  concluidasActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailsMiniBtn: {
    height: 32,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: '#fdeae5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsMiniBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8c3d17',
  },
  avaliarBtn: {
    height: 32,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: QuixaColors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    shadowColor: QuixaColors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  avaliarBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  completedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ece5e2',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  completedTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6b5650',
  },
  completedDateText: {
    fontSize: 12,
    color: '#7a645d',
  },
  completedMetaText: {
    fontSize: 12,
    color: '#7a645d',
  },
  completedPriceText: {
    fontSize: 12,
    fontWeight: '700',
    color: QuixaColors.primary,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  voucherModalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#ffffff',
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  voucherHeaderRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  voucherModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: QuixaColors.onSurface,
  },
  modalCloseBtn: {
    padding: 4,
  },
  voucherCodeBig: {
    fontSize: 22,
    fontWeight: '800',
    color: QuixaColors.primary,
    letterSpacing: 1,
  },
  qrCodeBox: {
    padding: 16,
    backgroundColor: '#fdeae5',
    borderRadius: 20,
    marginVertical: 8,
  },
  voucherExpTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: QuixaColors.onSurface,
    textAlign: 'center',
  },
  voucherExpSub: {
    fontSize: 12,
    color: '#7a645d',
    textAlign: 'center',
  },
  modalOkBtn: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    backgroundColor: QuixaColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  modalOkBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 72,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderTopColor: '#fde0d4',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 8,
  },
  navBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navBtnActive: {
    backgroundColor: QuixaColors.primary,
  },
});
