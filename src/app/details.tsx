import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { QuixaColors } from '@/constants/theme';
import { AppImages } from '@/constants/images';
import { DetailsService, ExperienceDetails } from '@/services/detailsService';
import { ExploreService } from '@/services/exploreService';

export default function DetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const initialTitle = (params.title as string) || 'Trilha da Galinha Choca & Açude do Cedro';
  const initialImage = (params.image as string) || 'trilha';
  const initialPrice = (params.price as string) || 'R$ 80';
  const paramId = (params.id as string) || '1';

  const [details, setDetails] = useState<ExperienceDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        const data = await DetailsService.getDetails(paramId || initialTitle);
        if (isMounted && data) {
          setDetails(data);
          setIsFavorite(data.is_favorite);
        }
      } catch (err) {
        console.warn('Erro ao buscar detalhes da experiência:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [paramId, initialTitle]);

  const toggleFavorite = async () => {
    const next = !isFavorite;
    setIsFavorite(next);
    const expId = details?.id || Number(paramId) || 1;
    await ExploreService.toggleFavorite(expId);
  };

  const currentImageKey = details?.image_key || initialImage;

  const getImageSource = () => {
    if (currentImageKey === 'trilha') return AppImages.trilha;
    if (currentImageKey === 'voo') return AppImages.voo;
    if (currentImageKey === 'chale') return AppImages.chale;
    if (currentImageKey && currentImageKey.startsWith('http')) return { uri: currentImageKey };
    return AppImages.trilha;
  };

  const handleBooking = () => {
    const title = details?.title || initialTitle;
    const price = details?.price_label || initialPrice;
    const priceNumber = details?.price || 80;
    const image = details?.image_key || initialImage;
    const id = details?.id || paramId;

    router.push({
      pathname: '/checkout',
      params: { id: String(id), title, price, priceNumber: String(priceNumber), image },
    });
  };

  const handleChat = () => {
    const guideId = details?.guide?.id || 1;
    const guideName = details?.guide?.name || 'Guia Zé';
    const guideRole = details?.guide?.role || 'Guia Local Credenciado';
    const guidePhone = details?.guide?.phone || '(88) 99876-5432';

    router.push({
      pathname: '/chat',
      params: {
        guideId: String(guideId),
        guideName,
        guideRole,
        guidePhone,
      },
    });
  };

  const currentTitle = details?.title || initialTitle;
  const currentPrice = details?.price_label || initialPrice;
  const currentDuration = details?.duration || '3h30';
  const currentDifficulty = details?.difficulty || 'Nível Moderado';
  const currentCategory = details?.category_name || 'Ecoturismo';
  const currentLocation = details?.location || 'Sertão dos Monólitos, Quixadá - CE';
  const currentMeeting = details?.meeting_point || 'Cancela Monumental Cedro';
  const currentRating = details?.rating ? details.rating.toFixed(1) : '4.9';
  const currentReviews = details?.reviews_count || 128;
  const currentDesc = details?.description || 'A Trilha da Galinha Choca oferece uma imersão única no coração do Sertão dos Monólitos. Caminhe em meio à caatinga preservada, aprecie a fascinante formação rochosa da Galinha Choca e conclua a jornada contemplando o histórico Açude do Cedro.';
  const currentInclusions = details?.inclusions && details.inclusions.length > 0 
    ? details.inclusions 
    : ['Água mineral', 'Seguro aventura', 'Condutor local'];
  const guideName = details?.guide?.name || 'Guia Zé';
  const guideRole = details?.guide?.role || 'Guia Local Credenciado';
  const guideCadastur = details?.guide?.cadastur || 'Cadastur';

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
              onPress={toggleFavorite}
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
              <Text style={styles.imageBadgeTextTertiary}>{currentCategory}</Text>
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
                {currentLocation}
              </Text>
            </View>

            <Text style={styles.mainTitle}>{currentTitle}</Text>

            {/* Experience Tags / Chips */}
            <View style={styles.chipsWrap}>
              <View style={styles.infoChip}>
                <Ionicons name="time-outline" size={16} color={QuixaColors.primary} />
                <Text style={styles.infoChipText}>{currentDuration}</Text>
              </View>

              <View style={styles.infoChip}>
                <Ionicons name="walk-outline" size={16} color={QuixaColors.primary} />
                <Text style={styles.infoChipText}>{currentDifficulty}</Text>
              </View>

              <View style={styles.infoChip}>
                <Ionicons name="navigate-outline" size={16} color={QuixaColors.primary} />
                <Text style={styles.infoChipText}>{currentMeeting}</Text>
              </View>

              <View style={styles.infoChip}>
                <Ionicons name="star" size={16} color={QuixaColors.primaryContainer} />
                <Text style={styles.infoChipText}>{currentRating} ({currentReviews})</Text>
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
                <Text style={styles.guideName}>{guideName}</Text>
                <View style={styles.guideMetaRow}>
                  <View style={styles.cadasturBadge}>
                    <Text style={styles.cadasturText}>{guideCadastur}</Text>
                  </View>
                  <Text style={styles.guideSubtext}>{guideRole}</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.chatBtn}
              onPress={handleChat}
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
              {currentDesc}
            </Text>
          </View>

          {/* Inclusions Section */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionHeading}>O que está incluído</Text>
            <View style={styles.inclusionsWrap}>
              {currentInclusions.map((inc, index) => (
                <View key={index} style={styles.inclusionBadge}>
                  <Ionicons 
                    name={
                      inc.toLowerCase().includes('água') ? 'water-outline' :
                      inc.toLowerCase().includes('seguro') ? 'shield-checkmark-outline' :
                      inc.toLowerCase().includes('condutor') || inc.toLowerCase().includes('guia') ? 'person-outline' :
                      inc.toLowerCase().includes('café') || inc.toLowerCase().includes('degust') ? 'cafe-outline' :
                      'checkmark-circle-outline'
                    } 
                    size={18} 
                    color={QuixaColors.primary} 
                  />
                  <Text style={styles.inclusionText}>{inc}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 3. Floating Bottom Sticky Bar */}
      <View style={styles.bottomStickyBar}>
        <View style={styles.priceCol}>
          <Text style={styles.priceLabel}>VALOR POR PESSOA</Text>
          <Text style={styles.priceAmount}>{currentPrice}</Text>
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
    alignItems: 'center',
    gap: 8,
  },
  imageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 248, 246, 0.94)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  imageBadgeTextTertiary: {
    fontSize: 12,
    fontWeight: '700',
    color: QuixaColors.tertiary,
  },
  imageBadgeTextPrimary: {
    fontSize: 12,
    fontWeight: '700',
    color: QuixaColors.primary,
  },
  detailsContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  headerGroup: {
    marginBottom: 24,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  locationText: {
    fontSize: 13,
    fontWeight: '600',
    color: QuixaColors.primary,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: QuixaColors.onSurface,
    letterSpacing: -0.5,
    lineHeight: 30,
    marginBottom: 16,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  infoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: QuixaColors.surfaceContainerLowest,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: QuixaColors.outlineVariant,
  },
  infoChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: QuixaColors.onSurfaceVariant,
  },
  guideCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: QuixaColors.surfaceContainerLow,
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: QuixaColors.outlineVariant,
    marginBottom: 24,
  },
  guideLeftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
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
    bottom: -1,
    right: -1,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: QuixaColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  guideInfoCol: {
    flex: 1,
  },
  guideName: {
    fontSize: 16,
    fontWeight: '700',
    color: QuixaColors.onSurface,
    marginBottom: 4,
  },
  guideMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cadasturBadge: {
    backgroundColor: QuixaColors.surfaceContainerHighest,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  cadasturText: {
    fontSize: 10,
    fontWeight: '700',
    color: QuixaColors.onSurfaceVariant,
    letterSpacing: 0.5,
  },
  guideSubtext: {
    fontSize: 12,
    fontWeight: '500',
    color: QuixaColors.onSurfaceVariant,
  },
  chatBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: QuixaColors.secondaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sectionBlock: {
    marginBottom: 24,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: QuixaColors.onSurface,
    letterSpacing: -0.3,
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 14,
    fontWeight: '400',
    color: QuixaColors.onSurfaceVariant,
    lineHeight: 22,
  },
  inclusionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  inclusionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: QuixaColors.surfaceContainerLowest,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: QuixaColors.outlineVariant,
  },
  inclusionText: {
    fontSize: 13,
    fontWeight: '600',
    color: QuixaColors.onSurface,
  },
  bottomStickyBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: QuixaColors.surfaceContainerLowest,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: QuixaColors.outlineVariant,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 8,
  },
  priceCol: {
    justifyContent: 'center',
  },
  priceLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: QuixaColors.onSurfaceVariant,
    letterSpacing: 0.5,
  },
  priceAmount: {
    fontSize: 22,
    fontWeight: '800',
    color: QuixaColors.primary,
    letterSpacing: -0.5,
  },
  bookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: QuixaColors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,
    shadowColor: QuixaColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  bookBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: QuixaColors.onPrimary,
  },
});
