import { Router } from 'express';
import { LoginController } from './login.controller';

const router = Router();

// Rotas da Tela de Login (index.tsx)
router.post('/login', LoginController.login);
router.post('/register', LoginController.register);
router.post('/forgot-password', LoginController.forgotPassword);
router.get('/me', LoginController.getProfile);

export default router;
