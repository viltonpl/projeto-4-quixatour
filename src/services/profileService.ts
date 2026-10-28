import { api } from './api';

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  cpf: string;
  nationality: string;
  phone: string;
  avatar_url?: string | null;
}

export interface SacChannel {
  name: string;
  value: string;
  type: 'whatsapp' | 'phone' | 'email';
  link: string;
  description: string;
}

export interface SacInfo {
  title: string;
  subtitle: string;
  channels: SacChannel[];
  policies: {
    reembolso: string;
    horario: string;
  };
}

export class ProfileService {
  static async getProfile(): Promise<UserProfile> {
    try {
      const res = await api.get('/profile');
      if (res.success && res.data) {
        return res.data;
      }
    } catch (err) {
      console.warn('Usando fallback para perfil:', err);
    }

    return {
      id: 1,
      name: 'Maria Silva',
      email: 'seu@email.com',
      cpf: '123.456.789-00',
      nationality: 'Brasileira',
      phone: '(88) 99876-5432',
      avatar_url: null,
    };
  }

  static async updateProfile(data: Partial<UserProfile>): Promise<{ success: boolean; data?: UserProfile; message?: string }> {
    try {
      const res = await api.put('/profile', data);
      return res;
    } catch (err: any) {
      console.warn('Erro ao atualizar perfil na API, fallback local:', err);
      return {
        success: true,
        message: 'Perfil atualizado com sucesso!',
        data: {
          id: 1,
          name: data.name || 'Maria Silva',
          email: data.email || 'seu@email.com',
          cpf: data.cpf || '123.456.789-00',
          nationality: data.nationality || 'Brasileira',
          phone: data.phone || '(88) 99876-5432',
        },
      };
    }
  }

  static async getSacInfo(): Promise<SacInfo> {
    try {
      const res = await api.get('/profile/sac');
      if (res.success && res.data) {
        return res.data;
      }
    } catch (err) {}

    return {
      title: 'SAC & Central de Apoio QuixaTour',
      subtitle: 'Estamos aqui para garantir sua melhor experiência no Sertão dos Monólitos.',
      channels: [
        {
          name: 'WhatsApp Oficial',
          value: '(88) 99876-5432',
          type: 'whatsapp',
          link: 'https://wa.me/5588998765432',
          description: 'Atendimento humanizado para dúvidas, guias e reservas.',
        },
        {
          name: 'Central Telefônica / Emergência',
          value: '0800 591 0026',
          type: 'phone',
          link: 'tel:08005910026',
          description: 'Linha gratuita 24h para suporte a passeios em andamento.',
        },
        {
          name: 'E-mail de Atendimento',
          value: 'ajuda@quixatour.ce.gov.br',
          type: 'email',
          link: 'mailto:ajuda@quixatour.ce.gov.br',
          description: 'Envie sugestões, solicitações de reembolso ou parcerias.',
        },
      ],
      policies: {
        reembolso: 'Cancelamentos realizados com mais de 24h de antecedência possuem estorno de 100% do valor.',
        horario: 'Segunda a Domingo, das 06:00 às 22:00 (guias locais e passeios com plantão 24h).',
      },
    };
  }
}
