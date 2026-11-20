import { db } from '../../database/db';

export class NotificacoesService {
  static list(userId: number) {
    const rows = db.prepare(`
      SELECT n.*, g.name as guide_name, r.reservation_code, r.status as reservation_status
      FROM notifications n
      LEFT JOIN guides g ON g.id = n.guide_id
      LEFT JOIN reservations r ON r.id = n.reservation_id
      WHERE n.user_id = ?
      ORDER BY n.id DESC
      LIMIT 100
    `).all(userId) as any[];

    return {
      unread: rows.filter(r => !r.is_read).length,
      items: rows.map(r => ({
        id: r.id,
        type: r.type,
        title: r.title,
        body: r.body,
        reservation_id: r.reservation_id,
        reservation_code: r.reservation_code,
        reservation_status: r.reservation_status,
        guide_id: r.guide_id,
        guide_name: r.guide_name,
        is_read: Boolean(r.is_read),
        created_at: r.created_at,
      })),
    };
  }

  static unreadCount(userId: number) {
    return (db.prepare('SELECT COUNT(*) as c FROM notifications WHERE user_id = ? AND is_read = 0')
      .get(userId) as { c: number }).c;
  }

  static markAllRead(userId: number) {
    db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0').run(userId);
    return { unread: 0 };
  }
}
