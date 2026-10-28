import { db } from '../../database/db';

export interface UserProfileDTO {
  id: number;
  name: string;
  email: string;
  cpf: string;
  nationality: string;
  phone: string;
  avatar_url?: string | null;
}

export interface UpdateProfileDTO {
  name?: string;
  email?: string;
  cpf?: string;
  nationality?: string;
  phone?: string;
}

export class ProfileService {
  static getProfile(userId: number = 1): UserProfileDTO {
    const user = db.prepare(`
      SELECT id, name, email, cpf, nationality, phone, avatar_url
      FROM users
      WHERE id = ?
    `).get(userId) as any;

    if (!user) {
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

    return {
      id: user.id,
      name: user.name || 'Maria Silva',
      email: user.email || 'seu@email.com',
      cpf: user.cpf || '123.456.789-00',
      nationality: user.nationality || 'Brasileira',
      phone: user.phone || '(88) 99876-5432',
      avatar_url: user.avatar_url,
    };
  }

  static updateProfile(userId: number = 1, data: UpdateProfileDTO): UserProfileDTO {
    const current = this.getProfile(userId);

    const name = data.name !== undefined ? data.name.trim() : current.name;
    const email = data.email !== undefined ? data.email.trim() : current.email;
    const cpf = data.cpf !== undefined ? data.cpf.trim() : current.cpf;
    const nationality = data.nationality !== undefined ? data.nationality.trim() : current.nationality;
    const phone = data.phone !== undefined ? data.phone.trim() : current.phone;

    db.prepare(`
      UPDATE users
      SET name = ?, email = ?, cpf = ?, nationality = ?, phone = ?
      WHERE id = ?
    `).run(name, email, cpf, nationality, phone, userId);

    return {
      id: userId,
      name,
      email,
      cpf,
      nationality,
      phone,
      avatar_url: current.avatar_url,
    };
  }

  static getSacInfo() {
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
