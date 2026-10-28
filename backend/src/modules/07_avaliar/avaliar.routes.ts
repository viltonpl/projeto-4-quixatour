import { Router } from 'express';
import { AvaliarController } from './avaliar.controller';

const router = Router();

// Rotas da Tela de Avaliar Passeio (avaliar.tsx)
router.get('/context', AvaliarController.getContext);
router.post('/', AvaliarController.submitReview);
router.get('/experience/:experienceId', AvaliarController.getReviews);

export default router;
