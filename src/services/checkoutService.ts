import { api } from './api';

export interface CalculationResult {
  numericPrice: number;
  participants: number;
  subtotal: number;
  isPix: boolean;
  discount: number;
  total: number;
  installments: {
    count: number;
    value: number;
    formatted: string;
  }[];
}

export interface PaymentData {
  experienceId?: number;
  title: string;
  imageKey?: string;
  numericPrice: number;
  participants: number;
  paymentMethod: 'pix' | 'credit';
  scheduleText?: string;
  cardData?: {
    number: string;
    expiry: string;
    cvv: string;
    installments: string;
  };
}

export class CheckoutService {
  static async calculate(price: number | string, participants: number, paymentMethod: 'pix' | 'credit'): Promise<CalculationResult> {
    try {
      const res = await api.post('/checkout/calculate', { price, participants, paymentMethod });
      if (res.success && res.data) {
        return res.data;
      }
    } catch (err) {
      console.warn('Usando cálculo local offline para checkout:', err);
    }

    // Cálculo local resiliente
    const numPrice = typeof price === 'number' ? price : parseFloat(String(price).replace(/[^0-9,.]/g, '').replace(',', '.')) || 85.0;
    const subtotal = numPrice * participants;
    const isPix = paymentMethod === 'pix';
    const discount = isPix ? subtotal * 0.05 : 0;
    const total = subtotal - discount;

    return {
      numericPrice: numPrice,
      participants,
      subtotal,
      isPix,
      discount,
      total,
      installments: [1, 2, 3].map(n => ({
        count: n,
        value: Number((total / n).toFixed(2)),
        formatted: `${n}x R$ ${(total / n).toFixed(2).replace('.', ',')}`
      }))
    };
  }

  static async submitPayment(data: PaymentData): Promise<{ success: boolean; message?: string; reservation?: any }> {
    try {
      const res = await api.post('/checkout/pay', data);
      return res;
    } catch (err: any) {
      // Sem servidor não há reserva: não fingimos sucesso
      console.warn('Erro na chamada da API de pagamento:', err);
      return {
        success: false,
        message: 'Não foi possível conectar ao servidor. Verifique se o backend está rodando.',
      };
    }
  }
}
