import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import Database from 'better-sqlite3';
import { createApp } from './app.composition.ts';
import { SqlitePaymentRepository } from './payments/infrastructure/repositories/sqlite.payment-repository.ts';
import { SqliteProductRepository } from './products/infrastructure/repositories/sqlite.product-repository.ts';
import { SqliteUserRepository } from './users/infrastructure/repositories/sqlite.user-repository.ts';

const port = Number(process.env.PORT ?? 3000);
let database: Database.Database | undefined;

function closeDatabase() {
  if (database?.open) {
    database.close();
  }
}

function handleStartupError(error: unknown) {
  closeDatabase();
  console.error('No se pudo iniciar la API:', error instanceof Error ? error.message : error);
  process.exitCode = 1;
}

try {
  const dataDirectory = join(import.meta.dirname, '..', 'data');
  mkdirSync(dataDirectory, { recursive: true });
  database = new Database(join(dataDirectory, 'clean-databae.sqlite'));
  const userRepository = new SqliteUserRepository(database);
  const productRepository = new SqliteProductRepository(database);
  const paymentRepository = new SqlitePaymentRepository(database);
  const server = createApp({userRepository,  productRepository, paymentRepository }).listen(port);
  server.once('listening', () => {
    console.log(`Servidor escuchando en el puerto ${port}`);
  });

  server.once('close', closeDatabase);
  server.on('error', handleStartupError);
} catch (error) {
  handleStartupError(error);
}
