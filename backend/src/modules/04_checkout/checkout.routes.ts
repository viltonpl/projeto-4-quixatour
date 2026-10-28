import { Router } from 'express';
import { CheckoutController } from './checkout.controller';

const router = Router();

// Rotas da Tela de Checkout (checkout.tsx)
router.post('/calculate', CheckoutController.calculate);
router.post('/pay', CheckoutController.pay);

export default router;
