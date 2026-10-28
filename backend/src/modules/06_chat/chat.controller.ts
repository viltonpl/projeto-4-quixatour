import { Request, Response } from 'express';
import { ChatService } from './chat.service';

export class ChatController {
  static getMessages(req: Request, res: Response) {
    try {
      const userId = Number(req.query.userId) || 1;
      const guideId = Number(req.query.guideId) || 1;
      const data = ChatService.getConversation(userId, guideId);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      console.error('Erro ao buscar mensagens do chat:', error);
      return res.status(500).json({ success: false, message: 'Erro ao carregar mensagens.' });
    }
  }

  static sendMessage(req: Request, res: Response) {
    try {
      const { text, userId, guideId } = req.body;
      const result = ChatService.sendMessage(Number(userId) || 1, Number(guideId) || 1, text);
      return res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message || 'Erro ao enviar mensagem.' });
    }
  }
}
