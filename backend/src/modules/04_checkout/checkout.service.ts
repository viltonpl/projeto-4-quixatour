import { db, createNotification } from '../../database/db';

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

    // Pagamento disponível apenas via Pix (cartão de crédito foi removido)
    if (data.paymentMethod && data.paymentMethod !== 'pix') {
      throw new Error('No momento, o pagamento é feito apenas via Pix.');
    }

    // 1. Localiza a experiência pelo id (ou, em último caso, pelo título exato)
    const selectExp = 'SELECT id, guide_id, title, price, image_key, COALESCE(is_active, 1) as is_active FROM experiences';
    let experience = data.experienceId
      ? db.prepare(`${selectExp} WHERE id = ?`).get(data.experienceId) as any
      : db.prepare(`${selectExp} WHERE LOWER(title) = LOWER(?)`).get(data.title || '') as any;

    if (!experience) {
      throw new Error('Passeio não encontrado.');
    }
    if (!experience.is_active) {
      throw new Error('Este passeio está pausado pelo guia no momento.');
    }

    // O preço vem sempre do banco (o cliente não define quanto vai pagar)
    const calc = this.calculate(experience.price, count, 'pix');

    // 2. Gera código único de reserva (ex: #QX-6789)
    let randomCode = '';
    do {
      randomCode = `#QX-${Math.floor(10000 + Math.random() * 90000)}`;
    } while (db.prepare('SELECT 1 FROM reservations WHERE reservation_code = ?').get(randomCode));
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
      'pix',
      'pendente', // aguarda o guia aceitar no Painel do Prestador
      qrCode,
      voucherText
    );

    const created = db.prepare('SELECT * FROM reservations WHERE id = ?').get(result.lastInsertRowid) as any;

    createNotification(
      userId,
      'pedido_enviado',
      'Pagamento Pix confirmado',
      `${experience.title} • ${count} ${count === 1 ? 'pessoa' : 'pessoas'} • R$ ${calc.total.toFixed(2).replace('.', ',')}. Pedido ${randomCode} enviado ao guia, aguardando confirmação.`,
      { reservationId: created.id, guideId: experience.guide_id }
    );

    return {
      success: true,
      message: 'Pagamento Pix confirmado! Seu pedido foi enviado ao guia para confirmação.',
      reservation: created
    };
  }
}
