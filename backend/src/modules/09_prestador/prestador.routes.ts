import { Router } from 'express';
import { PrestadorController } from './prestador.controller';

const router = Router();

// Rotas das telas do Prestador (prestador.tsx, novo-passeio.tsx, cadastur.tsx, prestador-chat.tsx)
router.get('/dashboard', PrestadorController.dashboard);

// Pedidos de turistas
router.post('/pedidos/:id/aceitar', PrestadorController.accept);
router.post('/pedidos/:id/recusar', PrestadorController.reject);
router.post('/pedidos/:id/concluir', PrestadorController.complete);

// Financeiro
router.post('/saque', PrestadorController.withdraw);

// Passeios (anúncios)
router.get('/categorias', PrestadorController.categories);
router.get('/inclusoes', PrestadorController.inclusions); // tags prontas de "O que está incluído"
router.get('/passeios/:id', PrestadorController.getExperience);
router.post('/passeios', PrestadorController.createExperience);
router.put('/passeios/:id', PrestadorController.updateExperience);
router.put('/passeios/:id/status', PrestadorController.setExperienceStatus);

// Upload de fotos e documentos
router.post('/upload', PrestadorController.upload);

// Verificação Cadastur
router.get('/cadastur', PrestadorController.getCadastur);
router.put('/cadastur', PrestadorController.saveCadastur);
router.post('/cadastur/enviar', PrestadorController.submitCadastur);
router.post('/cadastur/aprovar', PrestadorController.approveCadastur); // simula a equipe técnica

// Chat com os turistas
router.get('/conversas', PrestadorController.conversations);
router.get('/conversas/:touristId', PrestadorController.conversation);
router.post('/conversas/:touristId', PrestadorController.sendMessage);

export default router;
