import { Request, Response } from 'express';
import { AvaliarService } from './avaliar.service';

export class AvaliarController {
  static getContext(req: Request, res: Response) {
    try {
      const reservationId = Number(req.query.reservationId) || 3;
      const data = AvaliarService.getReviewContext(reservationId);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Erro ao carregar dados do passeio.' });
    }
  }

  static submitReview(req: Request, res: Response) {
    try {
      const result = AvaliarService.submitReview(req.body);
      return res.status(201).json({
        success: true,
        message: 'Avaliação enviada com sucesso! Obrigado pelo feedback.',
        data: result
      });
    } catch (error: any) {
      console.error('Erro ao enviar avaliação:', error);
      return res.status(400).json({ success: false, message: error.message || 'Erro ao registrar avaliação.' });
    }
  }

  static getReviews(req: Request, res: Response) {
    try {
      const experienceId = Number(req.params.experienceId) || 1;
      const reviews = AvaliarService.getReviewsForExperience(experienceId);
      return res.status(200).json({ success: true, data: reviews });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Erro ao listar avaliações.' });
    }
  }
}
