import { api } from './api';

export interface ExperienceDetails {
  id: number;
  title: string;
  slug: string;
  category_name: string;
  image_key: string;
  price: number;
  price_label: string;
  rating: number;
  reviews_count: number;
  location: string;
  meeting_point: string;
  duration: string;
  difficulty: string;
  description: string;
  inclusions: string[];
  is_favorite: boolean;
  guide: {
    id: number;
    name: string;
    role: string;
    cadastur?: string;
    rating: number;
    is_online: boolean;
    phone?: string;
  };
}

export class DetailsService {
  static async getDetails(idOrSlug: string | number): Promise<ExperienceDetails> {
    try {
      const res = await api.get(`/details/${encodeURIComponent(idOrSlug)}`);
      if (res.success && res.data) {
        return res.data;
      }
    } catch (err) {
      console.warn('Usando fallback para Detalhes:', err);
    }

    // Fallback completo se offline
    return {
      id: 1,
      title: 'Trilha da Galinha Choca & Açude do Cedro',
      slug: 'trilha',
      category_name: 'Trilhas',
      image_key: 'trilha',
      price: 80,
      price_label: 'R$ 80',
      rating: 4.9,
      reviews_count: 128,
      location: 'Sertão dos Monólitos, Quixadá - CE',
      meeting_point: 'Cancela Monumental Cedro',
      duration: '3h30',
      difficulty: 'Nível Moderado',
      description: 'A Trilha da Galinha Choca oferece uma imersão única no coração do Sertão dos Monólitos. Caminhe em meio à caatinga preservada, aprecie a fascinante formação rochosa da Galinha Choca e conclua a jornada contemplando o histórico Açude do Cedro.',
      inclusions: ['Água mineral', 'Seguro aventura', 'Condutor local'],
      is_favorite: false,
      guide: {
        id: 1,
        name: 'Guia Zé',
        role: 'Guia Local Credenciado',
        cadastur: 'Cadastur',
        rating: 4.9,
        is_online: true,
        phone: '(88) 99876-5432'
      }
    };
  }
}
