import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { QuixaColors } from '@/constants/theme';

const IMAGES = {
  galinhaChoca:
    'https://lh3.googleusercontent.com/aida/AEtjO1WrQZCGCZER63HnyjvfvirHGKBp7hhVyYghMLAk3Ok7g-xBcMiwpiZoQZzYMDYAF2XcoEUeJ-OB0gDHwXIOMBivetJ8-kHCNl81rBmQhzFYAYcNFNhx1KKXJta_8QUS9c8zKuiEd6UxF14fexEBINO7Wl4qw_W8zM0D3TdatSnT8VQQUEVHgqUXbFtabbmyTbV3_md3M2flAlbYVhiseXAN0oKsdigScnSbjHGS3V-apHyY4UsInG8duO6y',
  parapente:
    'https://lh3.googleusercontent.com/aida/AEtjO1ULq5krg1C6Hq5Yi0yaIU5NvMZw04d5ysuccMBZlCJPEQUIVBrQ7k7BmIZhmce_cSC8PsKNga9N4z60MV1kfLedDORgWw2g-X8lk4LUf4gGKbAAOiXJm6cL2BKS9HDAEX5lkk33HK47vOxyzpHEv0_z8-wzIoznMlfGLlMCv_ZUTfXcdR1JO1eoOXhv2P8S0mGAASs-BCQtb4MGwKf00K2IPBbQ9FYTGLc5dtsRKb3ul-9fxJ8DJ2-UjB8',
  cruzeiro:
    'https://lh3.googleusercontent.com/aida/AEtjO1VNpjnUCFii8AMtNSICMd0ftd5wXa1Qg6OOQPKEzXfAXB0sYGCtGUwPs0uEZevZErCkA_Zm2hIJPm59vgK9uDc3XtjewEo-x2V5QcKCo_VV3OxwfjDOYeYvT7n_SYgqNB1UrtYENaxkbVhRPCryhbYcfyJQiFAo67aopIQSebXL3Q80wkJaQF8P8k7kqdfowy8O27yRCjNx8OpAr9xOhGbnCqeOo9geUnOoxysgODjiaGkRjX3EWTQMHFSI',
};

export default function ReservasScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'proximas' | 'concluidas'>('proximas');
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [navTab, setNavTab] = useState<'explorar' | 'favoritos' | 'notificacoes' | 'reservas'>('reservas');

  const handleOpenVoucher = () => {
    setShowVoucherModal(true);
  };

  const handleProfilePress = () => {
    Alert.alert(
      'Perfil de Usuário',
      'Deseja sair do aplicativo e retornar ao login?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair da Conta',
          style: 'destructive',
          onPress: () => router.replace('/'),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff8f6" />

      {/* Top App Bar Header */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.logoBadge}>
            <Ionicons name="compass" size={20} color="#ffffff" />
          </View>
          <Text style={styles.brandTitle}>QuixaTour</Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity activeOpacity={0.7} style={styles.iconBtn}>
            <Ionicons name="search-outline" size={22} color={QuixaColors.onSurfaceVariant} />
          </TouchableOpacity>

          {/* Botão de Perfil Superior Direito */}
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.profileBtn}
            onPress={handleProfilePress}
            accessibilityLabel="Perfil do usuário"
          >
            <Ionicons name="person" size={18} color="#7e3f22" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
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
                  2
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
              <Text style={styles.concluidasSubtext}>(1)</Text>
            </TouchableOpacity>
          </View>

          {/* TAB 1: Próximas Reservas */}
          {activeTab === 'proximas' && (
            <View style={styles.tabContentGroup}>
              {/* Card Principal Hero */}
              <View style={styles.heroCard}>
                <View style={styles.cardStatusRow}>
                  <View style={styles.confirmedTag}>
                    <Ionicons name="checkmark-circle" size={14} color="#8c3d17" />
                    <Text style={styles.confirmedTagText}>Confirmado</Text>
                  </View>
                  <Text style={styles.reservationCodeText}>#QX-4892</Text>
                </View>

                {/* Hero Image */}
                <View style={styles.heroImageWrapper}>
                  <Image
                    source={{ uri: IMAGES.galinhaChoca }}
                    style={styles.heroImg}
                    resizeMode="cover"
                  />
                  <View style={styles.scheduleOverlay}>
                    <Ionicons name="time-outline" size={14} color="#ffffff" />
                    <Text style={styles.scheduleOverlayText}>Amanhã, 05:30</Text>
                  </View>
                </View>

                {/* Title & Location */}
                <View style={styles.titleBlock}>
                  <Text style={styles.heroTitle}>
                    Trilha Galinha Choca & Açude do Cedro
                  </Text>
                  <View style={styles.locationSubRow}>
                    <Ionicons name="location" size={15} color={QuixaColors.primary} />
                    <Text style={styles.locationSubText}>
                      Cancela Monumental Cedro • 3h 30m
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
                      <Text style={styles.guideStripName}>Guia Zé</Text>
                      <Text style={styles.guideStripRole}>Guia Credenciado</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.chatMiniBtn}
                    onPress={() => router.push('/chat' as any)}
                  >
                    <Ionicons name="chatbubble-outline" size={16} color="#783616" />
                    <Text style={styles.chatMiniBtnText}>Chat</Text>
                  </TouchableOpacity>
                </View>

                {/* Primary Action Button: Ver Voucher */}
                <TouchableOpacity
                  activeOpacity={0.88}
                  style={styles.voucherBtn}
                  onPress={handleOpenVoucher}
                >
                  <Ionicons name="qr-code-outline" size={20} color="#ffffff" />
                  <Text style={styles.voucherBtnText}>Ver Voucher</Text>
                </TouchableOpacity>
              </View>

              {/* Section: EM SEGUIDA */}
              <View style={styles.nextSection}>
                <Text style={styles.nextSectionTitle}>EM SEGUIDA</Text>

                {/* Compact Card: Voo Livre */}
                <View style={styles.compactCard}>
                  <View style={styles.cardStatusRow}>
                    <View style={styles.confirmedTag}>
                      <Ionicons name="checkmark" size={13} color="#8c3d17" />
                      <Text style={styles.confirmedTagText}>Confirmado • Voo Duplo</Text>
                    </View>
                    <Text style={styles.reservationCodeText}>#QX-5104</Text>
                  </View>

                  <View style={styles.compactBodyRow}>
                    <Image
                      source={{ uri: IMAGES.parapente }}
                      style={styles.compactThumb}
                      resizeMode="cover"
                    />

                    <View style={styles.compactInfoCol}>
                      <View style={styles.dateTagRow}>
                        <Ionicons name="calendar-outline" size={13} color={QuixaColors.primary} />
                        <Text style={styles.dateTagText}>SÁB, 24 DE OUTUBRO • 14:00</Text>
                      </View>

                      <Text style={styles.compactTitle} numberOfLines={1}>
                        Voo Livre na Serra do Urucum
                      </Text>

                      <View style={styles.instructorRow}>
                        <Ionicons name="navigate-outline" size={14} color={QuixaColors.primary} />
                        <Text style={styles.instructorText}>Instrutor Chico Asas</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.compactFooterRow}>
                    <Text style={styles.compactPrice}>R$ 380,00</Text>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={styles.detailsMiniBtn}
                      onPress={() =>
                        router.push({
                          pathname: '/details',
                          params: {
                            title: 'Voo Duplo de Parapente',
                            price: 'R$ 380',
                            image: IMAGES.parapente,
                          },
                        })
                      }
                    >
                      <Text style={styles.detailsMiniBtnText}>Detalhes</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* TAB 2: Concluídas */}
          {activeTab === 'concluidas' && (
            <View style={styles.tabContentGroup}>
              <View style={styles.compactCard}>
                <View style={styles.cardStatusRow}>
                  <View style={styles.completedTag}>
                    <Ionicons name="checkmark-done-outline" size={13} color="#6b5650" />
                    <Text style={styles.completedTagText}>Concluído</Text>
                  </View>
                  <Text style={styles.completedDateText}>02 Out 2024</Text>
                </View>

                <View style={styles.compactBodyRow}>
                  <Image
                    source={{ uri: IMAGES.cruzeiro }}
                    style={styles.compactThumb}
                    resizeMode="cover"
                  />

                  <View style={styles.compactInfoCol}>
                    <Text style={styles.compactTitle}>
                      Pedra do Cruzeiro ao Pôr do Sol
                    </Text>
                    <Text style={styles.completedMetaText}>
                      Guia Clenilda Rocha • 2 Pessoas
                    </Text>
                    <Text style={styles.completedPriceText}>R$ 140,00</Text>
                  </View>
                </View>

                <View style={styles.compactFooterRow}>
                  <View style={styles.starsRow}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Ionicons key={s} name="star" size={18} color={QuixaColors.primary} />
                    ))}
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.detailsMiniBtn}
                    onPress={() => Alert.alert('Recibo', 'Recibo da reserva #QX-3901 baixado.')}
                  >
                    <Text style={styles.detailsMiniBtnText}>Recibo</Text>
                  </TouchableOpacity>
                </View>
              </View>
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

            <Text style={styles.voucherCodeBig}>#QX-4892</Text>

            {/* Simulated QR Code Box */}
            <View style={styles.qrCodeBox}>
              <Ionicons name="qr-code" size={140} color={QuixaColors.onSurface} />
            </View>

            <Text style={styles.voucherExpTitle}>
              Trilha Galinha Choca & Açude do Cedro
            </Text>
            <Text style={styles.voucherExpSub}>
              Apresente este código ao Guia Zé na saída da trilha.
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
          style={[styles.navBtn, navTab === 'explorar' && styles.navBtnActive]}
          onPress={() => {
            setNavTab('explorar');
            router.replace('/explore');
          }}
        >
          <Ionicons
            name="compass"
            size={24}
            color={navTab === 'explorar' ? '#ffffff' : QuixaColors.secondary}
          />
        </TouchableOpacity>

        {/* Tab 2: Favoritos */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.navBtn, navTab === 'favoritos' && styles.navBtnActive]}
          onPress={() => setNavTab('favoritos')}
        >
          <Ionicons
            name={navTab === 'favoritos' ? 'heart' : 'heart-outline'}
            size={24}
            color={navTab === 'favoritos' ? '#ffffff' : QuixaColors.secondary}
          />
        </TouchableOpacity>

        {/* Tab 3: Notificações */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.navBtn, navTab === 'notificacoes' && styles.navBtnActive]}
          onPress={() => setNavTab('notificacoes')}
        >
          <Ionicons
            name={navTab === 'notificacoes' ? 'notifications' : 'notifications-outline'}
            size={24}
            color={navTab === 'notificacoes' ? '#ffffff' : QuixaColors.secondary}
          />
        </TouchableOpacity>

        {/* Tab 4: Ticket / Minhas Reservas (Ativo) */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.navBtn, navTab === 'reservas' && styles.navBtnActive]}
          onPress={() => setNavTab('reservas')}
          accessibilityLabel="Minhas Reservas"
        >
          <Ionicons
            name={navTab === 'reservas' ? 'ticket' : 'ticket-outline'}
            size={24}
            color={navTab === 'reservas' ? '#ffffff' : QuixaColors.secondary}
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
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 248, 246, 0.9)',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 14,
    backgroundColor: '#c55d28',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: QuixaColors.onSurface,
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fce5dc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 90,
    paddingTop: 8,
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
  detailsMiniBtn: {
    height: 32,
    paddingHorizontal: 16,
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
