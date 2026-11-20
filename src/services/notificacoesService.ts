import { api } from './api';

export type NotificationType =
  | 'pedido_enviado'
  | 'pedido_aceito'
  | 'pedido_recusado'
  | 'passeio_concluido'
  | 'mensagem';

export interface NotificationItem {
  id: number;
  type: NotificationType;
  title: string;
  body: string;
  reservation_id?: number | null;
  reservation_code?: string | null;
  reservation_status?: string | null;
  guide_id?: number | null;
  guide_name?: string | null;
  is_read: boolean;
  created_at: string;
}

export class NotificacoesService {
  static async list(): Promise<{ unread: number; items: NotificationItem[] }> {
    const res = await api.get('/notificacoes');
    if (!res?.success) throw new Error(res?.message || 'Erro ao carregar notificações.');
    return res.data;
  }

  /** Quantidade de não lidas (0 se o servidor estiver fora). */
  static async unreadCount(): Promise<number> {
    try {
      const res = await api.get('/notificacoes/contagem');
      return res?.success ? res.data.unread : 0;
    } catch {
      return 0;
    }
  }

  static async markAllRead(): Promise<void> {
    try {
      await api.post('/notificacoes/lidas');
    } catch {
      // tenta de novo na próxima abertura
    }
  }
}
