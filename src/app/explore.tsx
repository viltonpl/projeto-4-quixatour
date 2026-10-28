import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { QuixaColors } from '@/constants/theme';
import { AppImages } from '@/constants/images';
import { ExploreService, ExperienceItem } from '@/services/exploreService';

type Category = 'Todos' | 'Trilhas' | 'Aventura' | 'Chalés';

export default function ExploreScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [favorites, setFavorites] = useState<{ [key: string]: boolean }>({});
  const [activeTab, setActiveTab] = useState<'explorar' | 'favoritos' | 'notificacoes' | 'reservas'>('explorar');
  const [searchQuery, setSearchQuery] = useState('');
  const [userName, setUserName] = useState('Maria');
  const [greeting, setGreeting] = useState('Olá, Maria!');
  const [subtitle, setSubtitle] = useState('O que vamos explorar em Quixadá hoje?');
  const [categories, setCategories] = useState<string[]>(['Todos', 'Trilhas', 'Aventura', 'Chalés']);
  const [experiences, setExperiences] = useState<ExperienceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchExplore = useCallback(async (cat: string, search: string) => {
    try {
      setLoading(true);
      const data = await ExploreService.getExploreData(cat, search);
      setUserName(data.userName || 'Maria');
      setGreeting(data.greeting || 'Olá, Maria!');
      setSubtitle(data.subtitle || 'O que vamos explorar em Quixadá hoje?');
      if (data.categories?.length) {
        setCategories(data.categories);
      }
      setExperiences(data.experiences || []);

      const favMap: { [key: string]: boolean } = {};
      data.experiences.forEach(e => {
        if (e.is_favorite) favMap[`card${e.id}`] = true;
      });
      setFavorites(prev => ({ ...prev, ...favMap }));
    } catch (err) {
      console.warn('Erro ao carregar explorar:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExplore(selectedCategory, searchQuery);
  }, [selectedCategory, searchQuery, fetchExplore]);

  const toggleFavorite = async (id: number) => {
    const key = `card${id}`;
    const nextState = !favorites[key];
    setFavorites((prev) => ({ ...prev, [key]: nextState }));
    await ExploreService.toggleFavorite(id);
  };

  const handleCardPress = (id: number, title: string, price: string, image: any) => {
    router.push({
      pathname: '/details',
      params: { id: String(id), title, price, image: typeof image === 'string' ? image : 'trilha' },
    });
  };

  const handleProfilePress = () => {
    Alert.alert(
      'Perfil de Usuário',
      `Conectado como: ${userName}\nDeseja sair do aplicativo e retornar ao login?`,
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

  const getImageSource = (key: string) => {
    if (key === 'trilha') return AppImages.trilha;
    if (key === 'voo') return AppImages.voo;
    if (key === 'chale') return AppImages.chale;
    return AppImages.trilha;
  };

  // Se a aba for 'favoritos', filtra apenas as experiências marcadas com coração
  const displayedExperiences = activeTab === 'favoritos'
    ? experiences.filter(e => favorites[`card${e.id}`])
    : experiences;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff8f6" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.mainContainer}>
          {/* 2. Saudação e Foto de Perfil */}
          <View style={styles.greetingRow}>
            <View style={styles.greetingTextCol}>
              <Text style={styles.greetingTitle}>Olá, Maria!</Text>
              <Text style={styles.greetingSubtitle}>
                O que vamos explorar em Quixadá hoje?
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.avatarWrapper}
              onPress={handleProfilePress}
            >
              <View style={styles.avatarLarge}>
                <Ionicons name="person" size={32} color={QuixaColors.primary} />
              </View>
              <View style={styles.statusDot} />
            </TouchableOpacity>
          </View>

          {/* Search Bar & Filter Button */}
          <View style={styles.searchRow}>
            <View style={styles.searchContainer}>
              <Ionicons
                name="search-outline"
                size={22}
                color={QuixaColors.primary}
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar trilhas, chalés, monólitos..."
                placeholderTextColor={`${QuixaColors.secondary}a0`}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <TouchableOpacity activeOpacity={0.85} style={styles.filterBtn}>
              <Ionicons name="options-outline" size={22} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {/* 3. Horizontal Category Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsContainer}
          >
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  activeOpacity={0.8}
                  style={[styles.chip, isActive && styles.chipActive]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text
                    style={[styles.chipText, isActive && styles.chipTextActive]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* 4. Experiências em Destaque */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {activeTab === 'favoritos' ? 'Meus Favoritos' : 'Experiências em destaque'}
            </Text>
            {activeTab !== 'favoritos' && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setSelectedCategory('Todos')}
              >
                <Text style={styles.seeAllText}>Ver todas</Text>
              </TouchableOpacity>
            )}
          </View>

          {loading ? (
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <ActivityIndicator size="large" color={QuixaColors.primary} />
            </View>
          ) : displayedExperiences.length === 0 ? (
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <Ionicons name="compass-outline" size={48} color={QuixaColors.secondary} />
              <Text style={{ marginTop: 12, color: QuixaColors.secondary, fontSize: 14 }}>
                {activeTab === 'favoritos'
                  ? 'Você ainda não favoritou nenhuma experiência.'
                  : 'Nenhuma experiência encontrada.'}
              </Text>
            </View>
          ) : (
            displayedExperiences.map((item) => {
              const isFav = Boolean(favorites[`card${item.id}`]);
              return (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.92}
                  style={styles.card}
                  onPress={() =>
                    handleCardPress(
                      item.id,
                      item.title,
                      item.price_label,
                      item.image_key
                    )
                  }
                >
                  <View style={styles.cardImageContainer}>
                    <Image
                      source={getImageSource(item.image_key)}
                      style={styles.cardImage}
                      resizeMode="cover"
                    />
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={styles.favoriteBtn}
                      onPress={() => toggleFavorite(item.id)}
                    >
                      <Ionicons
                        name={isFav ? 'heart' : 'heart-outline'}
                        size={20}
                        color={isFav ? '#ba1a1a' : QuixaColors.primary}
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.cardBody}>
                    <View style={styles.cardTitleRow}>
                      <Text style={styles.cardTitle}>{item.title}</Text>
                      <View style={styles.ratingBadge}>
                        <Ionicons name="star" size={16} color={QuixaColors.primaryContainer} />
                        <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
                      </View>
                    </View>

                    <View style={styles.cardFooterRow}>
                      <View style={styles.cardDetailInfo}>
                        <Ionicons
                          name="time-outline"
                          size={16}
                          color={QuixaColors.secondary}
                        />
                        <Text style={styles.cardDetailText}>
                          {item.duration} • {item.difficulty}
                        </Text>
                      </View>
                      <Text style={styles.priceText}>{item.price_label}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* 5. Bottom Navigation Tab Bar */}
      <View style={styles.bottomNav}>
        {/* Tab 1: Explorar */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.navBtn, activeTab === 'explorar' && styles.navBtnActive]}
          onPress={() => setActiveTab('explorar')}
        >
          <Ionicons
            name="compass"
            size={24}
            color={activeTab === 'explorar' ? '#ffffff' : QuixaColors.secondary}
          />
        </TouchableOpacity>

        {/* Tab 2: Favoritos */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.navBtn, activeTab === 'favoritos' && styles.navBtnActive]}
          onPress={() => setActiveTab('favoritos')}
        >
          <Ionicons
            name={activeTab === 'favoritos' ? 'heart' : 'heart-outline'}
            size={24}
            color={activeTab === 'favoritos' ? '#ffffff' : QuixaColors.secondary}
          />
        </TouchableOpacity>

        {/* Tab 3: Notificações */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.navBtn, activeTab === 'notificacoes' && styles.navBtnActive]}
          onPress={() => setActiveTab('notificacoes')}
        >
          <Ionicons
            name={activeTab === 'notificacoes' ? 'notifications' : 'notifications-outline'}
            size={24}
            color={activeTab === 'notificacoes' ? '#ffffff' : QuixaColors.secondary}
          />
        </TouchableOpacity>

        {/* Tab 4: Ticket / Minhas Reservas (Redireciona para Minhas Reservas) */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.navBtn, activeTab === 'reservas' && styles.navBtnActive]}
          onPress={() => {
            setActiveTab('reservas');
            router.push('/reservas');
          }}
          accessibilityLabel="Minhas Reservas"
        >
          <Ionicons
            name={activeTab === 'reservas' ? 'ticket' : 'ticket-outline'}
            size={24}
            color={activeTab === 'reservas' ? '#ffffff' : QuixaColors.secondary}
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
    backgroundColor: '#fff8f6',
    borderBottomWidth: 1,
    borderBottomColor: '#fde0d4',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoHeader: {
    width: 36,
    height: 36,
    borderRadius: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: QuixaColors.onSurface,
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarMiniBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fde0d4',
    justifyContent: 'center',
    alignItems: 'center',
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
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greetingTextCol: {
    flex: 1,
  },
  greetingTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: QuixaColors.onSurface,
    letterSpacing: -0.5,
  },
  greetingSubtitle: {
    fontSize: 14,
    color: QuixaColors.onSurfaceVariant,
    marginTop: 2,
  },
  avatarWrapper: {
    position: 'relative',
    marginLeft: 8,
  },
  avatarLarge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fce5dc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#7e2c00',
    borderWidth: 2,
    borderColor: QuixaColors.background,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchContainer: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fedbc9',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#fde0d4',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: QuixaColors.onSurface,
    height: '100%',
  },
  filterBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: QuixaColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: QuixaColors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  chipsContainer: {
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#fde8e1',
  },
  chipActive: {
    backgroundColor: QuixaColors.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#392e2b',
  },
  chipTextActive: {
    color: '#ffffff',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: QuixaColors.onSurface,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8c4a28',
  },
  card: {
    backgroundColor: '#fdeae5',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 12,
  },
  cardImageContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  favoriteBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardBody: {
    padding: 16,
    gap: 6,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: QuixaColors.onSurface,
    flex: 1,
    marginRight: 8,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '700',
    color: QuixaColors.onSurface,
  },
  cardFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  cardDetailInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardDetailText: {
    fontSize: 13,
    color: QuixaColors.onSurfaceVariant,
  },
  priceText: {
    fontSize: 18,
    fontWeight: '700',
    color: QuixaColors.primary,
  },
  perNightText: {
    fontSize: 13,
    fontWeight: '400',
    color: QuixaColors.onSurfaceVariant,
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
