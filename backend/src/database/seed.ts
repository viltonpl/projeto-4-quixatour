import { db, initDatabase } from './db';

console.log('🔄 Executando seed do banco de dados QuixaTour...');
initDatabase();
console.log('✅ Banco de dados SQLite populado com sucesso em:', db.name);
process.exit(0);
