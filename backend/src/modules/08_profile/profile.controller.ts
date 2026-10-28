import { Request, Response } from 'express';
import { ProfileService } from './profile.service';

export class ProfileController {
  static getProfile(req: Request, res: Response) {
    try {
      const userId = Number(req.query.userId) || 1;
      const profile = ProfileService.getProfile(userId);
      return res.status(200).json({ success: true, data: profile });
    } catch (error: any) {
      console.error('Erro ao buscar perfil:', error);
      return res.status(500).json({ success: false, message: 'Erro ao carregar dados do perfil.' });
    }
  }

  static updateProfile(req: Request, res: Response) {
    try {
      const userId = Number(req.body.userId) || 1;
      const { name, email, cpf, nationality, phone } = req.body;

      const updated = ProfileService.updateProfile(userId, {
        name,
        email,
        cpf,
        nationality,
        phone,
      });

      return res.status(200).json({
        success: true,
        data: updated,
        message: 'Perfil atualizado com sucesso!',
      });
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      return res.status(500).json({ success: false, message: 'Erro ao salvar alterações no perfil.' });
    }
  }

  static getSac(req: Request, res: Response) {
    try {
      const sac = ProfileService.getSacInfo();
      return res.status(200).json({ success: true, data: sac });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: 'Erro ao carregar informações do SAC.' });
    }
  }
}
