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
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { QuixaColors } from '@/constants/theme';
import { AppImages } from '@/constants/images';

export default function DetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const title = (params.title as string) || 'Trilha da Galinha Choca & Açude do Cedro';
  const rawImage = (params.image as string) || 'trilha';
  const price = (params.price as string) || 'R$ 85';

  const [isFavorite, setIsFavorite] = useState(false);

  const getImageSource = () => {
    if (rawImage === 'trilha') return AppImages.trilha;
    if (rawImage === 'voo') return AppImages.voo;
    if (rawImage === 'chale') return AppImages.chale;
    if (rawImage && rawImage.startsWith('http')) return { uri: rawImage };
    return AppImages.trilha;
  };

  const handleBooking = () => {
    router.push({
      pathname: '/checkout',
      params: { title, price, image: rawImage },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* Main Scroll Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 1. Immersive Top Image & Actions Overlay */}
        <View style={styles.imageContainer}>
          <Image
            source={getImageSource()}
            style={styles.topImage}
            resizeMode="cover"
          />
          {/* Dark Overlay Gradient */}
          <View style={styles.darkGradientTop} />
          <View style={styles.darkGradientBottom} />

          {/* Navigation Action Buttons */}
          <View style={styles.topNavActions}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.actionCircleBtn}
              onPress={() => router.back()}
              accessibilityLabel="Voltar"
            >
              <Ionicons
                name="arrow-back"
                size={22}
                color={QuixaColors.onSurface}
              />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.actionCircleBtn}
              onPress={() => setIsFavorite(!isFavorite)}
              accessibilityLabel="Adicionar aos favoritos"
            >
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={22}
                color={isFavorite ? '#ba1a1a' : QuixaColors.onSurface}
              />
            </TouchableOpacity>
          </View>

          {/* Badges Over Image Bottom */}
          <View style={styles.imageBadgesRow}>
            <View style={styles.imageBadge}>
              <Ionicons name="leaf-outline" size={16} color={QuixaColors.tertiary} />
              <Text style={styles.imageBadgeTextTertiary}>Ecoturismo</Text>
            </View>

            <View style={styles.imageBadge}>
              <Ionicons name="calendar-outline" size={15} color={QuixaColors.primary} />
              <Text style={styles.imageBadgeTextPrimary}>Disponível hoje</Text>
            </View>
          </View>
        </View>

        {/* 2. Content Details Section */}
        <View style={styles.detailsContent}>
          {/* Location & Title Header */}
          <View style={styles.headerGroup}>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={18} color={QuixaColors.primary} />
              <Text style={styles.locationText}>
                Sertão dos Monólitos, Quixadá - CE
              </Text>
            </View>

            <Text style={styles.mainTitle}>{title}</Text>

            {/* Experience Tags / Chips */}
            <View style={styles.chipsWrap}>
              <View style={styles.infoChip}>
                <Ionicons name="time-outline" size={16} color={QuixaColors.primary} />
                <Text style={styles.infoChipText}>3h30</Text>
              </View>

              <View style={styles.infoChip}>
                <Ionicons name="walk-outline" size={16} color={QuixaColors.primary} />
                <Text style={styles.infoChipText}>Nível Moderado</Text>
              </View>

              <View style={styles.infoChip}>
                <Ionicons name="navigate-outline" size={16} color={QuixaColors.primary} />
                <Text style={styles.infoChipText}>Açude do Cedro</Text>
              </View>

              <View style={styles.infoChip}>
                <Ionicons name="star" size={16} color={QuixaColors.primaryContainer} />
                <Text style={styles.infoChipText}>4.9 (128)</Text>
              </View>
            </View>
          </View>

          {/* Guide Profile Card */}
          <View style={styles.guideCard}>
            <View style={styles.guideLeftCol}>
              <View style={styles.guideAvatarWrapper}>
                <View style={styles.guideAvatar}>
                  <Ionicons name="person" size={28} color={QuixaColors.secondary} />
                </View>
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark" size={11} color="#ffffff" />
                </View>
              </View>

              <View style={styles.guideInfoCol}>
                <Text style={styles.guideName}>Guia Zé</Text>
                <View style={styles.guideMetaRow}>
                  <View style={styles.cadasturBadge}>
                    <Text style={styles.cadasturText}>Cadastur</Text>
                  </View>
                  <Text style={styles.guideSubtext}>Guia Local Credenciado</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.chatBtn}
              onPress={() => router.push('/chat' as any)}
              accessibilityLabel="Conversar com o guia"
            >
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={20}
                color={QuixaColors.onSecondaryContainer}
              />
            </TouchableOpacity>
          </View>

          {/* About Experience Section */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionHeading}>Sobre a Experiência</Text>
            <Text style={styles.descriptionText}>
              A Trilha da Galinha Choca oferece uma imersão única no coração do Sertão dos Monólitos. Caminhe em meio à caatinga preservada, aprecie a fascinante formação rochosa da Galinha Choca e conclua a jornada contemplando o histórico Açude do Cedro.
            </Text>
          </View>

          {/* Inclusions Section */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionHeading}>O que está incluído</Text>
            <View style={styles.inclusionsWrap}>
              <View style={styles.inclusionBadge}>
                <Ionicons name="water-outline" size={18} color={QuixaColors.primary} />
                <Text style={styles.inclusionText}>Água mineral</Text>
              </View>

              <View style={styles.inclusionBadge}>
                <Ionicons name="shield-checkmark-outline" size={18} color={QuixaColors.primary} />
                <Text style={styles.inclusionText}>Seguro aventura</Text>
              </View>

              <View style={styles.inclusionBadge}>
                <Ionicons name="person-outline" size={18} color={QuixaColors.primary} />
                <Text style={styles.inclusionText}>Condutor local</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 3. Floating Bottom Sticky Bar */}
      <View style={styles.bottomStickyBar}>
        <View style={styles.priceCol}>
          <Text style={styles.priceLabel}>Valor por pessoa</Text>
          <Text style={styles.priceAmount}>{price}</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.88}
          style={styles.bookBtn}
          onPress={handleBooking}
        >
          <Ionicons name="calendar-outline" size={20} color={QuixaColors.onPrimary} />
          <Text style={styles.bookBtnText}>Reservar Agora</Text>
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
    paddingBottom: 110,
  },
  imageContainer: {
    width: '100%',
    height: 340,
    position: 'relative',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  topImage: {
    width: '100%',
    height: '100%',
  },
  darkGradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  darkGradientBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  topNavActions: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 16 : 24,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  actionCircleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 248, 246, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  imageBadgesRow: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  imageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  imageBadgeTextTertiary: {
    fontSize: 12,
    fontWeight: '600',
    color: QuixaColors.tertiary,
  },
  imageBadgeTextPrimary: {
    fontSize: 12,
    fontWeight: '600',
    color: QuixaColors.primary,
  },
  detailsContent: {
    maxWidth: 390,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 24,
  },
  headerGroup: {
    gap: 10,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    fontWeight: '500',
    color: QuixaColors.onSurfaceVariant,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: QuixaColors.onSurface,
    lineHeight: 32,
    letterSpacing: -0.5,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingTop: 4,
  },
  infoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: QuixaColors.surfaceContainer,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  infoChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: QuixaColors.onSurface,
  },
  guideCard: {
    backgroundColor: QuixaColors.surfaceContainerLow,
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  guideLeftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  guideAvatarWrapper: {
    position: 'relative',
  },
  guideAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: QuixaColors.secondaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: QuixaColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: QuixaColors.surfaceContainerLow,
  },
  guideInfoCol: {
    flex: 1,
  },
  guideName: {
    fontSize: 18,
    fontWeight: '700',
    color: QuixaColors.onSurface,
  },
  guideMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  cadasturBadge: {
    backgroundColor: '#f1dfd9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  cadasturText: {
    fontSize: 10,
    fontWeight: '700',
    color: QuixaColors.tertiary,
  },
  guideSubtext: {
    fontSize: 12,
    color: QuixaColors.onSurfaceVariant,
    flexShrink: 1,
  },
  chatBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: QuixaColors.secondaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionBlock: {
    gap: 8,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: QuixaColors.onSurface,
  },
  descriptionText: {
    fontSize: 14,
    color: QuixaColors.onSurfaceVariant,
    lineHeight: 22,
  },
  inclusionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  inclusionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: QuixaColors.surfaceContainer,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },
  inclusionText: {
    fontSize: 12,
    fontWeight: '600',
    color: QuixaColors.onSurface,
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
    elevation: 10,
  },
  priceCol: {
    flexDirection: 'column',
  },
  priceLabel: {
    fontSize: 12,
    color: QuixaColors.onSurfaceVariant,
  },
  priceAmount: {
    fontSize: 26,
    fontWeight: '800',
    color: QuixaColors.primary,
    letterSpacing: -0.5,
  },
  bookBtn: {
    height: 52,
    paddingHorizontal: 24,
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
  },
  bookBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: QuixaColors.onPrimary,
  },
});
