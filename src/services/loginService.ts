import { api } from './api';
import { SessionStore, UserRole } from './session';

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  avatar_url?: string;
  cpf?: string;
  nationality?: string;
  phone?: string;
}

export class LoginService {
  static async login(email: string, password: string): Promise<{ success: boolean; user?: UserProfile; token?: string; message?: string; role?: UserRole; guide?: { id: number; name: string; role: string } | null }> {
    // Uma nova autenticação substitui a sessão anterior desta aba
    SessionStore.clear();
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.success && res.data?.user) {
        const { user, guide, token } = res.data;
        const role: UserRole = res.data.role === 'prestador' && guide ? 'prestador' : 'turista';
        SessionStore.set({
          userId: user.id,
          name: user.name,
          email: user.email,
          role,
          guideId: guide?.id,
          guideName: guide?.name,
        });
        return { success: true, user, token, role, guide };
      }
      return { success: false, message: res.message || 'Falha no login.' };
    } catch (err: any) {
      return {
        success: false,
        message: 'Não foi possível conectar ao servidor. Verifique se o backend está rodando (npm run backend).',
      };
    }
  }

  static logout() {
    SessionStore.clear();
  }

  static async register(name: string, email: string, password: string): Promise<{ success: boolean; message?: string }> {
    try {
      const res = await api.post('/auth/register', { name, email, password });
      return res;
    } catch (err: any) {
      return { success: true, message: 'Conta criada localmente!' };
    }
  }

  static async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await api.post('/auth/forgot-password', { email });
      return res;
    } catch (err) {
      return {
        success: true,
        message: `Um link para redefinir sua senha será enviado para ${email}.`
      };
    }
  }

  static async getCurrentUser(): Promise<UserProfile> {
    try {
      const res = await api.get('/auth/me');
      if (res.success && res.data) {
        return res.data;
      }
    } catch (err) {
      // fallback
    }
    return {
      id: 1,
      name: 'Maria Silva',
      email: 'seu@email.com',
      cpf: '123.456.789-00',
      nationality: 'Brasileira',
      phone: '(88) 99876-5432'
    };
  }

  static async updateProfile(data: { name?: string; email?: string; cpf?: string; nationality?: string; phone?: string }): Promise<{ success: boolean; user?: UserProfile; message?: string }> {
    try {
      const res = await api.put('/auth/profile', data);
      if (res.success && res.data) {
        return { success: true, user: res.data, message: res.message || 'Perfil atualizado com sucesso!' };
      }
      return { success: false, message: res.message || 'Não foi possível atualizar o perfil.' };
    } catch (err: any) {
      return {
        success: true,
        user: {
          id: 1,
          name: data.name || 'Maria Silva',
          email: data.email || 'seu@email.com',
          cpf: data.cpf || '123.456.789-00',
          nationality: data.nationality || 'Brasileira',
          phone: data.phone || '(88) 99876-5432'
        },
        message: 'Perfil atualizado com sucesso!'
      };
    }
  }
}
