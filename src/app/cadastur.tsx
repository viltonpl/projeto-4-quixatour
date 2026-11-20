import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { QuixaColors } from '@/constants/theme';
import { resolveImage } from '@/constants/images';
import { ProviderTabBar } from '@/components/provider-tab-bar';
import { confirmAction, notify } from '@/components/ui/notify';
import { SessionStore } from '@/services/session';
import { CadasturData, PrestadorService, UploadedFile } from '@/services/prestadorService';

type FileField = 'doc_front' | 'doc_back' | 'credential_file' | 'selfie';

export default function CadasturScreen() {
  const router = useRouter();
  const [data, setData] = useState<CadasturData | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingField, setUploadingField] = useState<FileField | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [cadasturNumber, setCadasturNumber] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await PrestadorService.getCadastur();
      setData(res);
      setCadasturNumber(res.cadastur_number || '');
    } catch (err: any) {
      notify('Erro', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!SessionStore.guideId()) {
      router.replace('/');
      return;
    }
    load();
  }, [load, router]);

  const locked = data?.status === 'em_analise' || data?.status === 'aprovado';

  const save = async (patch: Partial<CadasturData>) => {
    const res = await PrestadorService.saveCadastur(patch);
    setData(res);
  };

  const handleUpload = async (field: FileField) => {
    if (locked) return;
    try {
      setUploadingField(field);
      const file = await PrestadorService.pickAndUpload(field === 'selfie' ? 'camera' : 'library');
      if (file) await save({ [field]: file });
    } catch (err: any) {
      notify('Erro ao enviar arquivo', err.message);
    } finally {
      setUploadingField(null);
    }
  };

  const handleCadasturBlur = () => {
    if (!locked && data && cadasturNumber !== data.cadastur_number) {
      save({ cadastur_number: cadasturNumber }).catch((err) => notify('Erro', err.message));
    }
  };

  const toggleEthics = () => {
    if (locked || !data) return;
    save({ ethics_accepted: !data.ethics_accepted }).catch((err) => notify('Erro', err.message));
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const res = await PrestadorService.submitCadastur({ cadastur_number: cadasturNumber });
      setData(res);
      notify('Enviado para verificação!', 'A equipe local de Quixadá vai analisar seus documentos em até 24 horas.');
    } catch (err: any) {
      notify('Faltam informações', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSimulateApproval = () => {
    confirmAction(
      'Simular aprovação',
      'Isto simula a equipe técnica aprovando seu cadastro (apenas para testes).',
      'Aprovar',
      async () => {
        try {
          setData(await PrestadorService.approveCadastur());
        } catch (err: any) {
          notify('Erro', err.message);
        }
      }
    );
  };

  if (loading || !data) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.center]}>
        <ActivityIndicator color={QuixaColors.primary} />
      </SafeAreaView>
    );
  }

  const step = Math.min(3, data.steps_done + (data.steps_done < 3 ? 1 : 0));
  const nextStep =
    data.status === 'aprovado'
      ? 'Cadastro verificado. Selo "Guia Credenciado" ativo no seu perfil.'
      : data.status === 'em_analise'
        ? 'Validação da equipe técnica (24h)'
        : !data.doc_front || !data.doc_back
          ? 'Enviar frente e verso do documento'
          : !data.selfie
            ? 'Tirar a selfie de segurança'
            : 'Enviar para verificação oficial';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => router.replace('/prestador')}
          accessibilityLabel="Voltar ao painel"
        >
          <Ionicons name="arrow-back" size={24} color={QuixaColors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verificação Cadastur</Text>
        <View style={styles.avatar}>
          <Ionicons name="person" size={18} color={QuixaColors.primary} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={styles.shield}>
              <Ionicons name="shield-checkmark" size={26} color="#fff" />
            </View>
            <View style={styles.officialPill}>
              <Ionicons name="ribbon-outline" size={14} color={QuixaColors.primary} />
              <Text style={styles.officialText}>OFICIAL CADASTUR</Text>
            </View>
          </View>
          <Text style={styles.heroTitle}>Verificação de Guia & Morador</Text>
          <Text style={styles.heroText}>
            Guias certificados recebem até <Text style={styles.heroStrong}>4x mais reservas</Text> e asseguram total
            confiança nas trilhas e passeios de Quixadá.
          </Text>
          <View style={styles.hostsRow}>
            <View style={styles.hostsAvatars}>
              {['#bc5627', '#8c4a28', '#795747'].map((c, i) => (
                <View key={c} style={[styles.hostAvatar, { backgroundColor: c, marginLeft: i === 0 ? 0 : -10 }]}>
                  <Ionicons name="person" size={14} color="#fff" />
                </View>
              ))}
            </View>
            <Text style={styles.hostsText}>Mais de 140 anfitriões certificados</Text>
          </View>
        </View>

        {/* Status */}
        {data.status === 'aprovado' && (
          <View style={[styles.statusBox, styles.statusApproved]}>
            <Ionicons name="checkmark-circle" size={22} color="#2e7d32" />
            <Text style={styles.statusText}>
              Verificado! {data.guide_cadastur ? `(${data.guide_cadastur}) ` : ''}O selo &quot;Guia Credenciado&quot; já aparece
              no seu painel.
            </Text>
          </View>
        )}
        {data.status === 'em_analise' && (
          <View style={styles.statusBox}>
            <Ionicons name="hourglass-outline" size={22} color={QuixaColors.primary} />
            <View style={{ flex: 1, gap: 8 }}>
              <Text style={styles.statusText}>Documentos enviados! Em análise pela equipe local de Quixadá.</Text>
              <TouchableOpacity onPress={handleSimulateApproval}>
                <Text style={styles.simulateLink}>Simular aprovação (teste)</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Progresso */}
        <View style={styles.progressCard}>
          <View style={styles.progressRow}>
            <Text style={styles.progressStep}>Etapa {step} de 3</Text>
            <Text style={styles.progressPct}>{data.status === 'aprovado' ? 100 : data.progress}% concluído</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${data.status === 'aprovado' ? 100 : Math.max(data.progress, 4)}%` }]} />
          </View>
          <View style={styles.nextRow}>
            <Ionicons name="clipboard-outline" size={14} color={QuixaColors.onSurfaceVariant} />
            <Text style={styles.nextText}>Próximo passo: {nextStep}</Text>
          </View>
        </View>

        {/* Etapa 1 */}
        <SectionTitle n={1} title="Documento Oficial de Identidade" tag="Obrigatório" />
        <Text style={styles.sectionDesc}>Envie foto nítida e legível do RG ou CNH aberta sem reflexos da luz solar.</Text>
        <UploadRow
          title="Frente do Documento"
          file={data.doc_front}
          loading={uploadingField === 'doc_front'}
          locked={locked}
          onPress={() => handleUpload('doc_front')}
        />
        <UploadRow
          title="Verso do Documento"
          file={data.doc_back}
          loading={uploadingField === 'doc_back'}
          locked={locked}
          onPress={() => handleUpload('doc_back')}
        />

        {/* Etapa 2 */}
        <SectionTitle n={2} title="Credenciamento & Território" tag="Recomendado" />
        <Text style={styles.sectionDesc}>
          Adicione seu cadastro de condutor de turismo ou associação local dos monólitos.
        </Text>
        <Text style={styles.inputLabel}>Número da Carteira Cadastur</Text>
        <View style={styles.inputRow}>
          <Ionicons name="card-outline" size={20} color={QuixaColors.onSurfaceVariant} />
          <TextInput
            style={styles.input}
            value={cadasturNumber}
            onChangeText={setCadasturNumber}
            onBlur={handleCadasturBlur}
            editable={!locked}
            placeholder="06.049182.20-8"
            placeholderTextColor={`${QuixaColors.secondary}90`}
            keyboardType="numbers-and-punctuation"
          />
          {cadasturNumber.length >= 8 && <Ionicons name="checkmark" size={20} color={QuixaColors.primary} />}
        </View>
        <Text style={styles.helper}>Opcional para anfitriões de hospedagens rurais e experiências gastronômicas.</Text>

        <View style={styles.credentialCard}>
          <View style={styles.credentialHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.credentialTitle}>Carteira Profissional ou Comprovante</Text>
              <Text style={styles.credentialDesc}>Foto da credencial física ou atestado de condutor de Quixadá</Text>
            </View>
            <View style={styles.formatPill}>
              <Text style={styles.formatText}>PNG/JPG</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.credentialPreview}
            activeOpacity={0.85}
            onPress={() => handleUpload('credential_file')}
            disabled={locked}
          >
            {data.credential_file ? (
              <Image source={resolveImage(data.credential_file.uri)} style={styles.credentialImg} resizeMode="cover" />
            ) : (
              <View style={styles.credentialEmpty}>
                {uploadingField === 'credential_file' ? (
                  <ActivityIndicator color={QuixaColors.primary} />
                ) : (
                  <Ionicons name="cloud-upload-outline" size={30} color={QuixaColors.primary} />
                )}
                <Text style={styles.credentialEmptyText}>Toque para enviar a credencial</Text>
              </View>
            )}
            {data.credential_file && (
              <View style={styles.credentialFooter}>
                <Text style={styles.credentialFile} numberOfLines={1}>
                  {data.credential_file.name}
                </Text>
                {!locked && <Text style={styles.replaceText}>Substituir</Text>}
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Etapa 3 */}
        <SectionTitle n={3} title="Selfie de Segurança com Documento" tag="Obrigatório" />
        <View style={styles.selfieCard}>
          <View style={styles.selfieTop}>
            <View style={styles.selfieIcon}>
              {data.selfie ? (
                <Image source={resolveImage(data.selfie.uri)} style={styles.selfieImg} resizeMode="cover" />
              ) : (
                <Ionicons name="happy-outline" size={44} color={QuixaColors.primary} />
              )}
            </View>
            <View style={{ flex: 1, gap: 6 }}>
              <Text style={styles.tipsTitle}>Como fazer sua foto:</Text>
              <Tip icon="sunny-outline" text="Escolha local bem iluminado e sem boné" />
              <Tip icon="hand-left-outline" text="Segure o documento próximo ao seu queixo" />
              <Tip icon="eye-outline" text="Evite cobrir sua foto ou os números" />
            </View>
          </View>
          <TouchableOpacity
            style={[styles.selfieBtn, locked && { opacity: 0.6 }]}
            onPress={() => handleUpload('selfie')}
            disabled={locked || uploadingField === 'selfie'}
          >
            {uploadingField === 'selfie' ? (
              <ActivityIndicator color={QuixaColors.primary} />
            ) : (
              <Ionicons name={data.selfie ? 'checkmark-circle' : 'camera-outline'} size={20} color={QuixaColors.primary} />
            )}
            <Text style={styles.selfieBtnText}>{data.selfie ? 'Selfie enviada • Refazer' : 'Abrir Câmera para Selfie'}</Text>
          </TouchableOpacity>
        </View>

        {/* Compromisso */}
        <TouchableOpacity style={styles.ethicsCard} activeOpacity={0.85} onPress={toggleEthics} disabled={locked}>
          <View style={[styles.checkbox, data.ethics_accepted && styles.checkboxOn]}>
            {data.ethics_accepted && <Ionicons name="checkmark" size={16} color="#fff" />}
          </View>
          <View style={{ flex: 1, gap: 6 }}>
            <Text style={styles.ethicsTitle}>Compromisso Ambiental & Ética Sertaneja</Text>
            <Text style={styles.ethicsText}>
              Comprometo-me com a preservação integral do Parque Estadual dos Monólitos de Quixadá, respeito ao não
              descarte de lixo nas trilhas e conformidade com as normas locais de ecoturismo e escalada.
            </Text>
            <View style={styles.supportRow}>
              <Ionicons name="home-outline" size={14} color={QuixaColors.primary} />
              <Text style={styles.supportText}>
                Apoio: Associação de Guias e Condutores de Ecoturismo de Quixadá (AGCQ)
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {!locked && (
          <>
            <TouchableOpacity
              style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Ionicons name="checkmark-circle-outline" size={22} color="#fff" />
              )}
              <Text style={styles.submitText}>Enviar para Verificação Oficial</Text>
            </TouchableOpacity>
            <View style={styles.footNote}>
              <Ionicons name="time-outline" size={14} color={QuixaColors.onSurfaceVariant} />
              <Text style={styles.footNoteText}>Análise em até 24 horas pela equipe local de Quixadá</Text>
            </View>
          </>
        )}
      </ScrollView>

      <ProviderTabBar active="cadastur" />
    </SafeAreaView>
  );
}

function SectionTitle({ n, title, tag }: { n: number; title: string; tag: string }) {
  return (
    <View style={styles.sectionTitleRow}>
      <View style={styles.stepCircle}>
        <Text style={styles.stepNumber}>{n}</Text>
      </View>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionTag}>{tag}</Text>
    </View>
  );
}

function UploadRow({
  title,
  file,
  loading,
  locked,
  onPress,
}: {
  title: string;
  file: UploadedFile | null;
  loading: boolean;
  locked: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.uploadRow} activeOpacity={0.85} onPress={onPress} disabled={locked || loading}>
      <View style={styles.uploadIcon}>
        {file ? (
          <Image source={resolveImage(file.uri)} style={styles.uploadThumb} resizeMode="cover" />
        ) : (
          <Ionicons name="camera-outline" size={22} color={QuixaColors.primary} />
        )}
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={styles.uploadTitle}>{title}</Text>
          {file && <Ionicons name="checkmark-circle-outline" size={16} color={QuixaColors.primary} />}
        </View>
        <Text style={styles.uploadSub} numberOfLines={1}>
          {file ? `${file.name} (${file.size})` : 'Toque para fotografar ou carregar arquivo'}
        </Text>
      </View>
      {loading ? (
        <ActivityIndicator color={QuixaColors.primary} />
      ) : file ? (
        !locked && (
          <View style={styles.changePill}>
            <Ionicons name="refresh" size={14} color={QuixaColors.onSurfaceVariant} />
            <Text style={styles.changeText}>Alterar</Text>
          </View>
        )
      ) : (
        <View style={styles.arrowCircle}>
          <Ionicons name="arrow-forward" size={18} color={QuixaColors.primary} />
        </View>
      )}
    </TouchableOpacity>
  );
}

function Tip({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <Ionicons name={icon} size={14} color={QuixaColors.onSurfaceVariant} />
      <Text style={styles.tipText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: QuixaColors.background },
  center: { alignItems: 'center', justifyContent: 'center' },
  header: {
    height: 64,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: QuixaColors.background,
  },
  headerTitle: { fontSize: 18, fontWeight: '600', color: QuixaColors.onSurface },
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
    backgroundColor: QuixaColors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { padding: 16, paddingBottom: 32, gap: 12, width: '100%', maxWidth: 520, alignSelf: 'center' },

  hero: { backgroundColor: '#fde3d8', borderRadius: 28, padding: 20, gap: 10 },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  shield: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: QuixaColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  officialPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  officialText: { fontSize: 10, fontWeight: '800', color: QuixaColors.primary, letterSpacing: 0.6 },
  heroTitle: { fontSize: 24, fontWeight: '700', color: QuixaColors.onSurface, letterSpacing: -0.3 },
  heroText: { fontSize: 14, color: QuixaColors.onSurfaceVariant, lineHeight: 20 },
  heroStrong: { color: QuixaColors.primary, fontWeight: '700' },
  hostsRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6 },
  hostsAvatars: { flexDirection: 'row' },
  hostAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#fde3d8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hostsText: { fontSize: 12, color: QuixaColors.onSurfaceVariant },

  statusBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 14,
    borderRadius: 20,
    backgroundColor: QuixaColors.secondaryContainer,
  },
  statusApproved: { backgroundColor: '#dff3e0' },
  statusText: { flex: 1, fontSize: 13, fontWeight: '600', color: QuixaColors.onSurface, lineHeight: 18 },
  simulateLink: { fontSize: 12, fontWeight: '700', color: QuixaColors.primary, textDecorationLine: 'underline' },

  progressCard: { backgroundColor: QuixaColors.surfaceContainerLow, borderRadius: 20, padding: 14, gap: 8 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between' },
  progressStep: { fontSize: 13, fontWeight: '600', color: QuixaColors.onSurface },
  progressPct: { fontSize: 12, fontWeight: '600', color: QuixaColors.primary },
  progressTrack: { height: 8, borderRadius: 4, backgroundColor: QuixaColors.surfaceContainerHigh, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: QuixaColors.primary, borderRadius: 4 },
  nextRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  nextText: { fontSize: 12, color: QuixaColors.onSurfaceVariant, flex: 1 },

  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: QuixaColors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumber: { fontSize: 13, fontWeight: '700', color: QuixaColors.primary },
  sectionTitle: { flex: 1, fontSize: 19, fontWeight: '600', color: QuixaColors.onSurface },
  sectionTag: { fontSize: 11, fontWeight: '700', color: QuixaColors.primary },
  sectionDesc: { fontSize: 13, color: QuixaColors.onSurfaceVariant, lineHeight: 18, marginLeft: 40 },

  uploadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 24,
    backgroundColor: QuixaColors.surfaceContainerLow,
  },
  uploadIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: QuixaColors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadThumb: { width: '100%', height: '100%' },
  uploadTitle: { fontSize: 15, fontWeight: '600', color: QuixaColors.onSurface },
  uploadSub: { fontSize: 12, color: QuixaColors.onSurfaceVariant },
  changePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fff',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  changeText: { fontSize: 12, fontWeight: '600', color: QuixaColors.onSurfaceVariant },
  arrowCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: QuixaColors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },

  inputLabel: { fontSize: 13, fontWeight: '600', color: QuixaColors.onSurface, marginTop: 4 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 56,
    borderRadius: 28,
    paddingHorizontal: 18,
    backgroundColor: '#ffdbcc',
  },
  input: { flex: 1, fontSize: 16, color: QuixaColors.onSurface, height: 52 },
  helper: { fontSize: 12, color: QuixaColors.onSurfaceVariant },

  credentialCard: { backgroundColor: QuixaColors.surfaceContainerLow, borderRadius: 24, padding: 14, gap: 12 },
  credentialHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  credentialTitle: { fontSize: 15, fontWeight: '600', color: QuixaColors.onSurface },
  credentialDesc: { fontSize: 12, color: QuixaColors.onSurfaceVariant, marginTop: 2 },
  formatPill: { backgroundColor: '#fff', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  formatText: { fontSize: 10, fontWeight: '700', color: QuixaColors.onSurfaceVariant },
  credentialPreview: {
    height: 150,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: QuixaColors.surfaceContainerHigh,
  },
  credentialImg: { width: '100%', height: '100%' },
  credentialEmpty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  credentialEmptyText: { fontSize: 12, fontWeight: '600', color: QuixaColors.primary },
  credentialFooter: {
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  credentialFile: { flex: 1, color: '#fff', fontSize: 12, fontWeight: '700', textShadowColor: '#000', textShadowRadius: 4 },
  replaceText: {
    fontSize: 12,
    fontWeight: '600',
    color: QuixaColors.onSurface,
    backgroundColor: '#fff',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    overflow: 'hidden',
  },

  selfieCard: { backgroundColor: QuixaColors.surfaceContainerLow, borderRadius: 24, padding: 14, gap: 14 },
  selfieTop: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  selfieIcon: {
    width: 90,
    height: 90,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: QuixaColors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selfieImg: { width: '100%', height: '100%' },
  tipsTitle: { fontSize: 14, fontWeight: '600', color: QuixaColors.onSurface },
  tipText: { fontSize: 12, color: QuixaColors.onSurfaceVariant, flex: 1 },
  selfieBtn: {
    minHeight: 50,
    borderRadius: 999,
    backgroundColor: QuixaColors.secondaryContainer,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  selfieBtnText: { fontSize: 14, fontWeight: '600', color: QuixaColors.primary },

  ethicsCard: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderRadius: 24,
    backgroundColor: QuixaColors.surfaceContainerLow,
    marginTop: 8,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: QuixaColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: QuixaColors.primary },
  ethicsTitle: { fontSize: 14, fontWeight: '600', color: QuixaColors.onSurface },
  ethicsText: { fontSize: 12, color: QuixaColors.onSurfaceVariant, lineHeight: 17 },
  supportRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  supportText: { flex: 1, fontSize: 11, fontWeight: '600', color: QuixaColors.primary },

  submitBtn: {
    marginTop: 8,
    height: 56,
    borderRadius: 999,
    backgroundColor: QuixaColors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  footNote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  footNoteText: { fontSize: 12, color: QuixaColors.onSurfaceVariant },
});
