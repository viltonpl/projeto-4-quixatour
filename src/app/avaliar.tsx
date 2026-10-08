import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { QuixaColors } from '@/constants/theme';

const RATINGS_MAP: { [key: number]: string } = {
  1: 'Poderia ter sido melhor 🌧️',
  2: 'Razoável, mas com ressalvas 🍃',
  3: 'Bom passeio no sertão ☀️',
  4: 'Muito bom! Recomendo bastante 🧗',
  5: 'Excelente! Experiência inesquecível ✨',
};

export default function AvaliarScreen() {
  const router = useRouter();
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');

  const handleSendReview = () => {
    Alert.alert(
      'Avaliação Enviada!',
      'Muito obrigado pelo seu feedback. Ele ajuda o Guia Zé e outros exploradores da comunidade!',
      [
        {
          text: 'Concluir',
          onPress: () => router.back(),
        },
      ]
    );
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

        <Text style={styles.headerTitle}>Avaliar Passeio</Text>

        <View style={styles.profileBadge}>
          <Ionicons name="person" size={18} color={QuixaColors.secondary} />
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.mainContainer}>
            {/* Guide Info Card */}
            <View style={styles.guideCard}>
              <View style={styles.avatarWrap}>
                <View style={styles.avatarCircle}>
                  <Ionicons name="person" size={44} color={QuixaColors.secondary} />
                </View>
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={20} color={QuixaColors.primary} />
                </View>
              </View>

              <Text style={styles.guideName}>Guia Zé</Text>
              <Text style={styles.experienceSubtitle}>Trilha da Galinha Choca</Text>
            </View>

            {/* Rating Stars Card */}
            <View style={styles.ratingCard}>
              <Text style={styles.ratingSectionTitle}>COMO FOI SUA EXPERIÊNCIA?</Text>

              {/* Star buttons */}
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((starVal) => {
                  const isFilled = starVal <= rating;
                  return (
                    <TouchableOpacity
                      key={starVal}
                      activeOpacity={0.7}
                      style={styles.starBtn}
                      onPress={() => setRating(starVal)}
                      accessibilityLabel={`${starVal} estrelas`}
                    >
                      <Ionicons
                        name={isFilled ? 'star' : 'star-outline'}
                        size={36}
                        color={isFilled ? QuixaColors.primary : '#ddc0b6'}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.ratingFeedbackText}>
                {RATINGS_MAP[rating] || 'Selecione uma nota'}
              </Text>

              <Text style={styles.ratingDescription}>
                Sua nota ajuda a valorizar o trabalho dos condutores locais e fortalece o turismo ecológico em Quixadá.
              </Text>
            </View>

            {/* Review Testimonial Input */}
            <View style={styles.reviewInputSection}>
              <Text style={styles.inputLabel}>
                Seu depoimento <Text style={styles.optionalText}>(opcional)</Text>
              </Text>

              <View style={styles.textAreaContainer}>
                <TextInput
                  style={styles.textArea}
                  placeholder="Conte como foi sua experiência..."
                  placeholderTextColor={QuixaColors.secondary}
                  multiline
                  numberOfLines={4}
                  value={comment}
                  onChangeText={setComment}
                  textAlignVertical="top"
                />
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Floating Submit Action */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            activeOpacity={0.88}
            style={styles.submitBtn}
            onPress={handleSendReview}
          >
            <Text style={styles.submitBtnText}>Enviar Avaliação</Text>
            <Ionicons name="send" size={18} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fed0bc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 100,
    paddingTop: 16,
  },
  mainContainer: {
    maxWidth: 390,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 16,
    gap: 16,
  },
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
  avatarWrap: {
    position: 'relative',
    marginBottom: 10,
  },
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
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderRadius: 12,
  },
  guideName: {
    fontSize: 22,
    fontWeight: '800',
    color: QuixaColors.onSurface,
  },
  experienceSubtitle: {
    fontSize: 13,
    color: QuixaColors.onSurfaceVariant,
    marginTop: 2,
    fontWeight: '500',
  },
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
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 12,
  },
  starBtn: {
    padding: 4,
  },
  ratingFeedbackText: {
    fontSize: 16,
    fontWeight: '700',
    color: QuixaColors.primary,
    textAlign: 'center',
    marginBottom: 6,
  },
  ratingDescription: {
    fontSize: 12,
    color: QuixaColors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 8,
  },
  reviewInputSection: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: QuixaColors.onSurface,
    marginLeft: 4,
  },
  optionalText: {
    fontSize: 12,
    fontWeight: '400',
    color: QuixaColors.onSurfaceVariant,
  },
  textAreaContainer: {
    backgroundColor: QuixaColors.surfaceContainer,
    borderRadius: 24,
    padding: 14,
    minHeight: 110,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  textArea: {
    fontSize: 14,
    color: QuixaColors.onSurface,
    minHeight: 80,
  },
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
  submitBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
});
