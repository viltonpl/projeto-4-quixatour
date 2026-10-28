import { api } from './api';

export interface ChatMessage {
  id: string;
  from: 'guide' | 'user';
  text: string;
  time: string;
  read?: boolean;
}

export interface ChatConversationResponse {
  guide: {
    id: number;
    name: string;
    role: string;
    is_online: boolean;
    phone?: string;
  };
  context: {
    experience: string;
    status: string;
  };
  messages: ChatMessage[];
}

export class ChatService {
  static async getMessages(guideId: number = 1): Promise<ChatConversationResponse> {
    try {
      const res = await api.get(`/chat/messages?guideId=${guideId}`);
      if (res.success && res.data) {
        return res.data;
      }
    } catch (err) {
      console.warn('Usando fallback para mensagens do chat:', err);
    }

    return {
      guide: {
        id: 1,
        name: 'Guia Zé',
        role: 'Guia Credenciado',
        is_online: true
      },
      context: {
        experience: 'Trilha Galinha Choca • Amanhã, 05:30',
        status: 'Confirmado'
      },
      messages: [
        {
          id: '1',
          from: 'guide',
          text: 'Olá! Tudo pronto para amanhã? A trilha começa cedo, por isso recomendo dormir bem hoje! 🌄',
          time: '08:12',
          read: true
        },
        {
          id: '2',
          from: 'guide',
          text: 'Não esqueça de trazer água (pelo menos 1,5L), protetor solar, repelente e calçado fechado. Nos encontramos no ponto de partida às 05:30 na Cancela Monumental. 🥾',
          time: '08:14',
          read: true
        },
        {
          id: '3',
          from: 'user',
          text: 'Perfeito, Zé! Já estou preparando a mochila. Tenho alguma dúvida sobre o nível de dificuldade — é muito puxado?',
          time: '08:35',
          read: true
        }
      ]
    };
  }

  static async sendMessage(text: string, guideId: number = 1): Promise<{ userMessage: ChatMessage; guideReply?: ChatMessage }> {
    try {
      const res = await api.post('/chat/messages', { text, guideId });
      if (res.success && res.data) {
        return res.data;
      }
    } catch (err) {
      console.warn('Erro ao enviar mensagem na API, fallback local:', err);
    }

    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    return {
      userMessage: {
        id: String(Date.now()),
        from: 'user',
        text,
        time,
        read: false
      }
    };
  }
}
