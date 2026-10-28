import { db } from '../../database/db';

export interface SubmitReviewDTO {
  reservationId?: number;
  experienceId?: number;
  userId?: number;
  guideId?: number;
  rating: number;
  ratingLabel?: string;
  comment?: string;
}

const DEFAULT_RATING_LABELS: { [key: number]: string } = {
  1: 'Poderia ter sido melhor 🌧️',
  2: 'Razoável, mas com ressalvas 🍃',
  3: 'Bom passeio no sertão ☀️',
  4: 'Muito bom! Recomendo bastante 🧗',
  5: 'Excelente! Experiência inesquecível ✨'
};

export class AvaliarService {
  static getReviewContext(reservationId: number = 3) {
    const res = db.prepare(`
      SELECT 
        r.id as reservation_id,
        r.experience_id,
        r.guide_id,
        e.title as experience_title,
        e.image_key,
        g.name as guide_name,
        g.role as guide_role
      FROM reservations r
      LEFT JOIN experiences e ON r.experience_id = e.id
      LEFT JOIN guides g ON r.guide_id = g.id
      WHERE r.id = ?
    `).get(reservationId) as any;

    if (!res) {
      return {
        reservation_id: 3,
        experience_id: 1,
        guide_id: 1,
        experience_title: 'Trilha da Galinha Choca',
        guide_name: 'Guia Zé',
        guide_role: 'Guia Local Credenciado'
      };
    }

    return {
      reservation_id: res.reservation_id,
      experience_id: res.experience_id,
      guide_id: res.guide_id,
      experience_title: res.experience_title,
      guide_name: res.guide_name,
      guide_role: res.guide_role
    };
  }

  static submitReview(data: SubmitReviewDTO) {
    const rating = Math.max(1, Math.min(5, Number(data.rating) || 5));
    const label = data.ratingLabel || DEFAULT_RATING_LABELS[rating] || 'Excelente!';
    const userId = data.userId || 1;
    const reservationId = data.reservationId || 3;

    // Obtém dados da reserva
    const res = db.prepare('SELECT experience_id, guide_id FROM reservations WHERE id = ?').get(reservationId) as any || { experience_id: 1, guide_id: 1 };
    const experienceId = data.experienceId || res.experience_id || 1;
    const guideId = data.guideId || res.guide_id || 1;

    // Remove avaliações anteriores da mesma reserva para garantir 1 avaliação única e atualizada
    db.prepare('DELETE FROM reviews WHERE reservation_id = ?').run(reservationId);

    const stmt = db.prepare(`
      INSERT INTO reviews (reservation_id, experience_id, user_id, guide_id, rating, rating_label, comment)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(reservationId, experienceId, userId, guideId, rating, label, (data.comment || '').trim());
    const reviewId = Number(result.lastInsertRowid);

    // Atualiza a média de avaliação da experiência no banco
    const avgData = db.prepare('SELECT AVG(rating) as avg_rating, COUNT(*) as count FROM reviews WHERE experience_id = ?')
      .get(experienceId) as { avg_rating: number; count: number };

    if (avgData && avgData.count > 0) {
      const rounded = Number(avgData.avg_rating.toFixed(1));
      db.prepare('UPDATE experiences SET rating = ?, reviews_count = reviews_count + 1 WHERE id = ?')
        .run(rounded, experienceId);
    }

    return {
      id: reviewId,
      rating,
      rating_label: label,
      comment: data.comment
    };
  }

  static getReviewsForExperience(experienceId: number = 1) {
    return db.prepare(`
      SELECT rw.*, u.name as user_name
      FROM reviews rw
      LEFT JOIN users u ON rw.user_id = u.id
      WHERE rw.experience_id = ?
      ORDER BY rw.id DESC
    `).all(experienceId);
  }
}
