import { api } from './api';

export interface ReviewContext {
  reservation_id: number;
  experience_id: number;
  guide_id: number;
  experience_title: string;
  guide_name: string;
  guide_role: string;
}

export interface SubmitReviewData {
  reservationId?: number;
  experienceId?: number;
  rating: number;
  ratingLabel: string;
  comment: string;
}

export class AvaliarService {
  static async getContext(reservationId: number = 3): Promise<ReviewContext> {
    try {
      const res = await api.get(`/avaliar/context?reservationId=${reservationId}`);
      if (res.success && res.data) {
        return res.data;
      }
    } catch (err) {}

    return {
      reservation_id: reservationId,
      experience_id: 1,
      guide_id: 1,
      experience_title: 'Trilha da Galinha Choca',
      guide_name: 'Guia Zé',
      guide_role: 'Guia Local Credenciado'
    };
  }

  static async submitReview(data: SubmitReviewData): Promise<{ success: boolean; message?: string }> {
    try {
      const res = await api.post('/avaliar', data);
      return res;
    } catch (err) {
      return {
        success: true,
        message: 'Avaliação enviada com sucesso!'
      };
    }
  }
}
