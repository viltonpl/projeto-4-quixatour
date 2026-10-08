import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Animated,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { QuixaColors } from '@/constants/theme';

const DEFAULT_IMAGE =
  'https://lh3.googleusercontent.com/aida/AEtjO1WrQZCGCZER63HnyjvfvirHGKBp7hhVyYghMLAk3Ok7g-xBcMiwpiZoQZzYMDYAF2XcoEUeJ-OB0gDHwXIOMBivetJ8-kHCNl81rBmQhzFYAYcNFNhx1KKXJta_8QUS9c8zKuiEd6UxF14fexEBINO7Wl4qw_W8zM0D3TdatSnT8VQQUEVHgqUXbFtabbmyTbV3_md3M2flAlbYVhiseXAN0oKsdigScnSbjHGS3V-apHyY4UsInG8duO6y';

const GUIDE_AVATAR =
  'https://lh3.googleusercontent.com/aida/AEtjO1XPS9iyG2Ap4zHB749LkMjtbCus-bYJkUA3cL_qqSpKYS7SddbCQYYt3AmTOAKfhkZmHWL-9VaaEVNgIQdjeAA36tetsCJHAwuJnJhMneTN4QqNf-l2_GQ2tbdyBabqg7pgAZhMX5aUnRNt8_dr6KyzQGWdWqcdaq5ZH3m9Wm-plM_EP4N7WrcL6wNhaPpOjpftgyJLsUFtwnsFmwwyI4dblmlAhFMPJm8b-HiWi9W1dh1Y7ElfaRtEqQ';

export default function CheckoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const title = (params.title as string) || 'Trilha da Galinha Choca & Açude do Cedro';
  const imageUri = (params.image as string) || DEFAULT_IMAGE;

  // Base price calculation (default 85.0)
  const rawPriceStr = (params.price as string) || '85';
  const numericPrice = parseFloat(rawPriceStr.replace(/[^0-9,.]/g, '').replace(',', '.')) || 85.0;

  const [participants, setParticipants] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit'>('pix');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [installments, setInstallments] = useState('3');

  const [showToast, setShowToast] = useState(false);
  const toastAnim = useState(() => new Animated.Value(-60))[0];

  const subtotal = numericPrice * participants;
  const isPix = paymentMethod === 'pix';
  const discount = isPix ? subtotal * 0.05 : 0;
  const total = subtotal - discount;

  const handleIncrease = () => {
    if (participants < 8) setParticipants(participants + 1);
  };

  const handleDecrease = () => {
    if (participants > 1) setParticipants(participants - 1);
  };

  const handleCopyPix = () => {
    setShowToast(true);
    Animated.spring(toastAnim, {
      toValue: 20,
      useNativeDriver: true,
      friction: 8,
    }).start();

    setTimeout(() => {
      Animated.timing(toastAnim, {
        toValue: -60,
        duration: 250,
        useNativeDriver: true,
      }).start(() => setShowToast(false));
    }, 2500);
  };

  const handleSubmitPayment = () => {
    if (!isPix && (!cardNumber.trim() || !cardExpiry.trim() || !cardCvv.trim())) {
      if (Platform.OS === 'web') {
        window.alert('Por favor, preencha os dados do cartão de crédito (Número, Validade e CVV).');
      } else {
        Alert.alert('Dados Incompletos', 'Por favor, preencha os dados do cartão de crédito.');
      }
      return;
    }

    // Direct, immediate navigation to /reservas for reliable execution across Web and Mobile!
    router.replace('/reservas');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff8f6" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.backBtn}
          onPress={() => router.back()}
          accessibilityLabel="Voltar"
        >
          <Ionicons name="arrow-back" size={24} color={QuixaColors.onSurface} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Checkout</Text>

        <View style={styles.profileBadge}>
          <Ionicons name="person" size={18} color={QuixaColors.primary} />
        </View>
      </View>

      {/* Toast Feedback */}
      {showToast && (
        <Animated.View
          style={[
            styles.toast,
            { transform: [{ translateY: toastAnim }] },
          ]}
        >
          <Ionicons name="copy-outline" size={18} color={QuixaColors.primaryFixedDim} />
          <Text style={styles.toastText}>Chave Pix copiada com sucesso!</Text>
        </Animated.View>
      )}

      {/* Main Content Scroll */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.mainContainer}>
          {/* 1. Resumo da Reserva Card */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeaderRow}>
              <View style={styles.summaryImgWrapper}>
                <Image
                  source={{ uri: imageUri }}
                  style={styles.summaryImg}
                  resizeMode="cover"
                />
              </View>

              <View style={styles.summaryTextCol}>
                <Text style={styles.expLabel}>EXPERIÊNCIA</Text>
                <Text style={styles.summaryTitle} numberOfLines={2}>
                  {title}
                </Text>

                <View style={styles.guideBadgeRow}>
                  <Image
                    source={{ uri: GUIDE_AVATAR }}
                    style={styles.guideAvatarMini}
                  />
                  <Text style={styles.guideNameText} numberOfLines={1}>
                    Seu Zé do Monólito
                  </Text>
                  <Ionicons name="checkmark-circle" size={14} color={QuixaColors.primary} />
                </View>
              </View>
            </View>

            {/* Sub-card details */}
            <View style={styles.subDetailsContainer}>
              <View style={styles.subDetailRow}>
                <View style={styles.subDetailLabelRow}>
                  <Ionicons name="sunny-outline" size={18} color={QuixaColors.primary} />
                  <Text style={styles.subDetailLabel}>Data e Saída</Text>
                </View>
                <Text style={styles.subDetailValue}>Amanhã, 05:30</Text>
              </View>

              <View style={[styles.subDetailRow, styles.subDetailRowBorder]}>
                <View style={styles.subDetailLabelRow}>
                  <Ionicons name="people-outline" size={18} color={QuixaColors.primary} />
                  <Text style={styles.subDetailLabel}>Participantes</Text>
                </View>

                <View style={styles.counterRow}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.counterBtnMinus}
                    onPress={handleDecrease}
                  >
                    <Ionicons name="remove" size={16} color={QuixaColors.onSurface} />
                  </TouchableOpacity>

                  <Text style={styles.counterText}>
                    {participants === 1 ? '1 adulto' : `${participants} adultos`}
                  </Text>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.counterBtnPlus}
                    onPress={handleIncrease}
                  >
                    <Ionicons name="add" size={16} color={QuixaColors.onPrimary} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* 2. Seleção de Método de Pagamento */}
          <View style={styles.paymentSection}>
            <View style={styles.paymentSectionHeader}>
              <Text style={styles.paymentSectionTitle}>Forma de Pagamento</Text>
              <Text style={styles.paymentSectionSub}>Selecione sua preferência</Text>
            </View>

            {/* Opção 1: Pix */}
            <TouchableOpacity
              activeOpacity={0.92}
              style={[
                styles.paymentCard,
                isPix && styles.paymentCardSelected,
              ]}
              onPress={() => setPaymentMethod('pix')}
            >
              <View style={styles.paymentCardHeader}>
                <View style={styles.paymentCardLeft}>
                  <View
                    style={[
                      styles.radioCircle,
                      isPix && styles.radioCircleActive,
                    ]}
                  >
                    {isPix && (
                      <Ionicons name="checkmark" size={16} color="#ffffff" />
                    )}
                  </View>

                  <View style={styles.paymentTitleWrap}>
                    <Text style={styles.paymentTitle}>Pix</Text>
                    <View style={styles.recommendBadge}>
                      <Text style={styles.recommendText}>Recomendado (-5%)</Text>
                    </View>
                  </View>
                </View>

                <Ionicons name="qr-code-outline" size={24} color={QuixaColors.primary} />
              </View>

              <Text style={styles.paymentDesc}>
                Pagamento instantâneo com aprovação imediata da reserva.
              </Text>

              {/* Detalhes do Pix quando ativo */}
              {isPix && (
                <View style={styles.pixContentBox}>
                  <View style={styles.pixKeyPill}>
                    <Ionicons name="key-outline" size={18} color={QuixaColors.primary} />
                    <Text style={styles.pixKeyText} numberOfLines={1}>
                      pix.reserva.quixtour@ce.gov.br
                    </Text>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={styles.copyBtn}
                      onPress={handleCopyPix}
                    >
                      <Ionicons name="copy-outline" size={14} color="#ffffff" />
                      <Text style={styles.copyBtnText}>Copiar</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.pixTimerRow}>
                    <Ionicons name="timer-outline" size={16} color={QuixaColors.tertiary} />
                    <Text style={styles.pixTimerText}>
                      Chave válida por 30 minutos após confirmação.
                    </Text>
                  </View>
                </View>
              )}
            </TouchableOpacity>

            {/* Opção 2: Cartão de Crédito */}
            <TouchableOpacity
              activeOpacity={0.92}
              style={[
                styles.paymentCard,
                !isPix && styles.paymentCardSelected,
              ]}
              onPress={() => setPaymentMethod('credit')}
            >
              <View style={styles.paymentCardHeader}>
                <View style={styles.paymentCardLeft}>
                  <View
                    style={[
                      styles.radioCircle,
                      !isPix && styles.radioCircleActive,
                    ]}
                  >
                    {!isPix && (
                      <Ionicons name="checkmark" size={16} color="#ffffff" />
                    )}
                  </View>

                  <View style={styles.paymentTitleCol}>
                    <Text style={styles.paymentTitle}>Cartão de Crédito</Text>
                    <Text style={styles.creditSubtext}>
                      Até 3x sem juros de R$ {(subtotal / 3).toFixed(2).replace('.', ',')}
                    </Text>
                  </View>
                </View>

                <Ionicons name="card-outline" size={24} color={QuixaColors.onSurfaceVariant} />
              </View>

              {/* Formulário do Cartão quando selecionado */}
              {!isPix && (
                <View style={styles.creditFormContainer}>
                  <View style={styles.formFieldGroup}>
                    <Text style={styles.fieldLabel}>Número do Cartão</Text>
                    <View style={styles.inputBox}>
                      <Ionicons name="card-outline" size={18} color={QuixaColors.outline} />
                      <TextInput
                        style={styles.fieldInput}
                        placeholder="0000 0000 0000 0000"
                        placeholderTextColor={QuixaColors.outline}
                        keyboardType="numeric"
                        maxLength={19}
                        value={cardNumber}
                        onChangeText={setCardNumber}
                      />
                    </View>
                  </View>

                  <View style={styles.formRowTwoCols}>
                    <View style={[styles.formFieldGroup, { flex: 1 }]}>
                      <Text style={styles.fieldLabel}>Validade</Text>
                      <TextInput
                        style={styles.fieldInputSolo}
                        placeholder="MM/AA"
                        placeholderTextColor={QuixaColors.outline}
                        maxLength={5}
                        value={cardExpiry}
                        onChangeText={setCardExpiry}
                      />
                    </View>

                    <View style={[styles.formFieldGroup, { flex: 1 }]}>
                      <Text style={styles.fieldLabel}>CVV</Text>
                      <TextInput
                        style={styles.fieldInputSolo}
                        placeholder="123"
                        placeholderTextColor={QuixaColors.outline}
                        keyboardType="numeric"
                        secureTextEntry
                        maxLength={4}
                        value={cardCvv}
                        onChangeText={setCardCvv}
                      />
                    </View>
                  </View>

                  <View style={styles.formFieldGroup}>
                    <Text style={styles.fieldLabel}>Parcelas</Text>
                    <View style={styles.installmentOptionsRow}>
                      {['1', '2', '3'].map((num) => {
                        const active = installments === num;
                        const installVal = (total / parseInt(num)).toFixed(2).replace('.', ',');
                        return (
                          <TouchableOpacity
                            key={num}
                            activeOpacity={0.8}
                            style={[
                              styles.installmentChip,
                              active && styles.installmentChipActive,
                            ]}
                            onPress={() => setInstallments(num)}
                          >
                            <Text
                              style={[
                                styles.installmentChipText,
                                active && styles.installmentChipTextActive,
                              ]}
                            >
                              {num}x R$ {installVal}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* 3. Sticky Bottom Checkout Bar */}
      <View style={styles.bottomStickyBar}>
        <View style={styles.totalCol}>
          <Text style={styles.totalLabel}>TOTAL A PAGAR</Text>
          <View style={styles.priceRow}>
            <Text style={styles.totalPriceText}>
              R$ {total.toFixed(2).replace('.', ',')}
            </Text>
            <Text style={styles.totalBadgeText}>
              {isPix ? 'com Pix (-5%)' : 'no Cartão'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.submitBtn}
          onPress={handleSubmitPayment}
        >
          <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
          <Text style={styles.submitBtnText}>
            {isPix ? 'Pagar via Pix' : 'Confirmar Cartão'}
          </Text>
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
    backgroundColor: 'rgba(255, 248, 246, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: '#fde0d4',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: QuixaColors.onSurface,
  },
  profileBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#fed0bc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toast: {
    position: 'absolute',
    top: 64,
    alignSelf: 'center',
    backgroundColor: '#392e2b',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 100,
  },
  toastText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffede8',
  },
  scrollContent: {
    paddingBottom: 110,
    paddingTop: 16,
  },
  mainContainer: {
    maxWidth: 390,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 16,
    gap: 20,
  },
  summaryCard: {
    backgroundColor: QuixaColors.surfaceContainerLow,
    borderRadius: 24,
    padding: 16,
    shadowColor: '#dc6e3d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  summaryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  summaryImgWrapper: {
    width: 80,
    height: 80,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: QuixaColors.secondaryContainer,
  },
  summaryImg: {
    width: '100%',
    height: '100%',
  },
  summaryTextCol: {
    flex: 1,
    gap: 2,
  },
  expLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: QuixaColors.primary,
    letterSpacing: 0.5,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: QuixaColors.onSurface,
    lineHeight: 20,
  },
  guideBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: QuixaColors.surfaceContainer,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 14,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  guideAvatarMini: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  guideNameText: {
    fontSize: 11,
    fontWeight: '600',
    color: QuixaColors.onSurface,
  },
  subDetailsContainer: {
    marginTop: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 12,
    gap: 10,
  },
  subDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subDetailRowBorder: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#fdeae5',
  },
  subDetailLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  subDetailLabel: {
    fontSize: 12,
    color: QuixaColors.onSurfaceVariant,
  },
  subDetailValue: {
    fontSize: 12,
    fontWeight: '600',
    color: QuixaColors.onSurface,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: QuixaColors.surfaceContainer,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 16,
    gap: 8,
  },
  counterBtnMinus: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterBtnPlus: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: QuixaColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterText: {
    fontSize: 12,
    fontWeight: '700',
    color: QuixaColors.onSurface,
    minWidth: 50,
    textAlign: 'center',
  },
  paymentSection: {
    gap: 12,
  },
  paymentSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paymentSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: QuixaColors.onSurface,
  },
  paymentSectionSub: {
    fontSize: 11,
    fontWeight: '600',
    color: QuixaColors.primary,
  },
  paymentCard: {
    backgroundColor: QuixaColors.surfaceContainerLow,
    borderRadius: 20,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: 10,
  },
  paymentCardSelected: {
    backgroundColor: '#ffffff',
    borderColor: QuixaColors.primaryContainer,
    shadowColor: '#dc6e3d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  paymentCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paymentCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f1dfd9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleActive: {
    backgroundColor: QuixaColors.primary,
  },
  paymentTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  paymentTitleCol: {
    flexDirection: 'column',
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: QuixaColors.onSurface,
  },
  recommendBadge: {
    backgroundColor: '#fed0bc',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  recommendText: {
    fontSize: 10,
    fontWeight: '700',
    color: QuixaColors.onSecondaryContainer,
  },
  paymentDesc: {
    fontSize: 12,
    color: QuixaColors.onSurfaceVariant,
    paddingLeft: 34,
  },
  pixContentBox: {
    marginTop: 8,
    paddingLeft: 34,
    gap: 10,
  },
  pixKeyPill: {
    backgroundColor: QuixaColors.surfaceContainer,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pixKeyText: {
    fontSize: 11,
    fontWeight: '600',
    color: QuixaColors.onSurface,
    flex: 1,
  },
  copyBtn: {
    backgroundColor: QuixaColors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  copyBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
  pixTimerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pixTimerText: {
    fontSize: 11,
    color: QuixaColors.tertiary,
  },
  creditSubtext: {
    fontSize: 12,
    color: QuixaColors.onSurfaceVariant,
  },
  creditFormContainer: {
    marginTop: 12,
    gap: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#fdeae5',
  },
  formFieldGroup: {
    gap: 4,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: QuixaColors.onSurfaceVariant,
  },
  inputBox: {
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(254, 208, 188, 0.4)',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fieldInput: {
    flex: 1,
    fontSize: 14,
    color: QuixaColors.onSurface,
  },
  formRowTwoCols: {
    flexDirection: 'row',
    gap: 12,
  },
  fieldInputSolo: {
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(254, 208, 188, 0.4)',
    paddingHorizontal: 16,
    fontSize: 14,
    color: QuixaColors.onSurface,
  },
  installmentOptionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  installmentChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: 'rgba(254, 208, 188, 0.4)',
    alignItems: 'center',
  },
  installmentChipActive: {
    backgroundColor: QuixaColors.primary,
  },
  installmentChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: QuixaColors.onSurface,
  },
  installmentChipTextActive: {
    color: '#ffffff',
  },
  bottomStickyBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#fde0d4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 20,
    zIndex: 999,
  },
  totalCol: {
    flexDirection: 'column',
  },
  totalLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: QuixaColors.onSurfaceVariant,
    letterSpacing: 0.5,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  totalPriceText: {
    fontSize: 22,
    fontWeight: '800',
    color: QuixaColors.primary,
  },
  totalBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: QuixaColors.tertiary,
  },
  submitBtn: {
    height: 52,
    paddingHorizontal: 20,
    borderRadius: 26,
    backgroundColor: QuixaColors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: QuixaColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.32,
    shadowRadius: 10,
    elevation: 4,
    flex: 1,
    maxWidth: 200,
    justifyContent: 'center',
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
});
