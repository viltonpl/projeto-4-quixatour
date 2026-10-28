import { db } from '../../database/db';

export class DetailsService {
  static getExperienceDetails(identifier: string | number, userId: number = 1) {
    let query = `
      SELECT 
        e.*,
        g.name as guide_name,
        g.role as guide_role,
        g.cadastur as guide_cadastur,
        g.rating as guide_rating,
        g.is_online as guide_is_online,
        g.phone as guide_phone,
        CASE WHEN f.id IS NOT NULL THEN 1 ELSE 0 END as is_favorite
      FROM experiences e
      LEFT JOIN guides g ON e.guide_id = g.id
      LEFT JOIN favorites f ON f.experience_id = e.id AND f.user_id = ?
      WHERE 
    `;

    const isNumeric = !isNaN(Number(identifier));
    let raw: any;

    if (isNumeric) {
      query += ` e.id = ?`;
      raw = db.prepare(query).get(userId, Number(identifier));
    } else {
      query += ` (LOWER(e.slug) = LOWER(?) OR LOWER(e.title) LIKE LOWER(?))`;
      raw = db.prepare(query).get(userId, String(identifier), `%${identifier}%`);
    }

    if (!raw) {
      // Fallback para a primeira experiência (Trilha Galinha Choca) se não encontrar
      raw = db.prepare(`
        SELECT 
          e.*,
          g.name as guide_name,
          g.role as guide_role,
          g.cadastur as guide_cadastur,
          g.rating as guide_rating,
          g.is_online as guide_is_online,
          g.phone as guide_phone,
          0 as is_favorite
        FROM experiences e
        LEFT JOIN guides g ON e.guide_id = g.id
        WHERE e.id = 1
      `).get();
    }

    return {
      id: raw.id,
      title: raw.title,
      slug: raw.slug,
      category_name: raw.category_name,
      image_key: raw.image_key,
      price: raw.price,
      price_label: raw.price_label,
      rating: raw.rating,
      reviews_count: raw.reviews_count,
      location: raw.location,
      meeting_point: raw.meeting_point,
      duration: raw.duration,
      difficulty: raw.difficulty,
      description: raw.description,
      inclusions: typeof raw.inclusions === 'string' ? JSON.parse(raw.inclusions) : raw.inclusions,
      is_favorite: Boolean(raw.is_favorite),
      guide: {
        id: raw.guide_id,
        name: raw.guide_name,
        role: raw.guide_role,
        cadastur: raw.guide_cadastur,
        rating: raw.guide_rating,
        is_online: Boolean(raw.guide_is_online),
        phone: raw.guide_phone
      }
    };
  }
}
