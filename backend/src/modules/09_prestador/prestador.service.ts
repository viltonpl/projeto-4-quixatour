import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { db, createNotification, LEVEL_LABELS } from '../../database/db';

export const UPLOADS_DIR = path.join(__dirname, '../../../uploads');

export const EXPERIENCE_CATEGORIES = ['Aventuras', 'Trilhas', 'Hospedagens', 'Restaurantes', 'Comidas', 'Lazeres'];

const formatBRL = (value: number) =>
  `R$ ${value.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;

function nowTime(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

export interface ExperienceInput {
  title?: string;
  category_name?: string;
  price?: number | string;
  meeting_point?: string;
  location?: string;
  description?: string;
  duration?: string;
  difficulty?: string;
  inclusions?: string[] | string;
  image_key?: string;
  level?: string | null;
}

export const EXPERIENCE_LEVELS = ['leve', 'moderado', 'dificil'];

/** Rótulo exibido quando o passeio não tem nível (ex.: restaurante, hospedagem). */
const CATEGORY_DIFFICULTY: Record<string, string> = {
  Hospedagens: 'Hospedagem',
  Restaurantes: 'Gastronomia',
  Comidas: 'Gastronomia',
  Lazeres: 'Lazer',
};

/** Tags sugeridas para "O que está incluído", além das já usadas nos passeios. */
const DEFAULT_INCLUSION_TAGS = [
  'Guia credenciado',
  'Água mineral',
  'Seguro aventura',
  'Lanche',
  'Transporte',
  'Fotos do passeio',
  'Equipamento de segurança',
  'Lanterna',
];

export class PrestadorService {
  /** Garante que o guia existe e devolve seus dados. */
  static getGuide(guideId: number) {
    const guide = db.prepare(`
      SELECT g.id, g.name, g.role, g.cadastur, g.rating, g.phone, g.is_online, g.user_id,
             COALESCE(g.cadastur_status, 'nao_enviado') as cadastur_status,
             u.email
      FROM guides g
      LEFT JOIN users u ON u.id = g.user_id
      WHERE g.id = ?
    `).get(guideId) as any;
    if (!guide) throw new Error('Prestador não encontrado.');
    return guide;
  }

  static getBalance(guideId: number) {
    const earned = (db.prepare(`
      SELECT COALESCE(SUM(total), 0) as v FROM reservations WHERE guide_id = ? AND status = 'concluidas'
    `).get(guideId) as { v: number }).v;
    const withdrawn = (db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as v FROM withdrawals WHERE guide_id = ?
    `).get(guideId) as { v: number }).v;
    const toReceive = (db.prepare(`
      SELECT COALESCE(SUM(total), 0) as v FROM reservations WHERE guide_id = ? AND status = 'proximas'
    `).get(guideId) as { v: number }).v;

    const available = Math.max(0, Number((earned - withdrawn).toFixed(2)));
    return {
      available,
      formatted: formatBRL(available),
      to_receive: toReceive,
      formatted_to_receive: formatBRL(toReceive),
    };
  }

  static getDashboard(guideId: number) {
    const guide = this.getGuide(guideId);

    const mapReservation = (r: any) => ({
      id: r.id,
      reservation_code: r.reservation_code,
      tourist_id: r.user_id,
      tourist_name: r.tourist_name || 'Turista',
      title: r.title,
      schedule_text: r.schedule_text,
      participants: r.participants,
      total: r.total,
      formatted_total: formatBRL(r.total),
      payment_method: r.payment_method,
      status: r.status,
    });

    const reservationsQuery = `
      SELECT r.*, u.name as tourist_name
      FROM reservations r
      LEFT JOIN users u ON u.id = r.user_id
      WHERE r.guide_id = ? AND r.status = ?
      ORDER BY r.id DESC
    `;
    const pending = (db.prepare(reservationsQuery).all(guideId, 'pendente') as any[]).map(mapReservation);
    const agenda = (db.prepare(reservationsQuery).all(guideId, 'proximas') as any[]).map(mapReservation);

    const experiences = (db.prepare(`
      SELECT e.id, e.title, e.price, e.price_label, e.image_key, e.category_name,
             COALESCE(e.is_active, 1) as is_active,
             (SELECT COUNT(*) FROM reservations r
                WHERE r.experience_id = e.id AND r.status IN ('proximas', 'concluidas')) as bookings_count
      FROM experiences e
      WHERE e.guide_id = ?
      ORDER BY e.id DESC
    `).all(guideId) as any[]).map(e => ({
      id: e.id,
      title: e.title,
      price: e.price,
      price_label: e.price_label,
      image_key: e.image_key,
      category_name: e.category_name,
      is_active: Boolean(e.is_active),
      bookings_count: e.bookings_count,
    }));

    const unreadMessages = (db.prepare(`
      SELECT COUNT(*) as c FROM messages WHERE guide_id = ? AND sender_type = 'user' AND is_read = 0
    `).get(guideId) as { c: number }).c;

    return {
      guide: {
        id: guide.id,
        name: guide.name,
        role: guide.role,
        cadastur: guide.cadastur,
        cadastur_status: guide.cadastur_status,
        is_verified: guide.cadastur_status === 'aprovado',
        rating: guide.rating,
      },
      balance: this.getBalance(guideId),
      pending,
      agenda,
      experiences,
      unread_messages: unreadMessages,
    };
  }

  private static getOwnedReservation(reservationId: number, guideId: number) {
    const res = db.prepare('SELECT * FROM reservations WHERE id = ? AND guide_id = ?').get(reservationId, guideId) as any;
    if (!res) throw new Error('Pedido não encontrado para este prestador.');
    return res;
  }

  /** Mensagem automática do guia para o turista no chat, registrando a resposta ao pedido. */
  private static notifyTourist(userId: number, guideId: number, text: string) {
    db.prepare(`
      INSERT INTO messages (user_id, guide_id, sender_type, text, time, is_read)
      VALUES (?, ?, 'guide', ?, ?, 0)
    `).run(userId, guideId, text, nowTime());
  }

  static acceptRequest(reservationId: number, guideId: number) {
    const res = this.getOwnedReservation(reservationId, guideId);
    if (res.status !== 'pendente') throw new Error('Este pedido já foi respondido.');

    db.prepare(`
      UPDATE reservations SET status = 'proximas', responded_at = CURRENT_TIMESTAMP WHERE id = ?
    `).run(res.id);

    this.notifyTourist(
      res.user_id,
      guideId,
      `✅ Seu pedido ${res.reservation_code} (${res.title} • ${res.schedule_text}) foi confirmado! Qualquer dúvida, é só me chamar por aqui.`
    );
    createNotification(
      res.user_id,
      'pedido_aceito',
      'Reserva confirmada pelo guia',
      `${res.title} • ${res.schedule_text}. Seu voucher já está disponível em Minhas Reservas.`,
      { reservationId: res.id, guideId }
    );

    return { id: res.id, reservation_code: res.reservation_code, status: 'proximas' };
  }

  static rejectRequest(reservationId: number, guideId: number, reason: string = '') {
    const res = this.getOwnedReservation(reservationId, guideId);
    if (res.status !== 'pendente') throw new Error('Este pedido já foi respondido.');

    const finalReason = reason.trim() || 'O guia não tem disponibilidade para essa data.';
    db.prepare(`
      UPDATE reservations
      SET status = 'recusadas',
          cancellation_reason = ?,
          refund_amount = total,
          refund_status = 'Reembolso integral aprovado (até 3 a 5 dias úteis)',
          cancelled_at = CURRENT_TIMESTAMP,
          responded_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(finalReason, res.id);

    this.notifyTourist(
      res.user_id,
      guideId,
      `Infelizmente não poderei atender o pedido ${res.reservation_code} (${res.title}). Motivo: ${finalReason} Seu reembolso integral já foi solicitado.`
    );
    createNotification(
      res.user_id,
      'pedido_recusado',
      'Pedido recusado pelo guia',
      `${res.title}: ${finalReason} Reembolso integral de R$ ${Number(res.total).toFixed(2).replace('.', ',')} solicitado.`,
      { reservationId: res.id, guideId }
    );

    return { id: res.id, reservation_code: res.reservation_code, status: 'recusadas' };
  }

  static completeReservation(reservationId: number, guideId: number) {
    const res = this.getOwnedReservation(reservationId, guideId);
    if (res.status !== 'proximas') throw new Error('Só é possível concluir passeios confirmados.');
    db.prepare("UPDATE reservations SET status = 'concluidas' WHERE id = ?").run(res.id);
    this.notifyTourist(
      res.user_id,
      guideId,
      `Obrigado pelo passeio "${res.title}"! 🌵 Se puder, deixe sua avaliação na aba Concluídas das suas reservas.`
    );
    createNotification(
      res.user_id,
      'passeio_concluido',
      'Passeio concluído — avalie!',
      `Como foi "${res.title}"? Avalie o guia e a experiência na aba Concluídas.`,
      { reservationId: res.id, guideId }
    );
    return { id: res.id, status: 'concluidas', balance: this.getBalance(guideId) };
  }

  static withdraw(guideId: number, pixKey?: string) {
    const guide = this.getGuide(guideId);
    const balance = this.getBalance(guideId);
    if (balance.available <= 0) throw new Error('Não há saldo disponível para saque.');

    db.prepare('INSERT INTO withdrawals (guide_id, amount, pix_key) VALUES (?, ?, ?)')
      .run(guideId, balance.available, pixKey || guide.email || guide.phone || 'chave-pix');

    return {
      amount: balance.available,
      formatted_amount: balance.formatted,
      message: `Saque de ${balance.formatted} enviado via Pix com sucesso!`,
      balance: this.getBalance(guideId),
    };
  }

  // ---------- Passeios (anúncios) ----------

  static getExperience(experienceId: number, guideId: number) {
    const exp = db.prepare('SELECT * FROM experiences WHERE id = ? AND guide_id = ?').get(experienceId, guideId) as any;
    if (!exp) throw new Error('Passeio não encontrado para este prestador.');
    return {
      ...exp,
      is_active: Boolean(exp.is_active ?? 1),
      inclusions: typeof exp.inclusions === 'string' ? JSON.parse(exp.inclusions) : exp.inclusions,
    };
  }

  private static normalizeInput(data: ExperienceInput) {
    const title = (data.title || '').trim();
    const price = typeof data.price === 'number'
      ? data.price
      : parseFloat(String(data.price || '').replace(/[^0-9,.]/g, '').replace(',', '.'));
    const meetingPoint = (data.meeting_point || '').trim();
    const description = (data.description || '').trim();

    if (!title) throw new Error('Informe o nome do passeio.');
    if (!price || isNaN(price) || price <= 0) throw new Error('Informe um preço válido.');
    if (!meetingPoint) throw new Error('Informe o ponto de encontro.');
    if (!description) throw new Error('Escreva uma descrição para o passeio.');

    const category = EXPERIENCE_CATEGORIES.includes(data.category_name || '') ? data.category_name! : 'Trilhas';
    const perNight = category === 'Hospedagens';
    const rawInclusions = Array.isArray(data.inclusions)
      ? data.inclusions
      : String(data.inclusions || '').split(',');
    // Tags únicas, sem espaços extras e com no máximo 40 caracteres
    const inclusions = Array.from(
      new Set(rawInclusions.map(s => String(s).trim().slice(0, 40)).filter(Boolean))
    );
    const level = data.level && EXPERIENCE_LEVELS.includes(data.level) ? data.level : null;

    return {
      title,
      category_name: category,
      price,
      price_label: `R$ ${Number.isInteger(price) ? price : price.toFixed(2).replace('.', ',')}${perNight ? ' /noite' : ''}`,
      meeting_point: meetingPoint,
      location: (data.location || '').trim() || `${meetingPoint}, Quixadá - CE`,
      description,
      duration: (data.duration || '').trim() || '2h',
      level,
      difficulty: level
        ? LEVEL_LABELS[level]
        : (data.difficulty || '').trim() || CATEGORY_DIFFICULTY[category] || 'Passeio',
      inclusions: JSON.stringify(inclusions.length ? inclusions : ['Guia credenciado']),
      image_key: (data.image_key || '').trim() || 'trilha',
      slug: title.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    };
  }

  static createExperience(guideId: number, data: ExperienceInput) {
    this.getGuide(guideId);
    const e = this.normalizeInput(data);
    const result = db.prepare(`
      INSERT INTO experiences (
        category_name, title, slug, description, location, meeting_point,
        duration, difficulty, price, price_label, rating, reviews_count,
        image_key, guide_id, inclusions, is_featured, is_active, level
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 5.0, 0, ?, ?, ?, 1, 1, ?)
    `).run(
      e.category_name, e.title, e.slug, e.description, e.location, e.meeting_point,
      e.duration, e.difficulty, e.price, e.price_label, e.image_key, guideId, e.inclusions, e.level
    );
    return this.getExperience(Number(result.lastInsertRowid), guideId);
  }

  static updateExperience(experienceId: number, guideId: number, data: ExperienceInput) {
    this.getExperience(experienceId, guideId);
    const e = this.normalizeInput(data);
    db.prepare(`
      UPDATE experiences
      SET category_name = ?, title = ?, slug = ?, description = ?, location = ?, meeting_point = ?,
          duration = ?, difficulty = ?, price = ?, price_label = ?, image_key = ?, inclusions = ?, level = ?
      WHERE id = ? AND guide_id = ?
    `).run(
      e.category_name, e.title, e.slug, e.description, e.location, e.meeting_point,
      e.duration, e.difficulty, e.price, e.price_label, e.image_key, e.inclusions, e.level,
      experienceId, guideId
    );
    return this.getExperience(experienceId, guideId);
  }

  /** Tags de "O que está incluído" já usadas nos passeios do app + sugestões padrão. */
  static getInclusionSuggestions(): string[] {
    const rows = db.prepare('SELECT inclusions FROM experiences').all() as { inclusions: string }[];
    const tags = new Set<string>(DEFAULT_INCLUSION_TAGS);
    for (const row of rows) {
      try {
        for (const tag of JSON.parse(row.inclusions || '[]')) {
          if (typeof tag === 'string' && tag.trim()) tags.add(tag.trim());
        }
      } catch {
        // ignora registros com JSON inválido
      }
    }
    return Array.from(tags).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }

  static setExperienceActive(experienceId: number, guideId: number, isActive: boolean) {
    this.getExperience(experienceId, guideId);
    db.prepare('UPDATE experiences SET is_active = ? WHERE id = ? AND guide_id = ?')
      .run(isActive ? 1 : 0, experienceId, guideId);
    return { id: experienceId, is_active: isActive };
  }

  // ---------- Upload de imagens (foto do passeio / documentos) ----------

  static saveUpload(dataUri: string, originalName?: string) {
    const match = /^data:(image\/(png|jpe?g|webp|gif)|application\/pdf);base64,(.+)$/s.exec(dataUri || '');
    if (!match) throw new Error('Arquivo inválido. Envie uma imagem (PNG/JPG) ou PDF.');

    const buffer = Buffer.from(match[3], 'base64');
    if (buffer.length > 8 * 1024 * 1024) throw new Error('Arquivo muito grande (máximo 8 MB).');

    const ext = match[1] === 'application/pdf' ? 'pdf' : match[2] === 'jpeg' ? 'jpg' : match[2];
    const fileName = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${ext}`;
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    fs.writeFileSync(path.join(UPLOADS_DIR, fileName), buffer);

    return {
      key: `upload:${fileName}`,
      file_name: originalName || fileName,
      size_label: `${(buffer.length / (1024 * 1024)).toFixed(1)} MB`,
    };
  }

  // ---------- Verificação Cadastur ----------

  static getCadastur(guideId: number) {
    const guide = this.getGuide(guideId);
    const row = db.prepare('SELECT * FROM cadastur_verifications WHERE guide_id = ?').get(guideId) as any;
    const parse = (v?: string | null) => (v ? JSON.parse(v) : null);

    const data = {
      doc_front: parse(row?.doc_front),
      doc_back: parse(row?.doc_back),
      cadastur_number: row?.cadastur_number || '',
      credential_file: parse(row?.credential_file),
      selfie: parse(row?.selfie),
      ethics_accepted: Boolean(row?.ethics_accepted),
    };

    const steps = [
      Boolean(data.doc_front && data.doc_back),
      Boolean(data.cadastur_number || data.credential_file),
      Boolean(data.selfie),
    ];
    const done = steps.filter(Boolean).length;

    return {
      status: guide.cadastur_status === 'aprovado' ? 'aprovado' : row?.status || 'rascunho',
      guide_cadastur: guide.cadastur,
      submitted_at: row?.submitted_at || null,
      steps_done: done,
      progress: Math.round((done / 3) * 100),
      ...data,
    };
  }

  /** Salva o rascunho e, se `submit` for true, envia para análise. */
  static saveCadastur(guideId: number, input: any, submit: boolean) {
    this.getGuide(guideId);
    const current = this.getCadastur(guideId);
    if (current.status === 'aprovado') throw new Error('Seu cadastro já foi verificado.');

    const pick = (key: string) => (input[key] !== undefined ? input[key] : (current as any)[key]);
    const toJson = (v: any) => (v ? JSON.stringify(v) : null);
    const merged = {
      doc_front: pick('doc_front'),
      doc_back: pick('doc_back'),
      cadastur_number: String(pick('cadastur_number') || '').trim(),
      credential_file: pick('credential_file'),
      selfie: pick('selfie'),
      ethics_accepted: Boolean(pick('ethics_accepted')),
    };

    if (submit) {
      if (!merged.doc_front || !merged.doc_back) throw new Error('Envie a frente e o verso do documento de identidade.');
      if (!merged.selfie) throw new Error('Envie a selfie de segurança com o documento.');
      if (!merged.ethics_accepted) throw new Error('Aceite o Compromisso Ambiental & Ética Sertaneja.');
    }

    db.prepare(`
      INSERT INTO cadastur_verifications (guide_id, doc_front, doc_back, cadastur_number, credential_file, selfie, ethics_accepted, status, submitted_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(guide_id) DO UPDATE SET
        doc_front = excluded.doc_front,
        doc_back = excluded.doc_back,
        cadastur_number = excluded.cadastur_number,
        credential_file = excluded.credential_file,
        selfie = excluded.selfie,
        ethics_accepted = excluded.ethics_accepted,
        status = excluded.status,
        submitted_at = COALESCE(excluded.submitted_at, cadastur_verifications.submitted_at),
        updated_at = CURRENT_TIMESTAMP
    `).run(
      guideId,
      toJson(merged.doc_front),
      toJson(merged.doc_back),
      merged.cadastur_number,
      toJson(merged.credential_file),
      toJson(merged.selfie),
      merged.ethics_accepted ? 1 : 0,
      submit ? 'em_analise' : current.status === 'em_analise' ? 'em_analise' : 'rascunho',
      submit ? new Date().toISOString() : null
    );

    if (submit) {
      db.prepare("UPDATE guides SET cadastur_status = 'em_analise' WHERE id = ?").run(guideId);
      if (merged.cadastur_number) {
        db.prepare('UPDATE guides SET cadastur = ? WHERE id = ?').run(`Cadastur ${merged.cadastur_number}`, guideId);
      }
    }

    return this.getCadastur(guideId);
  }

  /** Simula a aprovação pela equipe técnica (útil para testar o fluxo completo). */
  static approveCadastur(guideId: number) {
    this.getGuide(guideId);
    db.prepare("UPDATE guides SET cadastur_status = 'aprovado' WHERE id = ?").run(guideId);
    db.prepare("UPDATE cadastur_verifications SET status = 'aprovado' WHERE guide_id = ?").run(guideId);
    return this.getCadastur(guideId);
  }

  // ---------- Chat do lado do prestador ----------

  static getConversations(guideId: number) {
    this.getGuide(guideId);
    const rows = db.prepare(`
      SELECT m.user_id, u.name as tourist_name,
             (SELECT text FROM messages m2 WHERE m2.user_id = m.user_id AND m2.guide_id = ? ORDER BY m2.id DESC LIMIT 1) as last_text,
             (SELECT time FROM messages m2 WHERE m2.user_id = m.user_id AND m2.guide_id = ? ORDER BY m2.id DESC LIMIT 1) as last_time,
             SUM(CASE WHEN m.sender_type = 'user' AND m.is_read = 0 THEN 1 ELSE 0 END) as unread,
             MAX(m.id) as last_id
      FROM messages m
      LEFT JOIN users u ON u.id = m.user_id
      WHERE m.guide_id = ?
      GROUP BY m.user_id
      ORDER BY last_id DESC
    `).all(guideId, guideId, guideId) as any[];

    return rows.map(r => ({
      tourist_id: r.user_id,
      tourist_name: r.tourist_name || 'Turista',
      last_text: r.last_text,
      last_time: r.last_time,
      unread: r.unread,
    }));
  }

  static getConversation(guideId: number, touristId: number) {
    this.getGuide(guideId);
    const tourist = db.prepare('SELECT id, name, phone FROM users WHERE id = ?').get(touristId) as any;
    if (!tourist) throw new Error('Turista não encontrado.');

    // Ao abrir a conversa, o guia lê as mensagens do turista
    db.prepare(`
      UPDATE messages SET is_read = 1 WHERE guide_id = ? AND user_id = ? AND sender_type = 'user'
    `).run(guideId, touristId);

    const reservation = db.prepare(`
      SELECT title, schedule_text, status FROM reservations
      WHERE guide_id = ? AND user_id = ? AND status IN ('pendente', 'proximas')
      ORDER BY id DESC LIMIT 1
    `).get(guideId, touristId) as any;

    const messages = (db.prepare(`
      SELECT id, sender_type, text, time, is_read FROM messages
      WHERE guide_id = ? AND user_id = ? ORDER BY id ASC
    `).all(guideId, touristId) as any[]).map(m => ({
      id: String(m.id),
      from: m.sender_type,
      text: m.text,
      time: m.time,
      read: Boolean(m.is_read),
    }));

    return {
      tourist: { id: tourist.id, name: tourist.name, phone: tourist.phone },
      context: reservation
        ? {
            experience: `${reservation.title} • ${reservation.schedule_text}`,
            status: reservation.status === 'pendente' ? 'Aguardando você' : 'Confirmado',
          }
        : null,
      messages,
    };
  }

  static sendMessage(guideId: number, touristId: number, text: string) {
    if (!text || !text.trim()) throw new Error('A mensagem não pode ser vazia.');
    const guide = this.getGuide(guideId);
    const time = nowTime();
    const result = db.prepare(`
      INSERT INTO messages (user_id, guide_id, sender_type, text, time, is_read)
      VALUES (?, ?, 'guide', ?, ?, 0)
    `).run(touristId, guideId, text.trim(), time);
    const preview = text.trim().length > 90 ? `${text.trim().slice(0, 90)}…` : text.trim();
    createNotification(touristId, 'mensagem', `Nova mensagem de ${guide.name}`, preview, { guideId });
    return { id: String(result.lastInsertRowid), from: 'guide', text: text.trim(), time, read: false };
  }
}
