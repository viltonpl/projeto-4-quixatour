import { Request, Response } from 'express';
import { PrestadorService, EXPERIENCE_CATEGORIES } from './prestador.service';

/** O app envia o guideId do prestador logado na query (GET) ou no corpo (POST/PUT). */
function getGuideId(req: Request): number {
  const id = Number(req.body?.guideId ?? req.query.guideId);
  if (!id) throw new Error('guideId é obrigatório. Entre com uma conta de prestador.');
  return id;
}

function param(req: Request, name: string): number {
  const raw = req.params[name];
  return Number(Array.isArray(raw) ? raw[0] : raw);
}

/** Executa a ação e padroniza a resposta { success, data } / { success: false, message }. */
function handle(res: Response, action: () => any, status = 200) {
  try {
    const data = action();
    return res.status(status).json({ success: true, data });
  } catch (error: any) {
    console.error('[prestador]', error?.message);
    return res.status(400).json({ success: false, message: error?.message || 'Erro ao processar solicitação.' });
  }
}

export class PrestadorController {
  static dashboard(req: Request, res: Response) {
    return handle(res, () => PrestadorService.getDashboard(getGuideId(req)));
  }

  static accept(req: Request, res: Response) {
    return handle(res, () => PrestadorService.acceptRequest(param(req, 'id'), getGuideId(req)));
  }

  static reject(req: Request, res: Response) {
    return handle(res, () => PrestadorService.rejectRequest(param(req, 'id'), getGuideId(req), req.body?.reason || ''));
  }

  static complete(req: Request, res: Response) {
    return handle(res, () => PrestadorService.completeReservation(param(req, 'id'), getGuideId(req)));
  }

  static withdraw(req: Request, res: Response) {
    return handle(res, () => PrestadorService.withdraw(getGuideId(req), req.body?.pixKey));
  }

  static categories(_req: Request, res: Response) {
    return handle(res, () => EXPERIENCE_CATEGORIES);
  }

  static inclusions(_req: Request, res: Response) {
    return handle(res, () => PrestadorService.getInclusionSuggestions());
  }

  static getExperience(req: Request, res: Response) {
    return handle(res, () => PrestadorService.getExperience(param(req, 'id'), getGuideId(req)));
  }

  static createExperience(req: Request, res: Response) {
    return handle(res, () => PrestadorService.createExperience(getGuideId(req), req.body), 201);
  }

  static updateExperience(req: Request, res: Response) {
    return handle(res, () => PrestadorService.updateExperience(param(req, 'id'), getGuideId(req), req.body));
  }

  static setExperienceStatus(req: Request, res: Response) {
    return handle(res, () =>
      PrestadorService.setExperienceActive(param(req, 'id'), getGuideId(req), Boolean(req.body?.is_active))
    );
  }

  static upload(req: Request, res: Response) {
    return handle(res, () => PrestadorService.saveUpload(req.body?.dataUri, req.body?.fileName), 201);
  }

  static getCadastur(req: Request, res: Response) {
    return handle(res, () => PrestadorService.getCadastur(getGuideId(req)));
  }

  static saveCadastur(req: Request, res: Response) {
    return handle(res, () => PrestadorService.saveCadastur(getGuideId(req), req.body || {}, false));
  }

  static submitCadastur(req: Request, res: Response) {
    return handle(res, () => PrestadorService.saveCadastur(getGuideId(req), req.body || {}, true));
  }

  static approveCadastur(req: Request, res: Response) {
    return handle(res, () => PrestadorService.approveCadastur(getGuideId(req)));
  }

  static conversations(req: Request, res: Response) {
    return handle(res, () => PrestadorService.getConversations(getGuideId(req)));
  }

  static conversation(req: Request, res: Response) {
    return handle(res, () => PrestadorService.getConversation(getGuideId(req), param(req, 'touristId')));
  }

  static sendMessage(req: Request, res: Response) {
    return handle(
      res,
      () => PrestadorService.sendMessage(getGuideId(req), param(req, 'touristId'), req.body?.text),
      201
    );
  }
}
