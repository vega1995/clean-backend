import { once } from 'node:events';
import { mkdtemp, rm, rmdir } from 'node:fs/promises';
import type { AddressInfo } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import Database from 'better-sqlite3';
import { expect, test } from 'vitest';
import { createApp } from '../../../src/app.composition.ts';
import { SqlitePaymentRepository } from '../../../src/payments/infrastructure/repositories/sqlite.payment-repository.ts';
import { SqliteProductRepository } from '../../../src/products/infrastructure/repositories/sqlite.product-repository.ts';
import { SqliteUserRepository } from '../../../src/users/infrastructure/repositories/sqlite.user-repository.ts';

async function withSqliteApi(databasePath: string, run: (baseUrl: string) => Promise<void>) {
  const database = new Database(databasePath);
  try {
    const server = createApp(new SqliteUserRepository(database), {
      productRepository: new SqliteProductRepository(database),
      paymentRepository: new SqlitePaymentRepository(database),
    }).listen(0, '127.0.0.1');
    try {
      await once(server, 'listening');
      const { port } = server.address() as AddressInfo;
      await run(`http://127.0.0.1:${port}`);
    } finally {
      if (server.listening) {
        await new Promise<void>((resolve, reject) => {
          server.close((error) => error ? reject(error) : resolve());
          server.closeAllConnections();
        });
      }
    }
  } finally {
    database.close();
  }
}

function post(url: string, body: unknown) {
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

test('conserva usuarios, productos y pagos después de reabrir la misma base SQLite', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'clean-backend-sqlite-'));
  const databasePath = join(directory, 'api.sqlite');
  const userInput = { name: 'Ana', email: ' ANA@example.com ' };
  const productInput = {
    name: 'Café', cost: 25.5, price: 35.75, stock: 10,
    description: 'Café molido', category: 'Alimentos', images: ['/café.png'],
  };
  const paymentInput = { reference: 'REF-1', amount: 35.75, customerId: 'customer-1' };
  const expectedReads = new Map<string, unknown>();

  try {
    await withSqliteApi(databasePath, async (baseUrl) => {
      const response = await post(`${baseUrl}/users`, userInput);
      expect(response.status).toBe(201);
      const registeredUser = await response.json();
      expect(registeredUser).toEqual({
        id: expect.any(String), name: 'Ana', email: 'ana@example.com', role: 'user',
      });
      expectedReads.set('/users/ANA%40example.com', registeredUser);

      const productResponse = await post(`${baseUrl}/products`, productInput);
      expect(productResponse.status).toBe(201);
      const product = await productResponse.json();
      expect(product).toEqual({ ...productInput, id: expect.any(String) });
      expectedReads.set(`/products/${product.id}`, product);
      expectedReads.set('/products', [product]);

      const paymentResponse = await post(`${baseUrl}/payments`, paymentInput);
      expect(paymentResponse.status).toBe(201);
      const payment = await paymentResponse.json();
      expect(payment).toEqual({
        ...paymentInput, id: expect.any(String), status: 'pending',
        createdAt: expect.any(String), updatedAt: expect.any(String),
      });
      expectedReads.set(`/payments/${payment.id}`, payment);
      expectedReads.set('/payments/reference/REF-1', payment);
      expectedReads.set('/payments', [payment]);
    });

    await withSqliteApi(databasePath, async (baseUrl) => {
      for (const [path, expected] of expectedReads) {
        const found = await fetch(baseUrl + path);
        expect(found.status).toBe(200);
        expect(await found.json()).toEqual(expected);
      }

      const duplicatePayment = await post(`${baseUrl}/payments`, paymentInput);
      expect(duplicatePayment.status).toBe(409);
      expect(await duplicatePayment.json()).toEqual({ error: 'La referencia del pago ya está registrada' });

      const duplicate = await post(`${baseUrl}/users`, userInput);
      expect(duplicate.status).toBe(409);
      expect(await duplicate.json()).toEqual({ error: 'El email ya está registrado' });

      const missing = await fetch(`${baseUrl}/users/otro%40example.com`);
      expect(missing.status).toBe(404);
      expect(await missing.json()).toEqual({ error: 'Usuario no encontrado' });
    });
  } finally {
    await rm(databasePath, { force: true });
    await rmdir(directory);
  }
});
