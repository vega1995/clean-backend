import { once } from 'node:events';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { createApp } from '../../../src/app.composition.ts';

const input = {
  name: 'Café', cost: 25.5, price: 35.75, stock: 10,
  description: 'Café molido', category: 'Alimentos',
};
let server: Server;
let productsUrl: string;

beforeEach(async () => {
  server = createApp().listen(0, '127.0.0.1');
  await once(server, 'listening');
  const { port } = server.address() as AddressInfo;
  productsUrl = `http://127.0.0.1:${port}/products`;
});

afterEach(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
    server.closeAllConnections();
  });
});

function post(body: unknown) {
  return fetch(productsUrl, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
}

describe('API de productos', () => {
  test('registra, consulta y lista productos con los ocho campos', async () => {
    const providedImages = ['/images/coffee.png', 'https://example.com/coffee.jpg'];
    const created = await post({ ...input, images: providedImages });
    expect(created.status).toBe(201);
    const product = await created.json();
    expect(product).toEqual({ ...input, id: expect.any(String), images: providedImages });

    const found = await fetch(`${productsUrl}/${product.id}`);
    expect(found.status).toBe(200);
    expect(await found.json()).toEqual(product);

    const second = await post({ ...input, name: 'Otro café', stock: 0 });
    expect(second.status).toBe(201);
    const secondProduct = await second.json();
    expect(secondProduct.images).toEqual([]);

    const list = await fetch(productsUrl);
    expect(list.status).toBe(200);
    expect(await list.json()).toEqual([product, secondProduct]);
  });

  test('devuelve un listado vacío y 404 para un ID inexistente', async () => {
    const list = await fetch(productsUrl);
    expect(list.status).toBe(200);
    expect(await list.json()).toEqual([]);

    const missing = await fetch(`${productsUrl}/missing`);
    expect(missing.status).toBe(404);
    expect(await missing.json()).toEqual({ error: 'Producto no encontrado' });
  });

  test.each([
    { ...input, id: 'given-id' },
    { ...input, nombre: 'Café' },
    { ...input, category: ' ' },
    { ...input, cost: '25.5' },
    { ...input, price: -1 },
    { ...input, stock: 0.5 },
    { ...input, images: 'coffee.png' },
    { ...input, images: [42] },
  ])('rechaza datos inválidos con 400: %j', async (body) => {
    const response = await post(body);
    expect(response.status).toBe(400);
    expect(await response.json()).toHaveProperty('error');
    expect(await (await fetch(productsUrl)).json()).toEqual([]);
  });

  test('rechaza registros sin Content-Type JSON', async () => {
    const response = await fetch(productsUrl, { method: 'POST', body: 'text' });
    expect(response.status).toBe(415);
  });
});
