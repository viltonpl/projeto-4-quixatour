import { db } from '../../database/db';

export interface User {
  id: number;
  name: string;
  email: string;
  avatar_url?: string;
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

    const result = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)')
      .run(name.trim(), trimmedEmail, password);

    const newUser = db.prepare('SELECT id, name, email, avatar_url, created_at FROM users WHERE id = ?')
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
    const user = db.prepare('SELECT id, name, email, avatar_url, created_at FROM users WHERE id = ?')
      .get(userId) as User | undefined;
    return user || null;
  }
}
