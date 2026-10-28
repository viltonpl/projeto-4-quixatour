import { Router } from 'express';
import { DetailsController } from './details.controller';

const router = Router();

// Rotas da Tela de Detalhes (details.tsx)
router.get('/:id', DetailsController.getDetails);

export default router;
