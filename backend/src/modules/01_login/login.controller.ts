import { Request, Response } from 'express';
import { LoginService } from './login.service';

export class LoginController {
  static login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = LoginService.authenticate(email, password);

      if (!result.success) {
        return res.status(400).json({ success: false, message: result.error });
      }

      return res.status(200).json({
        success: true,
        message: 'Login realizado com sucesso!',
        data: result
      });
    } catch (error) {
      console.error('Erro no login:', error);
      return res.status(500).json({ success: false, message: 'Erro interno ao realizar login.' });
    }
  }

  static register(req: Request, res: Response) {
    try {
      const { name, email, password } = req.body;
      const result = LoginService.register(name, email, password);

      if (!result.success) {
        return res.status(400).json({ success: false, message: result.error });
      }

      return res.status(201).json({
        success: true,
        message: 'Conta criada com sucesso!',
        data: result.user
      });
    } catch (error) {
      console.error('Erro no cadastro:', error);
      return res.status(500).json({ success: false, message: 'Erro interno ao criar conta.' });
    }
  }

  static forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;
      const result = LoginService.forgotPassword(email || '');
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Erro ao processar solicitação.' });
    }
  }

  static getProfile(req: Request, res: Response) {
    try {
      const userId = Number(req.query.userId) || 1;
      const user = LoginService.getCurrentUser(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
      }
      return res.status(200).json({ success: true, data: user });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Erro ao buscar perfil.' });
    }
  }
}
