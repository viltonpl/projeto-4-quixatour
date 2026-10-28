import { Request, Response } from 'express';
import { DetailsService } from './details.service';

export class DetailsController {
  static getDetails(req: Request, res: Response) {
    try {
      const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const userId = Number(req.query.userId) || 1;

      const details = DetailsService.getExperienceDetails(idParam, userId);
      return res.status(200).json({ success: true, data: details });
    } catch (error) {
      console.error('Erro ao buscar detalhes da experiência:', error);
      return res.status(500).json({ success: false, message: 'Erro ao carregar detalhes.' });
    }
  }
}
