import { Request, Response } from 'express';
import { CheckoutService } from './checkout.service';

export class CheckoutController {
  static calculate(req: Request, res: Response) {
    try {
      const { price, participants, paymentMethod } = req.body;
      const calculation = CheckoutService.calculate(price, Number(participants) || 1, paymentMethod || 'pix');
      return res.status(200).json({ success: true, data: calculation });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Erro ao calcular valores.' });
    }
  }

  static pay(req: Request, res: Response) {
    try {
      const result = CheckoutService.createReservation(req.body);
      return res.status(201).json(result);
    } catch (error: any) {
      console.error('Erro ao processar reserva:', error);
      return res.status(400).json({ success: false, message: error.message || 'Erro ao processar reserva.' });
    }
  }
}
