import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { QuixaColors } from '@/constants/theme';
import { notify } from '@/components/ui/notify';
import { AvaliarService, ReviewContext } from '@/services/avaliarService';

const EXPERIENCE_LABELS: { [key: number]: string } = {
  1: 'Poderia ter sido melhor 🌧️',
  2: 'Razoável, mas com ressalvas 🍃',
  3: 'Bom passeio no sertão ☀️',
  4: 'Muito bom! Recomendo bastante 🧗',
  5: 'Excelente! Experiência inesquecível ✨',
};

const GUIDE_LABELS: { [key: number]: string } = {
  1: 'Atendimento abaixo do esperado',
  2: 'Atendimento razoável',
  3: 'Bom guia, cumpriu o combinado',
  4: 'Ótimo guia! Atencioso e seguro',
  5: 'Guia excepcional! Conhece tudo do sertão ✨',
};

/** Elogios rápidos ao guia (viram parte do comentário do guia). */
const GUIDE_COMPLIMENTS = ['Pontual', 'Atencioso', 'Passa segurança', 'Conhece a região', 'Simpático', 'Boas fotos'];

type Step = 'guia' | 'experiencia';

export default function AvaliarScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const reservationIdParam = params.reservationId ? Number(params.reservationId) : 3;
  const initialTitle = (params.title as string) || 'Trilha da Galinha Choca';
  const initialGuideName = (params.guideName as string) || 'Guia Zé';
  const initialRatingParam = params.initialRating ? Number(params.initialRating) : 5;

  // Fluxo em duas etapas: 1) avaliar o guia → 2) avaliar a experiência
  const [step, setStep] = useState<Step>('guia');
  const [guideRating, setGuideRating] = useState<number>(5);
  const [guideCompliments, setGuideCompliments] = useState<string[]>([]);
  const [guideComment, setGuideComment] = useState('');
  const [rating, setRating] = useState<number>(initialRatingParam);
  const [comment, setComment] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState<ReviewContext>({
    reservation_id: reservationIdParam,
    experience_id: params.experienceId ? Number(params.experienceId) : 1,
    guide_id: 1,
    experience_title: initialTitle,
    guide_name: initialGuideName,
    guide_role: 'Guia Local Credenciado',
  });

  useEffect(() => {
    let isMounted = true;
    AvaliarService.getContext(reservationIdParam)
      .then((data) => {
        if (isMounted && data) {
          setContext({
            ...data,
            experience_title: data.experience_title || initialTitle,
            guide_name: data.guide_name || initialGuideName,
          });
        }
      })
      .catch((err) => console.warn('Erro ao carregar contexto de avaliação:', err));
    return () => {
      isMounted = false;
    };
  }, [reservationIdParam, initialTitle, initialGuideName]);

  const toggleCompliment = (tag: string) =>
    setGuideCompliments((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));

  const handleBack = () => {
    if (step === 'experiencia') setStep('guia');
    else router.back();
  };

  const handleSendReview = async () => {
    try {
      setLoading(true);
      const fullGuideComment = [guideCompliments.join(', '), guideComment.trim()].filter(Boolean).join(' — ');
      const res = await AvaliarService.submitReview({
        reservationId: context.reservation_id,
        experienceId: context.experience_id,
        rating,
        ratingLabel: EXPERIENCE_LABELS[rating] || 'Excelente!',
        comment,
        guideRating,
        guideComment: fullGuideComment,
      });

      if (!res.success) {
        notify('Avaliação não enviada', res.message || 'Tente novamente.');
        return;
      }
      notify(
        'Avaliação enviada!',
        `Obrigado! Sua nota para ${context.guide_name} e para a experiência ajuda outros exploradores.`
      );
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const isGuideStep = step === 'guia';
  const currentRating = isGuideStep ? guideRating : rating;
  const setCurrentRating = isGuideStep ? setGuideRating : setRating;
  const labels = isGuideStep ? GUIDE_LABELS : EXPERIENCE_LABELS;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity activeOpacity={0.7} style={styles.backBtn} onPress={handleBack} accessibilityLabel="Voltar">
          <Ionicons name="arrow-back" size={24} color={QuixaColors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isGuideStep ? 'Avaliar Guia' : 'Avaliar Passeio'}</Text>
        <View style={styles.profileBadge}>
          <Ionicons name="person" size={18} color={QuixaColors.secondary} />
        </View>
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.mainContainer}>
            {/* Indicador de etapas */}
            <View style={styles.stepper}>
              <StepDot n={1} label="Guia" active={isGuideStep} done={!isGuideStep} />
              <View style={[styles.stepLine, !isGuideStep && styles.stepLineDone]} />
              <StepDot n={2} label="Experiência" active={!isGuideStep} done={false} />
            </View>

            {/* Card do avaliado */}
            <View style={styles.guideCard}>
              <View style={styles.avatarWrap}>
                <View style={styles.avatarCircle}>
                  <Ionicons
                    name={isGuideStep ? 'person' : 'image-outline'}
                    size={44}
                    color={QuixaColors.secondary}
                  />
                </View>
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={20} color={QuixaColors.primary} />
                </View>
              </View>
              <Text style={styles.guideName}>{isGuideStep ? context.guide_name : context.experience_title}</Text>
              <Text style={styles.experienceSubtitle}>
                {isGuideStep ? context.experience_title : `Com ${context.guide_name}`}
              </Text>
            </View>

            {/* Estrelas */}
            <View style={styles.ratingCard}>
              <Text style={styles.ratingSectionTitle}>
                {isGuideStep ? 'COMO FOI O SEU GUIA?' : 'COMO FOI SUA EXPERIÊNCIA?'}
              </Text>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((starVal) => {
                  const isFilled = starVal <= currentRating;
                  return (
                    <TouchableOpacity
                      key={starVal}
                      activeOpacity={0.6}
                      style={[styles.starBtn, starVal === currentRating && styles.starBtnSelected]}
                      onPress={() => setCurrentRating(starVal)}
                      accessibilityLabel={`${starVal} estrelas`}
                    >
                      <Ionicons
                        name={isFilled ? 'star' : 'star-outline'}
                        size={38}
                        color={isFilled ? QuixaColors.primary : '#ddc0b6'}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
              <View style={styles.ratingScorePill}>
                <Ionicons name="star" size={14} color="#ffffff" />
                <Text style={styles.ratingScorePillText}>{currentRating} de 5 estrelas</Text>
              </View>
              <Text style={styles.ratingFeedbackText}>{labels[currentRating]}</Text>
              <Text style={styles.ratingDescription}>
                {isGuideStep
                  ? 'Sua nota entra na média do guia e valoriza o trabalho dos condutores locais.'
                  : 'Sua nota ajuda outros exploradores a escolher passeios em Quixadá.'}
              </Text>
            </View>

            {/* Elogios rápidos (só na etapa do guia) */}
            {isGuideStep && (
              <View style={styles.reviewInputSection}>
                <Text style={styles.inputLabel}>
                  Destaques do guia <Text style={styles.optionalText}>(opcional)</Text>
                </Text>
                <View style={styles.tagsWrap}>
                  {GUIDE_COMPLIMENTS.map((tag) => {
                    const selected = guideCompliments.includes(tag);
                    return (
                      <TouchableOpacity
                        key={tag}
                        style={[styles.tag, selected && styles.tagSelected]}
                        onPress={() => toggleCompliment(tag)}
                      >
                        {selected && <Ionicons name="checkmark" size={14} color="#fff" />}
                        <Text style={[styles.tagText, selected && styles.tagTextSelected]}>{tag}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Comentário */}
            <View style={styles.reviewInputSection}>
              <Text style={styles.inputLabel}>
                {isGuideStep ? 'Comentário sobre o guia' : 'Seu depoimento'}{' '}
                <Text style={styles.optionalText}>(opcional)</Text>
              </Text>
              <View style={styles.textAreaContainer}>
                <TextInput
                  style={styles.textArea}
                  placeholder={isGuideStep ? `O que achou de ${context.guide_name}?` : 'Conte como foi sua experiência...'}
                  placeholderTextColor={QuixaColors.secondary}
                  multiline
                  numberOfLines={4}
                  value={isGuideStep ? guideComment : comment}
                  onChangeText={isGuideStep ? setGuideComment : setComment}
                  textAlignVertical="top"
                />
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Ação inferior */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            activeOpacity={0.88}
            style={[styles.submitBtn, loading && { opacity: 0.8 }]}
            onPress={isGuideStep ? () => setStep('experiencia') : handleSendReview}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <Text style={styles.submitBtnText}>{isGuideStep ? 'Próximo: avaliar experiência' : 'Enviar Avaliação'}</Text>
                <Ionicons name={isGuideStep ? 'arrow-forward' : 'send'} size={18} color="#ffffff" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function StepDot({ n, label, active, done }: { n: number; label: string; active: boolean; done: boolean }) {
  return (
    <View style={styles.stepItem}>
      <View style={[styles.stepCircle, (active || done) && styles.stepCircleActive]}>
        {done ? (
          <Ionicons name="checkmark" size={16} color="#fff" />
        ) : (
          <Text style={[styles.stepNumber, active && styles.stepNumberActive]}>{n}</Text>
        )}
      </View>
      <Text style={[styles.stepLabel, (active || done) && styles.stepLabelActive]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: QuixaColors.background },
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
  backBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: QuixaColors.onSurface },
  profileBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fed0bc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: { paddingBottom: 110, paddingTop: 16 },
  mainContainer: { maxWidth: 390, width: '100%', alignSelf: 'center', paddingHorizontal: 16, gap: 16 },

  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  stepItem: { alignItems: 'center', gap: 4 },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: QuixaColors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: { backgroundColor: QuixaColors.primary },
  stepNumber: { fontSize: 13, fontWeight: '700', color: QuixaColors.onSurfaceVariant },
  stepNumberActive: { color: '#fff' },
  stepLabel: { fontSize: 11, fontWeight: '600', color: QuixaColors.onSurfaceVariant },
  stepLabelActive: { color: QuixaColors.primary },
  stepLine: { width: 60, height: 3, borderRadius: 2, backgroundColor: QuixaColors.surfaceContainerHigh, marginBottom: 16 },
  stepLineDone: { backgroundColor: QuixaColors.primary },

  guideCard: {
    backgroundColor: QuixaColors.surfaceContainer,
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  avatarWrap: { position: 'relative', marginBottom: 10 },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: QuixaColors.secondaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(156, 63, 16, 0.2)',
  },
  verifiedBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#ffffff', borderRadius: 12 },
  guideName: { fontSize: 22, fontWeight: '800', color: QuixaColors.onSurface, textAlign: 'center' },
  experienceSubtitle: { fontSize: 13, color: QuixaColors.onSurfaceVariant, marginTop: 2, fontWeight: '500' },

  ratingCard: {
    backgroundColor: QuixaColors.surfaceContainer,
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  ratingSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: QuixaColors.onSurfaceVariant,
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  starsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 12 },
  starBtn: { padding: 4 },
  starBtnSelected: { transform: [{ scale: 1.15 }] },
  ratingScorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: QuixaColors.primary,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 16,
    marginBottom: 8,
  },
  ratingScorePillText: { fontSize: 13, fontWeight: '700', color: '#ffffff' },
  ratingFeedbackText: { fontSize: 16, fontWeight: '700', color: QuixaColors.primary, textAlign: 'center', marginBottom: 6 },
  ratingDescription: {
    fontSize: 12,
    color: QuixaColors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 8,
  },

  reviewInputSection: { gap: 8 },
  inputLabel: { fontSize: 16, fontWeight: '700', color: QuixaColors.onSurface, marginLeft: 4 },
  optionalText: { fontSize: 12, fontWeight: '400', color: QuixaColors.onSurfaceVariant },
  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: QuixaColors.surfaceContainer,
  },
  tagSelected: { backgroundColor: QuixaColors.primary },
  tagText: { fontSize: 13, fontWeight: '600', color: QuixaColors.onSurfaceVariant },
  tagTextSelected: { color: '#fff' },
  textAreaContainer: {
    backgroundColor: QuixaColors.surfaceContainer,
    borderRadius: 24,
    padding: 14,
    minHeight: 110,
  },
  textArea: { fontSize: 14, color: QuixaColors.onSurface, minHeight: 80 },

  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 248, 246, 0.95)',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    borderTopWidth: 1,
    borderTopColor: '#fde0d4',
    alignItems: 'center',
  },
  submitBtn: {
    width: '100%',
    maxWidth: 390,
    height: 52,
    borderRadius: 26,
    backgroundColor: QuixaColors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: QuixaColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  submitBtnText: { fontSize: 15, fontWeight: '700', color: '#ffffff' },
});
