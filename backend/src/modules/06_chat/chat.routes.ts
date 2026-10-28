import { Router } from 'express';
import { ChatController } from './chat.controller';

const router = Router();

// Rotas da Tela de Chat com o Guia (chat.tsx)
router.get('/messages', ChatController.getMessages);
router.post('/messages', ChatController.sendMessage);

export default router;
