import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
  Alert,
  Platform,
  ActivityIndicator,
  Modal,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { QuixaColors } from '@/constants/theme';
import { ProfileService, UserProfile, SacInfo } from '@/services/profileService';

export default function ProfileScreen() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showSacModal, setShowSacModal] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [nationality, setNationality] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // SAC state
  const [sacInfo, setSacInfo] = useState<SacInfo | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        const [profile, sac] = await Promise.all([
          ProfileService.getProfile(),
          ProfileService.getSacInfo(),
        ]);

        if (isMounted) {
          if (profile) {
            setName(profile.name || 'Maria Silva');
            setCpf(profile.cpf || '123.456.789-00');
            setNationality(profile.nationality || 'Brasileira');
            setEmail(profile.email || 'seu@email.com');
            setPhone(profile.phone || '(88) 99876-5432');
          }
          if (sac) {
            setSacInfo(sac);
          }
        }
      } catch (err) {
        console.warn('Erro ao carregar dados do perfil:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSaveProfile = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert('Campos Obrigatórios', 'Por favor, preencha pelo menos Nome e E-mail.');
      return;
    }

    try {
      setSaving(true);
      const res = await ProfileService.updateProfile({
        name,
        cpf,
        nationality,
        email,
        phone,
      });

      if (res.success) {
        setIsEditing(false);
        if (Platform.OS === 'web') {
          window.alert('Perfil atualizado com sucesso!');
        } else {
          Alert.alert('Sucesso', 'Seus dados foram atualizados no banco de dados!');
        }
      } else {
        Alert.alert('Aviso', res.message || 'Erro ao salvar alterações.');
      }
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível salvar as alterações no momento.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sair da Conta',
      'Tem certeza que deseja encerrar sua sessão e voltar à tela inicial?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: () => router.replace('/'),
        },
      ]
    );
  };

  const handleOpenChannel = (channel: { link: string; value: string; type: string }) => {
    if (channel.type === 'whatsapp' || channel.type === 'phone' || channel.type === 'email') {
      Linking.openURL(channel.link).catch(() => {
        Alert.alert(channel.type.toUpperCase(), `Contato: ${channel.value}`);
      });
    }
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

        <Text style={styles.headerTitle}>Meu Perfil</Text>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.sacHeaderBtn}
          onPress={() => setShowSacModal(true)}
          accessibilityLabel="Ajuda / SAC"
        >
          <Ionicons name="help-buoy-outline" size={22} color={QuixaColors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.mainContainer}>
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrapper}>
              <View style={styles.avatarCircle}>
                <Ionicons name="person" size={50} color={QuixaColors.secondary} />
              </View>
              <View style={styles.verifiedDot}>
                <Ionicons name="checkmark" size={14} color="#ffffff" />
              </View>
            </View>

            <Text style={styles.userNameHeader}>{name || 'Maria Silva'}</Text>
            <Text style={styles.userRoleSubtitle}>Explorador QuixaTour • Cadastrado</Text>
          </View>

          {loading ? (
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <ActivityIndicator size="large" color={QuixaColors.primary} />
            </View>
          ) : (
            <>
              {/* Form Card: Dados Pessoais */}
              <View style={styles.card}>
                <View style={styles.cardHeaderRow}>
                  <View style={styles.cardHeaderTitleRow}>
                    <Ionicons name="person-circle-outline" size={20} color={QuixaColors.primary} />
                    <Text style={styles.cardTitle}>Dados Pessoais</Text>
                  </View>

                  {!isEditing ? (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={styles.editToggleBtn}
                      onPress={() => setIsEditing(true)}
                    >
                      <Ionicons name="create-outline" size={16} color={QuixaColors.primary} />
                      <Text style={styles.editToggleBtnText}>Editar Perfil</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={styles.cancelEditBtn}
                      onPress={() => setIsEditing(false)}
                    >
                      <Text style={styles.cancelEditBtnText}>Cancelar</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Field: Nome e Sobrenome */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Nome Sobrenome</Text>
                  <View style={[styles.inputBox, !isEditing && styles.inputBoxDisabled]}>
                    <Ionicons
                      name="person-outline"
                      size={18}
                      color={isEditing ? QuixaColors.primary : QuixaColors.outline}
                    />
                    <TextInput
                      style={[styles.input, !isEditing && styles.inputDisabled]}
                      value={name}
                      onChangeText={setName}
                      editable={isEditing}
                      placeholder="Seu nome completo"
                      placeholderTextColor={QuixaColors.outline}
                    />
                  </View>
                </View>

                {/* Field: CPF */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>CPF</Text>
                  <View style={[styles.inputBox, !isEditing && styles.inputBoxDisabled]}>
                    <Ionicons
                      name="card-outline"
                      size={18}
                      color={isEditing ? QuixaColors.primary : QuixaColors.outline}
                    />
                    <TextInput
                      style={[styles.input, !isEditing && styles.inputDisabled]}
                      value={cpf}
                      onChangeText={setCpf}
                      editable={isEditing}
                      placeholder="000.000.000-00"
                      placeholderTextColor={QuixaColors.outline}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                {/* Field: Nacionalidade */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Nacionalidade</Text>
                  <View style={[styles.inputBox, !isEditing && styles.inputBoxDisabled]}>
                    <Ionicons
                      name="flag-outline"
                      size={18}
                      color={isEditing ? QuixaColors.primary : QuixaColors.outline}
                    />
                    <TextInput
                      style={[styles.input, !isEditing && styles.inputDisabled]}
                      value={nationality}
                      onChangeText={setNationality}
                      editable={isEditing}
                      placeholder="Ex: Brasileira"
                      placeholderTextColor={QuixaColors.outline}
                    />
                  </View>
                </View>

                {/* Field: E-mail */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>E-mail</Text>
                  <View style={[styles.inputBox, !isEditing && styles.inputBoxDisabled]}>
                    <Ionicons
                      name="mail-outline"
                      size={18}
                      color={isEditing ? QuixaColors.primary : QuixaColors.outline}
                    />
                    <TextInput
                      style={[styles.input, !isEditing && styles.inputDisabled]}
                      value={email}
                      onChangeText={setEmail}
                      editable={isEditing}
                      placeholder="seu@email.com"
                      placeholderTextColor={QuixaColors.outline}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                {/* Field: Número (Telefone/WhatsApp) */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Número (Telefone / WhatsApp)</Text>
                  <View style={[styles.inputBox, !isEditing && styles.inputBoxDisabled]}>
                    <Ionicons
                      name="call-outline"
                      size={18}
                      color={isEditing ? QuixaColors.primary : QuixaColors.outline}
                    />
                    <TextInput
                      style={[styles.input, !isEditing && styles.inputDisabled]}
                      value={phone}
                      onChangeText={setPhone}
                      editable={isEditing}
                      placeholder="(88) 90000-0000"
                      placeholderTextColor={QuixaColors.outline}
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>

                {/* Botão de Salvar Alterações se estiver em modo de edição */}
                {isEditing && (
                  <TouchableOpacity
                    activeOpacity={0.88}
                    style={styles.saveBtn}
                    onPress={handleSaveProfile}
                    disabled={saving}
                  >
                    {saving ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <>
                        <Ionicons name="checkmark-circle-outline" size={20} color="#ffffff" />
                        <Text style={styles.saveBtnText}>Salvar Alterações</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>

              {/* Seção de Botões de Ação: SAC e Sair */}
              <View style={styles.actionsSection}>
                {/* Botão Ajuda / SAC */}
                <TouchableOpacity
                  activeOpacity={0.88}
                  style={styles.actionBtnSac}
                  onPress={() => setShowSacModal(true)}
                >
                  <View style={styles.actionBtnLeft}>
                    <View style={styles.actionIconCircleSac}>
                      <Ionicons name="headset-outline" size={20} color={QuixaColors.primary} />
                    </View>
                    <View>
                      <Text style={styles.actionBtnTitle}>Ajuda / SAC</Text>
                      <Text style={styles.actionBtnSub}>Canais oficiais de suporte e reembolso</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={QuixaColors.secondary} />
                </TouchableOpacity>

                {/* Botão Sair da Conta */}
                <TouchableOpacity
                  activeOpacity={0.88}
                  style={styles.actionBtnLogout}
                  onPress={handleLogout}
                >
                  <View style={styles.actionBtnLeft}>
                    <View style={styles.actionIconCircleLogout}>
                      <Ionicons name="log-out-outline" size={20} color="#ba1a1a" />
                    </View>
                    <View>
                      <Text style={styles.actionBtnTitleLogout}>Sair da Conta</Text>
                      <Text style={styles.actionBtnSub}>Desconectar deste dispositivo</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#ba1a1a" />
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* Modal de Ajuda / SAC */}
      <Modal
        visible={showSacModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSacModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.sacModalCard}>
            <View style={styles.sacModalHeader}>
              <View style={styles.sacHeaderIconRow}>
                <View style={styles.actionIconCircleSac}>
                  <Ionicons name="headset" size={22} color={QuixaColors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sacModalTitle}>Ajuda / SAC QuixaTour</Text>
                  <Text style={styles.sacModalSub}>Suporte ao turista e guias em Quixadá</Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => setShowSacModal(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={24} color={QuixaColors.onSurface} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 380 }}>
              <View style={styles.sacChannelsList}>
                {sacInfo?.channels.map((channel, idx) => (
                  <TouchableOpacity
                    key={idx}
                    activeOpacity={0.85}
                    style={styles.channelItem}
                    onPress={() => handleOpenChannel(channel)}
                  >
                    <View style={styles.channelItemLeft}>
                      <Ionicons
                        name={
                          channel.type === 'whatsapp'
                            ? 'logo-whatsapp'
                            : channel.type === 'phone'
                            ? 'call-outline'
                            : 'mail-outline'
                        }
                        size={22}
                        color={channel.type === 'whatsapp' ? '#25d366' : QuixaColors.primary}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.channelName}>{channel.name}</Text>
                        <Text style={styles.channelValue}>{channel.value}</Text>
                        <Text style={styles.channelDesc}>{channel.description}</Text>
                      </View>
                    </View>
                    <Ionicons name="open-outline" size={18} color={QuixaColors.outline} />
                  </TouchableOpacity>
                ))}

                {/* Políticas de Reembolso */}
                <View style={styles.policyBox}>
                  <View style={styles.policyTitleRow}>
                    <Ionicons name="shield-checkmark-outline" size={18} color={QuixaColors.primary} />
                    <Text style={styles.policyTitle}>Garantia de Reembolso QuixaTour</Text>
                  </View>
                  <Text style={styles.policyText}>
                    {sacInfo?.policies.reembolso ||
                      'Cancelamentos com mais de 24h de antecedência garantem reembolso integral em até 48h úteis via Pix ou na próxima fatura no Cartão.'}
                  </Text>
                  <Text style={styles.policyHorario}>
                    Horário: {sacInfo?.policies.horario || 'Plantão diário 06:00 às 22:00.'}
                  </Text>
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity
              activeOpacity={0.88}
              style={styles.modalCloseFullBtn}
              onPress={() => setShowSacModal(false)}
            >
              <Text style={styles.modalCloseFullBtnText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  sacHeaderBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fdeae5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 90,
    paddingTop: 16,
  },
  mainContainer: {
    maxWidth: 390,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 16,
    gap: 16,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 10,
  },
  avatarCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: QuixaColors.secondaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
    shadowColor: QuixaColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  verifiedDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: QuixaColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  userNameHeader: {
    fontSize: 22,
    fontWeight: '800',
    color: QuixaColors.onSurface,
    letterSpacing: -0.5,
  },
  userRoleSubtitle: {
    fontSize: 13,
    color: QuixaColors.onSurfaceVariant,
    marginTop: 2,
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f5ded5',
    gap: 12,
    shadowColor: QuixaColors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#fdeae5',
  },
  cardHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: QuixaColors.onSurface,
  },
  editToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#fdeae5',
    borderRadius: 14,
  },
  editToggleBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: QuixaColors.primary,
  },
  cancelEditBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#ece5e2',
  },
  cancelEditBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b5650',
  },
  fieldGroup: {
    gap: 4,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: QuixaColors.onSurfaceVariant,
    marginLeft: 4,
  },
  inputBox: {
    height: 48,
    borderRadius: 18,
    backgroundColor: '#fff8f6',
    borderWidth: 1,
    borderColor: QuixaColors.outlineVariant,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  inputBoxDisabled: {
    backgroundColor: '#faf2ef',
    borderColor: '#f2ded7',
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: QuixaColors.onSurface,
    fontWeight: '500',
  },
  inputDisabled: {
    color: '#5c4842',
  },
  saveBtn: {
    height: 48,
    borderRadius: 24,
    backgroundColor: QuixaColors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    shadowColor: QuixaColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  actionsSection: {
    gap: 12,
  },
  actionBtnSac: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#f5ded5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  actionBtnLogout: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ffdad6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#ba1a1a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  actionBtnLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  actionIconCircleSac: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fdeae5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIconCircleLogout: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffdad6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: QuixaColors.onSurface,
  },
  actionBtnTitleLogout: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ba1a1a',
  },
  actionBtnSub: {
    fontSize: 12,
    color: QuixaColors.onSurfaceVariant,
    marginTop: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  sacModalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#ffffff',
    borderRadius: 28,
    padding: 20,
    gap: 14,
  },
  sacModalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#fdeae5',
  },
  sacHeaderIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  sacModalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: QuixaColors.onSurface,
  },
  sacModalSub: {
    fontSize: 12,
    color: QuixaColors.onSurfaceVariant,
  },
  modalCloseBtn: {
    padding: 4,
  },
  sacChannelsList: {
    gap: 10,
    paddingVertical: 6,
  },
  channelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff8f6',
    borderWidth: 1,
    borderColor: '#f5ded5',
    borderRadius: 16,
    padding: 12,
  },
  channelItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  channelName: {
    fontSize: 13,
    fontWeight: '700',
    color: QuixaColors.onSurface,
  },
  channelValue: {
    fontSize: 13,
    fontWeight: '600',
    color: QuixaColors.primary,
    marginTop: 1,
  },
  channelDesc: {
    fontSize: 11,
    color: QuixaColors.onSurfaceVariant,
    marginTop: 2,
  },
  policyBox: {
    backgroundColor: '#fbf1ed',
    borderRadius: 16,
    padding: 12,
    gap: 6,
    marginTop: 4,
  },
  policyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  policyTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: QuixaColors.primary,
  },
  policyText: {
    fontSize: 11,
    color: QuixaColors.onSurface,
    lineHeight: 16,
  },
  policyHorario: {
    fontSize: 11,
    color: QuixaColors.tertiary,
    fontWeight: '600',
  },
  modalCloseFullBtn: {
    width: '100%',
    height: 46,
    borderRadius: 23,
    backgroundColor: QuixaColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  modalCloseFullBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
});
