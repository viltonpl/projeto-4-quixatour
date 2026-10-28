import { db } from '../../database/db';

export interface ExperienceDTO {
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

export class ExploreService {
  static getExploreData(userId: number = 1, category: string = 'Todos', search: string = '') {
    // 1. Dados do usuário logado para a saudação
    const user = db.prepare('SELECT name FROM users WHERE id = ?').get(userId) as { name: string } | undefined;
    const userName = user?.name || 'Maria';

    // 2. Lista de categorias
    const categories = (db.prepare('SELECT name FROM categories').all() as { name: string }[]).map(c => c.name);

    // 3. Consulta de experiências com status de favorito do usuário
    let query = `
      SELECT 
        e.*,
        g.name as guide_name,
        CASE WHEN f.id IS NOT NULL THEN 1 ELSE 0 END as is_favorite
      FROM experiences e
      LEFT JOIN guides g ON e.guide_id = g.id
      LEFT JOIN favorites f ON f.experience_id = e.id AND f.user_id = ?
      WHERE 1=1
    `;
    const params: any[] = [userId];

    if (category && category !== 'Todos') {
      query += ` AND LOWER(e.category_name) = LOWER(?)`;
      params.push(category);
    }

    if (search && search.trim() !== '') {
      query += ` AND (LOWER(e.title) LIKE ? OR LOWER(e.description) LIKE ? OR LOWER(e.location) LIKE ?)`;
      const term = `%${search.trim().toLowerCase()}%`;
      params.push(term, term, term);
    }

    query += ` ORDER BY e.id ASC`;

    const rawExperiences = db.prepare(query).all(...params) as any[];

    const experiences: ExperienceDTO[] = rawExperiences.map(exp => ({
      id: exp.id,
      category_name: exp.category_name,
      title: exp.title,
      slug: exp.slug,
      description: exp.description,
      location: exp.location,
      meeting_point: exp.meeting_point,
      duration: exp.duration,
      difficulty: exp.difficulty,
      price: exp.price,
      price_label: exp.price_label,
      rating: exp.rating,
      reviews_count: exp.reviews_count,
      image_key: exp.image_key,
      guide_id: exp.guide_id,
      guide_name: exp.guide_name,
      inclusions: typeof exp.inclusions === 'string' ? JSON.parse(exp.inclusions) : exp.inclusions,
      is_favorite: Boolean(exp.is_favorite)
    }));

    return {
      userName,
      greeting: `Olá, ${userName}!`,
      subtitle: 'O que vamos explorar em Quixadá hoje?',
      categories,
      experiences
    };
  }

  static toggleFavorite(userId: number = 1, experienceId: number): { is_favorite: boolean } {
    const existing = db.prepare('SELECT id FROM favorites WHERE user_id = ? AND experience_id = ?')
      .get(userId, experienceId) as { id: number } | undefined;

    if (existing) {
      db.prepare('DELETE FROM favorites WHERE id = ?').run(existing.id);
      return { is_favorite: false };
    } else {
      db.prepare('INSERT INTO favorites (user_id, experience_id) VALUES (?, ?)').run(userId, experienceId);
      return { is_favorite: true };
    }
  }

  static getUserFavorites(userId: number = 1): number[] {
    const rows = db.prepare('SELECT experience_id FROM favorites WHERE user_id = ?').all(userId) as { experience_id: number }[];
    return rows.map(r => r.experience_id);
  }
}
