import { Router } from 'express';
import { ProfileController } from './profile.controller';

const router = Router();

// Rotas da Tela de Perfil (profile.tsx)
router.get('/', ProfileController.getProfile);
router.put('/', ProfileController.updateProfile);
router.get('/sac', ProfileController.getSac);

export default router;
