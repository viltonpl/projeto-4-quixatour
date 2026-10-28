import { Request, Response } from 'express';
import { ReservasService } from './reservas.service';

export class ReservasController {
  static getReservations(req: Request, res: Response) {
    try {
      const userId = Number(req.query.userId) || 1;
      const data = ReservasService.getReservations(userId);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      console.error('Erro ao buscar reservas:', error);
      return res.status(500).json({ success: false, message: 'Erro ao carregar reservas.' });
    }
  }

  static getVoucher(req: Request, res: Response) {
    try {
      const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const userId = Number(req.query.userId) || 1;
      const voucher = ReservasService.getVoucher(idParam, userId);
      return res.status(200).json({ success: true, data: voucher });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Erro ao carregar voucher.' });
    }
  }

  static getReceipt(req: Request, res: Response) {
    try {
      const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const userId = Number(req.query.userId) || 1;
      const receipt = ReservasService.getReceipt(idParam, userId);
      return res.status(200).json({ success: true, data: receipt });
    } catch (error: any) {
      return res.status(404).json({ success: false, message: error.message || 'Erro ao emitir recibo.' });
    }
  }

  static cancelReservation(req: Request, res: Response) {
    try {
      const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const userId = Number(req.body.userId) || 1;
      const reason = req.body.reason || '';

      const result = ReservasService.cancelReservation(idParam, userId, reason);
      return res.status(200).json({
        success: true,
        message: 'Reserva cancelada com sucesso! O reembolso foi agendado.',
        data: result
      });
    } catch (error: any) {
      console.error('Erro ao cancelar reserva:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Erro ao cancelar reserva.'
      });
    }
  }
}
