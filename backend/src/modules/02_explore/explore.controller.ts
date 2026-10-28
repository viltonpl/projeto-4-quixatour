import { Request, Response } from 'express';
import { ExploreService } from './explore.service';

export class ExploreController {
  static getExploreData(req: Request, res: Response) {
    try {
      const userId = Number(req.query.userId) || 1;
      const category = (req.query.category as string) || 'Todos';
      const search = (req.query.search as string) || '';

      const data = ExploreService.getExploreData(userId, category, search);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      console.error('Erro ao buscar dados do Explorar:', error);
      return res.status(500).json({ success: false, message: 'Erro ao carregar experiências do catálogo.' });
    }
  }

  static toggleFavorite(req: Request, res: Response) {
    try {
      const userId = Number(req.body.userId) || 1;
      const experienceId = Number(req.body.experienceId);

      if (!experienceId) {
        return res.status(400).json({ success: false, message: 'ID da experiência é obrigatório.' });
      }

      const result = ExploreService.toggleFavorite(userId, experienceId);
      return res.status(200).json({
        success: true,
        data: result,
        message: result.is_favorite ? 'Adicionado aos favoritos!' : 'Removido dos favoritos.'
      });
    } catch (error) {
      console.error('Erro ao alternar favorito:', error);
      return res.status(500).json({ success: false, message: 'Erro ao salvar favorito.' });
    }
  }

  static getFavorites(req: Request, res: Response) {
    try {
      const userId = Number(req.query.userId) || 1;
      const favorites = ExploreService.getUserFavorites(userId);
      return res.status(200).json({ success: true, data: favorites });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Erro ao buscar favoritos.' });
    }
  }
}
