import { db } from '../../database/db';

export interface ChatMessage {
  id: string;
  from: 'guide' | 'user';
  text: string;
  time: string;
  read?: boolean;
}

export class ChatService {
  static getConversation(userId: number = 1, guideId: number = 1) {
    const guide = db.prepare('SELECT id, name, role, is_online, phone FROM guides WHERE id = ?')
      .get(guideId) as any || { id: 1, name: 'Guia Zé', role: 'Guia Credenciado', is_online: 1 };

    const rawMessages = db.prepare(`
      SELECT id, sender_type as "from", text, time, is_read as read
      FROM messages
      WHERE user_id = ? AND guide_id = ?
      ORDER BY id ASC
    `).all(userId, guideId) as any[];

    const messages: ChatMessage[] = rawMessages.map(m => ({
      id: String(m.id),
      from: m.from,
      text: m.text,
      time: m.time,
      read: Boolean(m.read)
    }));

    return {
      guide: {
        id: guide.id,
        name: guide.name,
        role: guide.role,
        is_online: Boolean(guide.is_online),
        phone: guide.phone
      },
      context: {
        experience: 'Trilha Galinha Choca • Amanhã, 05:30',
        status: 'Confirmado'
      },
      messages
    };
  }

  static sendMessage(userId: number = 1, guideId: number = 1, text: string): { userMessage: ChatMessage; guideReply?: ChatMessage } {
    if (!text || !text.trim()) {
      throw new Error('A mensagem não pode ser vazia.');
    }

    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // 1. Salva a mensagem do usuário
    const stmt = db.prepare(`
      INSERT INTO messages (user_id, guide_id, sender_type, text, time, is_read)
      VALUES (?, ?, 'user', ?, ?, 0)
    `);
    const result = stmt.run(userId, guideId, text.trim(), time);

    const userMessage: ChatMessage = {
      id: String(result.lastInsertRowid),
      from: 'user',
      text: text.trim(),
      time,
      read: false
    };

    // 2. Resposta contextual inteligente do Guia Zé se perguntarem algo comum
    let guideReply: ChatMessage | undefined;
    const lower = text.toLowerCase();

    if (lower.includes('dificuldade') || lower.includes('puxado') || lower.includes('pesado') || lower.includes('nível')) {
      const replyText = 'A trilha é de nível moderado! Vamos em um ritmo bem tranquilo, fazendo paradas estratégicas na sombra para descansar e hidratar. Qualquer pessoa com disposição consegue fazer com calma! 🌵🎒';
      const replyStmt = db.prepare(`
        INSERT INTO messages (user_id, guide_id, sender_type, text, time, is_read)
        VALUES (?, ?, 'guide', ?, ?, 1)
      `);
      const replyRes = replyStmt.run(userId, guideId, replyText, time);
      guideReply = {
        id: String(replyRes.lastInsertRowid),
        from: 'guide',
        text: replyText,
        time,
        read: true
      };
    } else if (lower.includes('horário') || lower.includes('horas') || lower.includes('onde') || lower.includes('ponto')) {
      const replyText = 'Nos encontramos pontualmente às 05:30 na Cancela Monumental do Açude do Cedro. Estarei com a camisa oficial de condutor QuixaTour!';
      const replyStmt = db.prepare(`
        INSERT INTO messages (user_id, guide_id, sender_type, text, time, is_read)
        VALUES (?, ?, 'guide', ?, ?, 1)
      `);
      const replyRes = replyStmt.run(userId, guideId, replyText, time);
      guideReply = {
        id: String(replyRes.lastInsertRowid),
        from: 'guide',
        text: replyText,
        time,
        read: true
      };
    }

    return { userMessage, guideReply };
  }
}
