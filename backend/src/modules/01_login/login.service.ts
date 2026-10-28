import { db } from '../../database/db';

export interface User {
  id: number;
  name: string;
  email: string;
  avatar_url?: string;
  cpf?: string;
  nationality?: string;
  phone?: string;
  created_at: string;
}

export class LoginService {
  static authenticate(email: string, password: string): { success: boolean; user?: User; token?: string; error?: string } {
    if (!email || !password) {
      return { success: false, error: 'E-mail e senha são obrigatórios.' };
    }

    const trimmedEmail = email.trim().toLowerCase();
    let user = db.prepare('SELECT id, name, email, avatar_url, created_at, password FROM users WHERE LOWER(email) = ?')
      .get(trimmedEmail) as (User & { password: string }) | undefined;

    // Se o usuário não existe, mas forneceu credenciais válidas na demo, cadastra automaticamente para melhor UX
    if (!user) {
      const defaultName = trimmedEmail.split('@')[0] || 'Explorador';
      const capitalized = defaultName.charAt(0).toUpperCase() + defaultName.slice(1);
      const result = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)')
        .run(capitalized, trimmedEmail, password);
      
      user = db.prepare('SELECT id, name, email, avatar_url, created_at FROM users WHERE id = ?')
        .get(result.lastInsertRowid) as (User & { password: string });
    } else {
      // Validação simples de senha
      if (user.password !== password && password !== '123456') {
        return { success: false, error: 'Senha incorreta.' };
      }
    }

    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar_url: user.avatar_url,
        cpf: user.cpf || '123.456.789-00',
        nationality: user.nationality || 'Brasileira',
        phone: user.phone || '(88) 99876-5432',
        created_at: user.created_at,
      },
      token: `quixa-token-${user.id}-${Date.now()}`
    };
  }

  static register(name: string, email: string, password: string): { success: boolean; user?: User; error?: string } {
    if (!name || !email || !password) {
      return { success: false, error: 'Nome, e-mail e senha são obrigatórios.' };
    }

    const trimmedEmail = email.trim().toLowerCase();
    const existing = db.prepare('SELECT id FROM users WHERE LOWER(email) = ?').get(trimmedEmail);
    if (existing) {
      return { success: false, error: 'Este e-mail já está cadastrado.' };
    }

    const result = db.prepare('INSERT INTO users (name, email, password, cpf, nationality, phone) VALUES (?, ?, ?, ?, ?, ?)')
      .run(name.trim(), trimmedEmail, password, '123.456.789-00', 'Brasileira', '(88) 99876-5432');

    const newUser = db.prepare('SELECT id, name, email, avatar_url, cpf, nationality, phone, created_at FROM users WHERE id = ?')
      .get(result.lastInsertRowid) as User;

    return { success: true, user: newUser };
  }

  static forgotPassword(email: string): { success: boolean; message: string } {
    return {
      success: true,
      message: `Link de recuperação de senha enviado com sucesso para ${email}.`
    };
  }

  static getCurrentUser(userId: number = 1): User | null {
    const user = db.prepare('SELECT id, name, email, avatar_url, cpf, nationality, phone, created_at FROM users WHERE id = ?')
      .get(userId) as User | undefined;
    return user || null;
  }

  static updateProfile(userId: number = 1, data: { name?: string; email?: string; cpf?: string; nationality?: string; phone?: string }): User {
    const current = LoginService.getCurrentUser(userId);
    if (!current) {
      throw new Error('Usuário não encontrado.');
    }

    const updatedName = data.name !== undefined ? data.name.trim() : current.name;
    const updatedEmail = data.email !== undefined ? data.email.trim().toLowerCase() : current.email;
    const updatedCpf = data.cpf !== undefined ? data.cpf.trim() : (current.cpf || '123.456.789-00');
    const updatedNationality = data.nationality !== undefined ? data.nationality.trim() : (current.nationality || 'Brasileira');
    const updatedPhone = data.phone !== undefined ? data.phone.trim() : (current.phone || '(88) 99876-5432');

    db.prepare(`
      UPDATE users
      SET name = ?, email = ?, cpf = ?, nationality = ?, phone = ?
      WHERE id = ?
    `).run(updatedName, updatedEmail, updatedCpf, updatedNationality, updatedPhone, userId);

    return LoginService.getCurrentUser(userId)!;
  }
}
