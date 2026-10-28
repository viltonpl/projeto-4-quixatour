import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(__dirname, '../../quixatour.db');

export const db = new Database(DB_PATH);

// Habilita foreign keys no SQLite
db.pragma('foreign_keys = ON');

export function initDatabase() {
  db.exec(`
    -- Tabela de Usuários (Tela Login e Perfil)
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      avatar_url TEXT,
      cpf TEXT DEFAULT '123.456.789-00',
      nationality TEXT DEFAULT 'Brasileira',
      phone TEXT DEFAULT '(88) 99876-5432',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Tabela de Guias e Instrutores
    CREATE TABLE IF NOT EXISTS guides (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      cadastur TEXT,
      avatar TEXT,
      is_online INTEGER DEFAULT 1,
      rating REAL DEFAULT 5.0,
      phone TEXT
    );

    -- Tabela de Categorias (Tela Explorar)
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );

    -- Tabela de Experiências (Telas Explorar e Detalhes)
    CREATE TABLE IF NOT EXISTS experiences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_name TEXT NOT NULL,
      title TEXT NOT NULL,
      slug TEXT NOT NULL,
      description TEXT NOT NULL,
      location TEXT NOT NULL,
      meeting_point TEXT NOT NULL,
      duration TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      price REAL NOT NULL,
      price_label TEXT NOT NULL,
      rating REAL DEFAULT 5.0,
      reviews_count INTEGER DEFAULT 0,
      image_key TEXT NOT NULL,
      guide_id INTEGER REFERENCES guides(id),
      inclusions TEXT NOT NULL,
      is_featured INTEGER DEFAULT 1
    );

    -- Tabela de Favoritos (Tela Explorar)
    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      experience_id INTEGER NOT NULL REFERENCES experiences(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, experience_id)
    );

    -- Tabela de Reservas (Telas Checkout e Minhas Reservas)
    CREATE TABLE IF NOT EXISTS reservations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reservation_code TEXT NOT NULL UNIQUE,
      user_id INTEGER NOT NULL REFERENCES users(id),
      experience_id INTEGER NOT NULL REFERENCES experiences(id),
      guide_id INTEGER REFERENCES guides(id),
      title TEXT NOT NULL,
      schedule_text TEXT NOT NULL,
      date_label TEXT NOT NULL,
      participants INTEGER DEFAULT 1,
      subtotal REAL NOT NULL,
      discount REAL DEFAULT 0,
      total REAL NOT NULL,
      payment_method TEXT NOT NULL, -- 'pix' ou 'credit'
      status TEXT NOT NULL, -- 'proximas', 'concluidas' ou 'canceladas'
      qr_code_data TEXT NOT NULL,
      voucher_instructions TEXT,
      cancellation_reason TEXT,
      refund_status TEXT,
      refund_amount REAL,
      cancelled_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Tabela de Mensagens do Chat com o Guia (Tela Chat)
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      guide_id INTEGER NOT NULL REFERENCES guides(id),
      sender_type TEXT NOT NULL, -- 'guide' ou 'user'
      text TEXT NOT NULL,
      time TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Tabela de Avaliações (Tela Avaliar)
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reservation_id INTEGER REFERENCES reservations(id),
      experience_id INTEGER NOT NULL REFERENCES experiences(id),
      user_id INTEGER NOT NULL REFERENCES users(id),
      guide_id INTEGER REFERENCES guides(id),
      rating INTEGER NOT NULL,
      rating_label TEXT NOT NULL,
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Migrações seguras para tabelas existentes
  try { db.exec("ALTER TABLE users ADD COLUMN cpf TEXT DEFAULT '123.456.789-00'"); } catch (e) {}
  try { db.exec("ALTER TABLE users ADD COLUMN nationality TEXT DEFAULT 'Brasileira'"); } catch (e) {}
  try { db.exec("ALTER TABLE users ADD COLUMN phone TEXT DEFAULT '(88) 99876-5432'"); } catch (e) {}
  try { db.exec("ALTER TABLE reservations ADD COLUMN cancellation_reason TEXT"); } catch (e) {}
  try { db.exec("ALTER TABLE reservations ADD COLUMN refund_status TEXT"); } catch (e) {}
  try { db.exec("ALTER TABLE reservations ADD COLUMN refund_amount REAL"); } catch (e) {}
  try { db.exec("ALTER TABLE reservations ADD COLUMN cancelled_at DATETIME"); } catch (e) {}

  seedInitialData();
  ensureFullCategoriesAndExperiences();
}

function ensureFullCategoriesAndExperiences() {
  // Garante que todas as categorias solicitadas existam no banco
  const requiredCategories = [
    'Todos',
    'Aventuras',
    'Trilhas',
    'Hospedagens',
    'Restaurantes',
    'Comidas',
    'Lazeres',
    'Aventura',
    'Chalés'
  ];

  const insertCat = db.prepare('INSERT OR IGNORE INTO categories (name) VALUES (?)');
  for (const cat of requiredCategories) {
    insertCat.run(cat);
  }

  // Atualiza dados padrão do usuário 1 caso colunas novas estejam vazias
  try {
    db.prepare(`
      UPDATE users 
      SET 
        name = CASE WHEN name IS NULL OR name = '' THEN 'Maria Silva' ELSE name END,
        cpf = CASE WHEN cpf IS NULL OR cpf = '' THEN '123.456.789-00' ELSE cpf END,
        nationality = CASE WHEN nationality IS NULL OR nationality = '' THEN 'Brasileira' ELSE nationality END,
        phone = CASE WHEN phone IS NULL OR phone = '' THEN '(88) 99876-5432' ELSE phone END
      WHERE id = 1
    `).run();
  } catch (err) {}

  // Experiências adicionais para cobrir todas as categorias do filtro
  const extraExperiences = [
    {
      id: 4,
      category_name: 'Aventuras',
      title: 'Rapel & Escalada nos Monólitos',
      slug: 'rapel',
      description: 'Experiência eletrizante de rapel e escalada assistida nos paredões rochosos mais emblemáticos de Quixadá.',
      location: 'Monólito da Barriguda, Quixadá - CE',
      meeting_point: 'Ponto de Apoio dos Escaladores',
      duration: '2h30',
      difficulty: 'Aventura moderada',
      price: 150.0,
      price_label: 'R$ 150',
      rating: 4.9,
      reviews_count: 53,
      image_key: 'voo',
      guide_id: 2,
      inclusions: JSON.stringify(['Equipamento certificado UIAA', 'Instrutor credenciado', 'Fotos de ação']),
      is_featured: 1
    },
    {
      id: 5,
      category_name: 'Trilhas',
      title: 'Trilha Pedra do Racha ao Pôr do Sol',
      slug: 'trilha-racha',
      description: 'Contemple a vista 360 graus mais impressionante do sertão central durante o pôr do sol alaranjado.',
      location: 'Pedra do Racha, Quixadá - CE',
      meeting_point: 'Entrada da Fazenda Magé',
      duration: '2h',
      difficulty: 'Nível leve a moderado',
      price: 65.0,
      price_label: 'R$ 65',
      rating: 4.8,
      reviews_count: 78,
      image_key: 'trilha',
      guide_id: 1,
      inclusions: JSON.stringify(['Guia credenciado', 'Lanterna para descida', 'Seguro']),
      is_featured: 1
    },
    {
      id: 6,
      category_name: 'Hospedagens',
      title: 'Pousada Pedra dos Ventos',
      slug: 'pedra-ventos',
      description: 'Hospedagem rústica de alto padrão localizada no topo da serra, com clima ameno e café sertanejo colonial.',
      location: 'Serra da Pedra dos Ventos, Quixadá - CE',
      meeting_point: 'Recepção Principal da Pousada',
      duration: 'Diária',
      difficulty: 'Hospedagem',
      price: 250.0,
      price_label: 'R$ 250 /noite',
      rating: 5.0,
      reviews_count: 110,
      image_key: 'chale',
      guide_id: 3,
      inclusions: JSON.stringify(['Café colonial incluso', 'Piscina de borda infinita', 'Wi-Fi de fibra']),
      is_featured: 1
    },
    {
      id: 7,
      category_name: 'Restaurantes',
      title: 'Restaurante Sabor do Sertão Quixadaense',
      slug: 'sabor-sertao',
      description: 'Almoço tradicional com a legítima carne de sol de Quixadá feita na brasa, pirão de queijo e paçoca sertaneja.',
      location: 'Açude do Cedro, Quixadá - CE',
      meeting_point: 'Restaurante Sabor do Sertão',
      duration: 'Livre',
      difficulty: 'Gastronomia',
      price: 75.0,
      price_label: 'R$ 75 /pessoa',
      rating: 4.9,
      reviews_count: 142,
      image_key: 'chale',
      guide_id: 3,
      inclusions: JSON.stringify(['Buffet sertanejo completo', 'Sobremesa de doce de leite', 'Música ao vivo']),
      is_featured: 1
    },
    {
      id: 8,
      category_name: 'Restaurantes',
      title: 'Bistrô Rural Monólito Dourado',
      slug: 'monolito-dourado',
      description: 'Experiência gastronômica intimista ao ar livre com pratos contemporâneos valorizando insumos locais da caatinga.',
      location: 'Estrada do Cedro, Quixadá - CE',
      meeting_point: 'Bistrô Rural',
      duration: '2h',
      difficulty: 'Gastronomia',
      price: 95.0,
      price_label: 'R$ 95 /pessoa',
      rating: 4.7,
      reviews_count: 45,
      image_key: 'chale',
      guide_id: 1,
      inclusions: JSON.stringify(['Menu em 3 etapas', 'Suco de frutas típicas', 'Ambiente climatizado']),
      is_featured: 1
    },
    {
      id: 9,
      category_name: 'Comidas',
      title: 'Café Colonial Sertanejo & Queijo Coalho',
      slug: 'cafe-colonial',
      description: 'Visita guiada a fazenda produtora com degustação de queijo coalho artesanal assado na hora, tapiocas e cuscuz.',
      location: 'Fazenda Três Irmãos, Quixadá - CE',
      meeting_point: 'Sede da Fazenda',
      duration: '1h30',
      difficulty: 'Degustação',
      price: 45.0,
      price_label: 'R$ 45',
      rating: 4.9,
      reviews_count: 89,
      image_key: 'chale',
      guide_id: 3,
      inclusions: JSON.stringify(['Degustação livre de queijos', 'Café coado no pano', 'Doces artesanais']),
      is_featured: 1
    },
    {
      id: 10,
      category_name: 'Comidas',
      title: 'Degustação de Carnes Nobres da Caatinga',
      slug: 'carnes-caatinga',
      description: 'Uma imersão gastronômica pelas tradições de cura da carne de sol e defumados do sertão cearense.',
      location: 'Mercado Público de Quixadá - CE',
      meeting_point: 'Box dos Mestres Queijeiros',
      duration: '1h',
      difficulty: 'Gastronomia',
      price: 55.0,
      price_label: 'R$ 55',
      rating: 4.8,
      reviews_count: 67,
      image_key: 'trilha',
      guide_id: 1,
      inclusions: JSON.stringify(['Porções degustação', 'Harmonização com sucos regionais']),
      is_featured: 1
    },
    {
      id: 11,
      category_name: 'Lazeres',
      title: 'Passeio Histórico no Açude do Cedro & Museu',
      slug: 'acude-cedro-historico',
      description: 'Tour histórico com condutor pelo primeiro grande açude do Brasil, tombado pelo IPHAN, apreciando a arquitetura centenária em pedra.',
      location: 'Monumento Açude do Cedro, Quixadá - CE',
      meeting_point: 'Arco Histórico do Cedro',
      duration: '1h30',
      difficulty: 'Cultura e Lazer',
      price: 35.0,
      price_label: 'R$ 35',
      rating: 4.9,
      reviews_count: 115,
      image_key: 'trilha',
      guide_id: 1,
      inclusions: JSON.stringify(['Entrada histórica', 'Guia historiador credenciado', 'Água mineral']),
      is_featured: 1
    },
    {
      id: 12,
      category_name: 'Lazeres',
      title: 'Passeio de Caiaque e Banho no Lago dos Monólitos',
      slug: 'caiaque-lago',
      description: 'Tarde relaxante remando em águas calmas com vista para os monólitos, área de banho segura e redes para descanso.',
      location: 'Lagoa dos Monólitos, Quixadá - CE',
      meeting_point: 'Deck das Canoas',
      duration: '2h',
      difficulty: 'Lazer leve',
      price: 50.0,
      price_label: 'R$ 50',
      rating: 4.8,
      reviews_count: 73,
      image_key: 'voo',
      guide_id: 2,
      inclusions: JSON.stringify(['Colete salva-vidas', 'Caiaque duplo ou simples', 'Acesso à área vip de descanso']),
      is_featured: 1
    }
  ];

  const insertExp = db.prepare(`
    INSERT OR REPLACE INTO experiences (
      id, category_name, title, slug, description, location, meeting_point,
      duration, difficulty, price, price_label, rating, reviews_count,
      image_key, guide_id, inclusions, is_featured
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const exp of extraExperiences) {
    insertExp.run(
      exp.id,
      exp.category_name,
      exp.title,
      exp.slug,
      exp.description,
      exp.location,
      exp.meeting_point,
      exp.duration,
      exp.difficulty,
      exp.price,
      exp.price_label,
      exp.rating,
      exp.reviews_count,
      exp.image_key,
      exp.guide_id,
      exp.inclusions,
      exp.is_featured
    );
  }
}

function seedInitialData() {
  const usersCount = (db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }).count;
  if (usersCount === 0) {
    // 1. Usuário padrão para o app
    db.prepare(`
      INSERT INTO users (id, name, email, password)
      VALUES (1, 'Maria', 'seu@email.com', '123456')
    `).run();

    // 2. Guias
    const insertGuide = db.prepare(`
      INSERT INTO guides (id, name, role, cadastur, is_online, rating, phone)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    insertGuide.run(1, 'Guia Zé', 'Guia Local Credenciado', 'Cadastur 06.012345.96-7', 1, 4.9, '(88) 99876-5432');
    insertGuide.run(2, 'Chico Asas', 'Instrutor Chico Asas', 'Cadastur 06.098765.12-3', 1, 5.0, '(88) 99765-4321');
    insertGuide.run(3, 'Clenilda Rocha', 'Guia Clenilda Rocha', 'Cadastur 06.054321.45-8', 0, 4.8, '(88) 99654-3210');

    // 3. Categorias
    const insertCat = db.prepare('INSERT INTO categories (name) VALUES (?)');
    insertCat.run('Todos');
    insertCat.run('Trilhas');
    insertCat.run('Aventura');
    insertCat.run('Chalés');

    // 4. Experiências
    const insertExp = db.prepare(`
      INSERT INTO experiences (
        id, category_name, title, slug, description, location, meeting_point,
        duration, difficulty, price, price_label, rating, reviews_count,
        image_key, guide_id, inclusions, is_featured
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertExp.run(
      1,
      'Trilhas',
      'Trilha Galinha Choca & Açude do Cedro',
      'trilha',
      'A Trilha da Galinha Choca oferece uma imersão única no coração do Sertão dos Monólitos. Caminhe em meio à caatinga preservada, aprecie a fascinante formação rochosa da Galinha Choca e conclua a jornada contemplando o histórico Açude do Cedro.',
      'Sertão dos Monólitos, Quixadá - CE',
      'Cancela Monumental Cedro',
      '3h30',
      'Nível moderado',
      80.0,
      'R$ 80',
      4.9,
      128,
      'trilha',
      1,
      JSON.stringify(['Água mineral', 'Seguro aventura', 'Condutor local']),
      1
    );

    insertExp.run(
      2,
      'Aventura',
      'Voo Duplo de Parapente',
      'voo',
      'Sobrevoe as incríveis formações rochosas e monólitos de Quixadá em um emocionante voo duplo de parapente partindo da famosa Serra do Urucum.',
      'Serra do Urucum, Quixadá - CE',
      'Rampa de Decolagem Urucum',
      '1h',
      'Voo panorâmico',
      280.0,
      'R$ 280',
      5.0,
      94,
      'voo',
      2,
      JSON.stringify(['Equipamento de segurança completo', 'Instrutor homologado', 'Fotos e vídeos em HD', 'Seguro aventura']),
      1
    );

    insertExp.run(
      3,
      'Chalés',
      'Chalé Vista dos Monólitos',
      'chale',
      'Desfrute de uma hospedagem rústica e charmosa com vista privilegiada para os monólitos de Quixadá. Inclui café da manhã sertanejo completo.',
      'Vale dos Monólitos, Quixadá - CE',
      'Recepção Fazenda Monólitos',
      'Diária',
      'Café incluso',
      220.0,
      'R$ 220 /noite',
      4.8,
      62,
      'chale',
      3,
      JSON.stringify(['Diária com café incluso', 'Wi-Fi e ar condicionado', 'Piscina com vista panorâmica']),
      1
    );

    // 5. Reservas iniciais (Próximas e Concluídas)
    const insertRes = db.prepare(`
      INSERT INTO reservations (
        id, reservation_code, user_id, experience_id, guide_id, title,
        schedule_text, date_label, participants, subtotal, discount, total,
        payment_method, status, qr_code_data, voucher_instructions
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertRes.run(
      1,
      '#QX-4892',
      1,
      1,
      1,
      'Trilha Galinha Choca & Açude do Cedro',
      'Amanhã, 05:30',
      'Amanhã, 05:30',
      1,
      80.0,
      4.0,
      76.0,
      'pix',
      'proximas',
      'QUIXATOUR-QX-4892-VAL-2026',
      'Apresente este código ao Guia Zé na saída da trilha.'
    );

    insertRes.run(
      2,
      '#QX-5104',
      1,
      2,
      2,
      'Voo Livre na Serra do Urucum',
      'SÁB, 24 DE OUTUBRO • 14:00',
      'SÁB, 24 DE OUTUBRO • 14:00',
      1,
      380.0,
      0.0,
      380.0,
      'credit',
      'proximas',
      'QUIXATOUR-QX-5104-VAL-2026',
      'Apresente este código ao Instrutor Chico Asas na rampa de decolagem.'
    );

    insertRes.run(
      3,
      '#QX-3901',
      1,
      3,
      3,
      'Chalé Vista dos Monólitos ao Pôr do Sol',
      '02 Out 2024',
      '02 Out 2024',
      2,
      140.0,
      0.0,
      140.0,
      'credit',
      'concluidas',
      'QUIXATOUR-QX-3901-VAL-2024',
      'Reserva concluída.'
    );

    // 6. Mensagens iniciais do Chat
    const insertMsg = db.prepare(`
      INSERT INTO messages (id, user_id, guide_id, sender_type, text, time, is_read)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    insertMsg.run(
      1,
      1,
      1,
      'guide',
      'Olá! Tudo pronto para amanhã? A trilha começa cedo, por isso recomendo dormir bem hoje! 🌄',
      '08:12',
      1
    );
    insertMsg.run(
      2,
      1,
      1,
      'guide',
      'Não esqueça de trazer água (pelo menos 1,5L), protetor solar, repelente e calçado fechado. Nos encontramos no ponto de partida às 05:30 na Cancela Monumental. 🥾',
      '08:14',
      1
    );
    insertMsg.run(
      3,
      1,
      1,
      'user',
      'Perfeito, Zé! Já estou preparando a mochila. Tenho alguma dúvida sobre o nível de dificuldade — é muito puxado?',
      '08:35',
      1
    );

    // 7. Avaliações
    db.prepare(`
      INSERT INTO reviews (reservation_id, experience_id, user_id, guide_id, rating, rating_label, comment)
      VALUES (3, 3, 1, 3, 5, 'Excelente! Experiência inesquecível ✨', 'O chalé é maravilhoso, vista espetacular para os monólitos e o atendimento foi nota 10!')
    `).run();
  }
}
