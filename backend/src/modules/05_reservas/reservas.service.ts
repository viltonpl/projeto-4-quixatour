import { db } from '../../database/db';

export class ReservasService {
  static getReservations(userId: number = 1) {
    const query = `
      SELECT 
        r.*,
        e.slug as experience_slug,
        e.image_key as experience_image_key,
        e.meeting_point,
        e.duration,
        g.name as guide_name,
        g.role as guide_role,
        g.avatar as guide_avatar,
        (SELECT rw.rating FROM reviews rw WHERE rw.reservation_id = r.id) as user_review_rating
      FROM reservations r
      LEFT JOIN experiences e ON r.experience_id = e.id
      LEFT JOIN guides g ON r.guide_id = g.id
      WHERE r.user_id = ?
      ORDER BY r.id DESC
    `;

    const allReservations = db.prepare(query).all(userId) as any[];

    const proximas = allReservations
      .filter(r => r.status === 'proximas')
      .map(r => ({
        id: r.id,
        reservation_code: r.reservation_code,
        title: r.title,
        schedule_text: r.schedule_text,
        date_label: r.date_label,
        meeting_point: r.meeting_point || 'Cancela Monumental Cedro • 3h 30m',
        participants: r.participants,
        total: r.total,
        formatted_price: `R$ ${r.total.toFixed(2).replace('.', ',')}`,
        image_key: r.experience_image_key || 'trilha',
        qr_code_data: r.qr_code_data,
        voucher_instructions: r.voucher_instructions || 'Apresente este código ao condutor credenciado.',
        guide: {
          id: r.guide_id,
          name: r.guide_name || 'Guia Zé',
          role: r.guide_role || 'Guia Credenciado'
        }
      }));

    const concluidas = allReservations
      .filter(r => r.status === 'concluidas')
      .map(r => ({
        id: r.id,
        reservation_code: r.reservation_code,
        title: r.title,
        date_label: r.date_label,
        participants: r.participants,
        total: r.total,
        formatted_price: `R$ ${r.total.toFixed(2).replace('.', ',')}`,
        image_key: r.experience_image_key || 'chale',
        rating: r.user_review_rating || 5,
        guide: {
          id: r.guide_id,
          name: r.guide_name || 'Guia Clenilda Rocha',
          role: r.guide_role || 'Guia Credenciada'
        }
      }));

    return {
      proximas,
      concluidas,
      counts: {
        proximas: proximas.length,
        concluidas: concluidas.length
      }
    };
  }

  static getVoucher(reservationId: number | string, userId: number = 1) {
    const isCode = String(reservationId).startsWith('#');
    let res: any;

    if (isCode) {
      res = db.prepare(`
        SELECT r.*, e.title as exp_title, g.name as guide_name
        FROM reservations r
        LEFT JOIN experiences e ON r.experience_id = e.id
        LEFT JOIN guides g ON r.guide_id = g.id
        WHERE r.reservation_code = ? AND r.user_id = ?
      `).get(reservationId, userId);
    } else {
      res = db.prepare(`
        SELECT r.*, e.title as exp_title, g.name as guide_name
        FROM reservations r
        LEFT JOIN experiences e ON r.experience_id = e.id
        LEFT JOIN guides g ON r.guide_id = g.id
        WHERE r.id = ? AND r.user_id = ?
      `).get(Number(reservationId), userId);
    }

    if (!res) {
      res = db.prepare('SELECT * FROM reservations WHERE id = 1').get();
    }

    return {
      reservation_code: res.reservation_code,
      title: res.title,
      qr_code_data: res.qr_code_data,
      voucher_instructions: res.voucher_instructions,
      guide_name: res.guide_name || 'Guia Zé'
    };
  }

  static getReceipt(reservationId: number | string, userId: number = 1) {
    const res = db.prepare('SELECT * FROM reservations WHERE id = ? OR reservation_code = ?').get(reservationId, reservationId) as any;
    if (!res) {
      throw new Error('Reserva não encontrada.');
    }

    return {
      reservation_code: res.reservation_code,
      title: res.title,
      date: res.date_label,
      participants: res.participants,
      subtotal: res.subtotal,
      discount: res.discount,
      total: res.total,
      payment_method: res.payment_method === 'pix' ? 'Pix (com 5% de desconto)' : 'Cartão de Crédito',
      status: 'Pago e Confirmado'
    };
  }
}
