import { api } from './api';

export interface ExperienceItem {
  id: number;
  category_name: string;
  title: string;
  slug: string;
  description: string;
  location: string;
  meeting_point: string;
  duration: string;
  difficulty: string;
  price: number;
  price_label: string;
  rating: number;
  reviews_count: number;
  image_key: string;
  guide_id: number;
  guide_name: string;
  inclusions: string[];
  is_favorite: boolean;
}

export interface ExploreDataResponse {
  userName: string;
  greeting: string;
  subtitle: string;
  categories: string[];
  experiences: ExperienceItem[];
}

export class ExploreService {
  static async getExploreData(category: string = 'Todos', search: string = ''): Promise<ExploreDataResponse> {
    try {
      const endpoint = `/explore?category=${encodeURIComponent(category)}&search=${encodeURIComponent(search)}`;
      const res = await api.get(endpoint);
      if (res.success && res.data) {
        return res.data;
      }
    } catch (err) {
      console.warn('Usando dados de fallback para Explorar:', err);
    }

    // Fallback completo se offline
    return {
      userName: 'Maria',
      greeting: 'Olá, Maria!',
      subtitle: 'O que vamos explorar em Quixadá hoje?',
      categories: ['Todos', 'Trilhas', 'Aventura', 'Chalés'],
      experiences: [
        {
          id: 1,
          category_name: 'Trilhas',
          title: 'Trilha Galinha Choca & Açude do Cedro',
          slug: 'trilha',
          description: 'A Trilha da Galinha Choca oferece uma imersão única no coração do Sertão dos Monólitos.',
          location: 'Sertão dos Monólitos, Quixadá - CE',
          meeting_point: 'Cancela Monumental Cedro',
          duration: '3h30',
          difficulty: 'Nível moderado',
          price: 80,
          price_label: 'R$ 80',
          rating: 4.9,
          reviews_count: 128,
          image_key: 'trilha',
          guide_id: 1,
          guide_name: 'Guia Zé',
          inclusions: ['Água mineral', 'Seguro aventura', 'Condutor local'],
          is_favorite: false
        },
        {
          id: 2,
          category_name: 'Aventura',
          title: 'Voo Duplo de Parapente',
          slug: 'voo',
          description: 'Sobrevoe as incríveis formações rochosas e monólitos de Quixadá.',
          location: 'Serra do Urucum, Quixadá - CE',
          meeting_point: 'Rampa de Decolagem Urucum',
          duration: '1h',
          difficulty: 'Voo panorâmico',
          price: 280,
          price_label: 'R$ 280',
          rating: 5.0,
          reviews_count: 94,
          image_key: 'voo',
          guide_id: 2,
          guide_name: 'Chico Asas',
          inclusions: ['Equipamento completo', 'Instrutor homologado'],
          is_favorite: false
        },
        {
          id: 3,
          category_name: 'Chalés',
          title: 'Chalé Vista dos Monólitos',
          slug: 'chale',
          description: 'Desfrute de uma hospedagem rústica e charmosa com vista privilegiada para os monólitos.',
          location: 'Vale dos Monólitos, Quixadá - CE',
          meeting_point: 'Recepção Fazenda Monólitos',
          duration: 'Diária',
          difficulty: 'Café incluso',
          price: 220,
          price_label: 'R$ 220 /noite',
          rating: 4.8,
          reviews_count: 62,
          image_key: 'chale',
          guide_id: 3,
          guide_name: 'Clenilda Rocha',
          inclusions: ['Diária com café incluso', 'Wi-Fi e ar condicionado'],
          is_favorite: false
        }
      ]
    };
  }

  static async toggleFavorite(experienceId: number): Promise<boolean> {
    try {
      const res = await api.post('/explore/favorites/toggle', { experienceId });
      if (res.success && res.data) {
        return res.data.is_favorite;
      }
    } catch (err) {
      console.warn('Erro ao salvar favorito na API:', err);
    }
    return true;
  }
}
