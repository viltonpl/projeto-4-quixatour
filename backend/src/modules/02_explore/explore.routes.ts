import { Router } from 'express';
import { ExploreController } from './explore.controller';

const router = Router();

// Rotas da Tela Explorar (explore.tsx)
router.get('/', ExploreController.getExploreData);
router.post('/favorites/toggle', ExploreController.toggleFavorite);
router.get('/favorites', ExploreController.getFavorites);

export default router;
