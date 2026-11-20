import { Router, Request, Response } from 'express';
import { NotificacoesService } from './notificacoes.service';

const router = Router();

const userIdOf = (req: Request) => Number(req.query.userId ?? req.body?.userId) || 1;

// Rotas da Tela de Notificações do turista (notificacoes.tsx)
router.get('/', (req: Request, res: Response) => {
  try {
    res.json({ success: true, data: NotificacoesService.list(userIdOf(req)) });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erro ao carregar notificações.' });
  }
});

router.get('/contagem', (req: Request, res: Response) => {
  try {
    res.json({ success: true, data: { unread: NotificacoesService.unreadCount(userIdOf(req)) } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erro ao contar notificações.' });
  }
});

router.post('/lidas', (req: Request, res: Response) => {
  try {
    res.json({ success: true, data: NotificacoesService.markAllRead(userIdOf(req)) });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erro ao marcar notificações como lidas.' });
  }
});

export default router;
