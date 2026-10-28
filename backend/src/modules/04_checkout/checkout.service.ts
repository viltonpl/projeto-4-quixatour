import { db } from '../../database/db';

export interface CheckoutCalculation {
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

export interface CreateOrderDTO {
  userId?: number;
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
  static calculate(rawPrice: number | string, participants: number = 1, paymentMethod: 'pix' | 'credit' = 'pix'): CheckoutCalculation {
    let numericPrice = typeof rawPrice === 'number' ? rawPrice : parseFloat(String(rawPrice).replace(/[^0-9,.]/g, '').replace(',', '.')) || 85.0;
    const count = Math.max(1, Math.min(8, participants));
    const subtotal = numericPrice * count;
    const isPix = paymentMethod === 'pix';
    const discount = isPix ? subtotal * 0.05 : 0;
    const total = subtotal - discount;

    const installments = [1, 2, 3].map(num => ({
      count: num,
      value: Number((total / num).toFixed(2)),
      formatted: `${num}x R$ ${(total / num).toFixed(2).replace('.', ',')}`
    }));

    return {
      numericPrice,
      participants: count,
      subtotal,
      isPix,
      discount,
      total,
      installments
    };
  }

  static createReservation(data: CreateOrderDTO) {
    const userId = data.userId || 1;
    const count = Math.max(1, Math.min(8, data.participants || 1));
    const isPix = data.paymentMethod === 'pix';

    // 1. Localiza a experiência para vincular guia e id
    let experience = db.prepare('SELECT id, guide_id, title, price, image_key FROM experiences WHERE LOWER(title) LIKE LOWER(?) OR id = ?')
      .get(`%${data.title}%`, data.experienceId || 0) as any;

    if (!experience) {
      experience = db.prepare('SELECT id, guide_id, title, price, image_key FROM experiences WHERE id = 1').get() as any;
    }

    const calc = this.calculate(data.numericPrice || experience.price, count, data.paymentMethod);

    // Validação de cartão se for crédito
    if (!isPix && data.cardData) {
      const { number, expiry, cvv } = data.cardData;
      if (!number || !expiry || !cvv) {
        throw new Error('Dados do cartão incompletos.');
      }
    }

    // 2. Gera código único de reserva (ex: #QX-6789)
    const randomCode = `#QX-${Math.floor(1000 + Math.random() * 9000)}`;
    const schedule = data.scheduleText || 'Amanhã, 05:30';
    const qrCode = `QUIXATOUR-${randomCode.replace('#', '')}-VAL-2026`;
    const voucherText = 'Apresente este código ao condutor/guia credenciado no início do passeio.';

    const stmt = db.prepare(`
      INSERT INTO reservations (
        reservation_code, user_id, experience_id, guide_id, title,
        schedule_text, date_label, participants, subtotal, discount, total,
        payment_method, status, qr_code_data, voucher_instructions
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      randomCode,
      userId,
      experience.id,
      experience.guide_id,
      experience.title,
      schedule,
      schedule,
      count,
      calc.subtotal,
      calc.discount,
      calc.total,
      data.paymentMethod,
      'proximas',
      qrCode,
      voucherText
    );

    const created = db.prepare('SELECT * FROM reservations WHERE id = ?').get(result.lastInsertRowid) as any;

    return {
      success: true,
      message: isPix ? 'Pagamento Pix confirmado!' : 'Pagamento com cartão aprovado!',
      reservation: created
    };
  }
}
