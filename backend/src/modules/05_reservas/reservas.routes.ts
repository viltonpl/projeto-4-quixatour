import { Router } from 'express';
import { ReservasController } from './reservas.controller';

const router = Router();

// Rotas da Tela Minhas Reservas (reservas.tsx)
router.get('/', ReservasController.getReservations);
router.get('/:id/voucher', ReservasController.getVoucher);
router.get('/:id/receipt', ReservasController.getReceipt);

export default router;
