import { api } from './api';

export interface ReservationItem {
  id: number;
  reservation_code: string;
  title: string;
  schedule_text: string;
  date_label: string;
  meeting_point?: string;
  participants: number;
  total: number;
  formatted_price: string;
  image_key: string;
  qr_code_data?: string;
  voucher_instructions?: string;
  rating?: number;
  guide?: {
    id: number;
    name: string;
    role: string;
  };
}

export interface ReservasResponse {
  proximas: ReservationItem[];
  concluidas: ReservationItem[];
  counts: {
    proximas: number;
    concluidas: number;
  };
}

export class ReservasService {
  static async getReservations(): Promise<ReservasResponse> {
    try {
      const res = await api.get('/reservas');
      if (res.success && res.data) {
        return res.data;
      }
    } catch (err) {
      console.warn('Usando dados de fallback para reservas:', err);
    }

    return {
      proximas: [
        {
          id: 1,
          reservation_code: '#QX-4892',
          title: 'Trilha Galinha Choca & Açude do Cedro',
          schedule_text: 'Amanhã, 05:30',
          date_label: 'Amanhã, 05:30',
          meeting_point: 'Cancela Monumental Cedro • 3h 30m',
          participants: 1,
          total: 76.0,
          formatted_price: 'R$ 76,00',
          image_key: 'trilha',
          qr_code_data: 'QUIXATOUR-QX-4892-VAL-2026',
          voucher_instructions: 'Apresente este código ao Guia Zé na saída da trilha.',
          guide: { id: 1, name: 'Guia Zé', role: 'Guia Credenciado' }
        },
        {
          id: 2,
          reservation_code: '#QX-5104',
          title: 'Voo Livre na Serra do Urucum',
          schedule_text: 'SÁB, 24 DE OUTUBRO • 14:00',
          date_label: 'SÁB, 24 DE OUTUBRO • 14:00',
          meeting_point: 'Rampa de Decolagem Urucum',
          participants: 1,
          total: 380.0,
          formatted_price: 'R$ 380,00',
          image_key: 'voo',
          guide: { id: 2, name: 'Chico Asas', role: 'Instrutor Chico Asas' }
        }
      ],
      concluidas: [
        {
          id: 3,
          reservation_code: '#QX-3901',
          title: 'Chalé Vista dos Monólitos ao Pôr do Sol',
          schedule_text: '02 Out 2024',
          date_label: '02 Out 2024',
          participants: 2,
          total: 140.0,
          formatted_price: 'R$ 140,00',
          image_key: 'chale',
          rating: 5,
          guide: { id: 3, name: 'Clenilda Rocha', role: 'Guia Clenilda Rocha' }
        }
      ],
      counts: {
        proximas: 2,
        concluidas: 1
      }
    };
  }

  static async getVoucher(reservationId: number | string) {
    try {
      const res = await api.get(`/reservas/${encodeURIComponent(reservationId)}/voucher`);
      if (res.success && res.data) {
        return res.data;
      }
    } catch (err) {}
    return {
      reservation_code: String(reservationId),
      title: 'Trilha Galinha Choca & Açude do Cedro',
      qr_code_data: 'QUIXATOUR-QX-4892-VAL-2026',
      voucher_instructions: 'Apresente este código ao Guia Zé na saída da trilha.'
    };
  }

  static async getReceipt(reservationId: number | string) {
    try {
      const res = await api.get(`/reservas/${encodeURIComponent(reservationId)}/receipt`);
      if (res.success && res.data) {
        return res.data;
      }
    } catch (err) {}
    return {
      reservation_code: '#QX-3901',
      title: 'Chalé Vista dos Monólitos ao Pôr do Sol',
      date: '02 Out 2024',
      participants: 2,
      total: 140.0,
      payment_method: 'Cartão de Crédito'
    };
  }
}
