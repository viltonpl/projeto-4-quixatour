import express from 'express';
import cors from 'cors';
import { initDatabase } from './database/db';

// Importação das rotas organizadas por tela
import loginRoutes from './modules/01_login/login.routes';
import exploreRoutes from './modules/02_explore/explore.routes';
import detailsRoutes from './modules/03_details/details.routes';
import checkoutRoutes from './modules/04_checkout/checkout.routes';
import reservasRoutes from './modules/05_reservas/reservas.routes';
import chatRoutes from './modules/06_chat/chat.routes';
import avaliarRoutes from './modules/07_avaliar/avaliar.routes';
import profileRoutes from './modules/08_profile/profile.routes';

const app = express();
const PORT: number = Number(process.env.PORT) || 3001;

// Middlewares globais
app.use(cors());
app.use(express.json());

// Inicializa o banco de dados SQLite com tabelas e dados iniciais
initDatabase();

// Rotas da API mapeadas por tela
app.use('/api/auth', loginRoutes);          // Tela 1: Login / Cadastro
app.use('/api/explore', exploreRoutes);      // Tela 2: Explorar
app.use('/api/details', detailsRoutes);      // Tela 3: Detalhes da Experiência
app.use('/api/checkout', checkoutRoutes);    // Tela 4: Pagamento / Checkout
app.use('/api/reservas', reservasRoutes);    // Tela 5: Minhas Reservas
app.use('/api/chat', chatRoutes);            // Tela 6: Chat com o Guia
app.use('/api/avaliar', avaliarRoutes);      // Tela 7: Avaliar Passeio
app.use('/api/profile', profileRoutes);      // Tela 8: Perfil do Usuário / SAC

// Rota de Health Check e status da API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'QuixaTour Backend API',
    database: 'SQLite',
    screens: [
      { name: 'Login', path: '/api/auth' },
      { name: 'Explorar', path: '/api/explore' },
      { name: 'Detalhes', path: '/api/details' },
      { name: 'Checkout', path: '/api/checkout' },
      { name: 'Minhas Reservas', path: '/api/reservas' },
      { name: 'Chat com Guia', path: '/api/chat' },
      { name: 'Avaliar', path: '/api/avaliar' },
      { name: 'Perfil / SAC', path: '/api/profile' },
    ],
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('====================================================');
  console.log(`🚀 QuixaTour Backend Server rodando na porta ${PORT}`);
  console.log(`📍 Local:   http://localhost:${PORT}`);
  console.log(`📱 Rede/IP: http://10.0.0.181:${PORT}`);
  console.log(`🏥 Health:  http://localhost:${PORT}/api/health`);
  console.log('====================================================');
});

export default app;
