import React, { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { QuixaColors } from '@/constants/theme';
import { AppImages } from '@/constants/images';

type Category = 'Todos' | 'Trilhas' | 'Aventura' | 'Chalés';

export default function ExploreScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<Category>('Todos');
  const [favorites, setFavorites] = useState<{ [key: string]: boolean }>({});
  const [activeTab, setActiveTab] = useState<'explorar' | 'favoritos' | 'notificacoes' | 'reservas'>('explorar');
  const [searchQuery, setSearchQuery] = useState('');

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const categories: Category[] = ['Todos', 'Trilhas', 'Aventura', 'Chalés'];

  const handleCardPress = (title: string, price: string, image: any) => {
    router.push({
      pathname: '/details',
      params: { title, price, image: typeof image === 'string' ? image : '' },
    });
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
            <Text style={styles.sectionTitle}>Experiências em destaque</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() =>
                handleCardPress(
                  'Trilha Galinha Choca & Açude do Cedro',
                  'R$ 80',
                  'trilha'
                )
              }
            >
              <Text style={styles.seeAllText}>Ver todas</Text>
            </TouchableOpacity>
          </View>

          {/* Card 1: Trilha Galinha Choca & Açude */}
          {(selectedCategory === 'Todos' || selectedCategory === 'Trilhas') && (
            <TouchableOpacity
              activeOpacity={0.92}
              style={styles.card}
              onPress={() =>
                handleCardPress(
                  'Trilha Galinha Choca & Açude do Cedro',
                  'R$ 80',
                  'trilha'
                )
              }
            >
              <View style={styles.cardImageContainer}>
                <Image
                  source={AppImages.trilha}
                  style={styles.cardImage}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.favoriteBtn}
                  onPress={() => toggleFavorite('card1')}
                >
                  <Ionicons
                    name={favorites['card1'] ? 'heart' : 'heart-outline'}
                    size={20}
                    color={favorites['card1'] ? '#ba1a1a' : QuixaColors.primary}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.cardBody}>
                <View style={styles.cardTitleRow}>
                  <Text style={styles.cardTitle}>
                    Trilha Galinha Choca & Açude
                  </Text>
                  <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={16} color={QuixaColors.primaryContainer} />
                    <Text style={styles.ratingText}>4.9</Text>
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
                      3h30 • Nível moderado
                    </Text>
                  </View>
                  <Text style={styles.priceText}>R$ 80</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}

          {/* Card 2: Voo Duplo de Parapente */}
          {(selectedCategory === 'Todos' || selectedCategory === 'Aventura') && (
            <TouchableOpacity
              activeOpacity={0.92}
              style={styles.card}
              onPress={() =>
                handleCardPress(
                  'Voo Duplo de Parapente',
                  'R$ 280',
                  'voo'
                )
              }
            >
              <View style={styles.cardImageContainer}>
                <Image
                  source={AppImages.voo}
                  style={styles.cardImage}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.favoriteBtn}
                  onPress={() => toggleFavorite('card2')}
                >
                  <Ionicons
                    name={favorites['card2'] ? 'heart' : 'heart-outline'}
                    size={20}
                    color={favorites['card2'] ? '#ba1a1a' : QuixaColors.primary}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.cardBody}>
                <View style={styles.cardTitleRow}>
                  <Text style={styles.cardTitle}>Voo Duplo de Parapente</Text>
                  <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={16} color={QuixaColors.primaryContainer} />
                    <Text style={styles.ratingText}>5.0</Text>
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
                      1h • Voo panorâmico
                    </Text>
                  </View>
                  <Text style={styles.priceText}>R$ 280</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}

          {/* Card 3: Chalé Vista dos Monólitos */}
          {(selectedCategory === 'Todos' || selectedCategory === 'Chalés') && (
            <TouchableOpacity
              activeOpacity={0.92}
              style={styles.card}
              onPress={() =>
                handleCardPress(
                  'Chalé Vista dos Monólitos',
                  'R$ 220',
                  'chale'
                )
              }
            >
              <View style={styles.cardImageContainer}>
                <Image
                  source={AppImages.chale}
                  style={styles.cardImage}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.favoriteBtn}
                  onPress={() => toggleFavorite('card3')}
                >
                  <Ionicons
                    name={favorites['card3'] ? 'heart' : 'heart-outline'}
                    size={20}
                    color={favorites['card3'] ? '#ba1a1a' : QuixaColors.primary}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.cardBody}>
                <View style={styles.cardTitleRow}>
                  <Text style={styles.cardTitle}>
                    Chalé Vista dos Monólitos
                  </Text>
                  <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={16} color={QuixaColors.primaryContainer} />
                    <Text style={styles.ratingText}>4.8</Text>
                  </View>
                </View>

                <View style={styles.cardFooterRow}>
                  <View style={styles.cardDetailInfo}>
                    <Ionicons
                      name="home-outline"
                      size={16}
                      color={QuixaColors.secondary}
                    />
                    <Text style={styles.cardDetailText}>
                      Diária com café incluso
                    </Text>
                  </View>
                  <Text style={styles.priceText}>
                    R$ 220 <Text style={styles.perNightText}>/noite</Text>
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
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
