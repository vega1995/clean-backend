import { once } from 'node:events';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { createApp } from '../../../src/app.composition.ts';

const input = { reference: ' REF-1 ', amount: 25.5, customerId: ' customer-1 ' };
let server: Server;
let baseUrl: string;

beforeEach(async () => {
  server = createApp().listen(0, '127.0.0.1');
  await once(server, 'listening');
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterEach(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
    server.closeAllConnections();
  });
});

function post(body: unknown) {
  return fetch(`${baseUrl}/payments`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
}

describe('API de pagos', () => {
  test('crea y consulta por ID, referencia y listado con los siete campos', async () => {
    const created = await post(input);
    expect(created.status).toBe(201);
    const payment = await created.json();
    expect(payment).toEqual({
      id: expect.any(String), reference: 'REF-1', amount: 25.5, status: 'pending',
      customerId: 'customer-1', createdAt: expect.any(String), updatedAt: expect.any(String),
    });
    expect(new Date(payment.createdAt).toISOString()).toBe(payment.createdAt);
    expect(payment.updatedAt).toBe(payment.createdAt);

    for (const path of [`/payments/${payment.id}`, '/payments/reference/REF-1', '/payments/reference/%20REF-1%20']) {
      const response = await fetch(baseUrl + path);
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual(payment);
    }
    const secondResponse = await post({ ...input, reference: 'ref-1' });
    expect(secondResponse.status).toBe(201);
    const second = await secondResponse.json();
    const list = await fetch(`${baseUrl}/payments`);
    expect(list.status).toBe(200);
    expect(await list.json()).toEqual([payment, second]);
  });

  test('devuelve listado vacío y 404 para pagos inexistentes', async () => {
    const list = await fetch(`${baseUrl}/payments`);
    expect(list.status).toBe(200);
    expect(await list.json()).toEqual([]);
    for (const path of ['/payments/missing', '/payments/reference/missing']) {
      const response = await fetch(baseUrl + path);
      expect(response.status).toBe(404);
      expect(await response.json()).toEqual({ error: 'Pago no encontrado' });
    }
  });

  test('rechaza duplicados normalizados con 409 y conserva el pago original', async () => {
    const original = await (await post(input)).json();
    const duplicate = await post({ ...input, reference: 'REF-1', amount: 99 });
    expect(duplicate.status).toBe(409);
    expect(await duplicate.json()).toHaveProperty('error');
    const list = await fetch(`${baseUrl}/payments`);
    expect(await list.json()).toEqual([original]);
  });

  test.each([
    {}, null, [], { ...input, reference: ' ' }, { ...input, reference: 1 },
    { ...input, customerId: '' }, { ...input, customerId: null },
    { ...input, amount: 0 }, { ...input, amount: -1 }, { ...input, amount: '10' },
    { ...input, amount: null },
    ...['id', 'status', 'createdAt', 'updatedAt', 'extra'].map((field) => ({ ...input, [field]: 'value' })),
  ])('rechaza un cuerpo inválido con 400: %j', async (body) => {
    const response = await post(body);
    expect(response.status).toBe(400);
    expect(await response.json()).toHaveProperty('error');
    expect(await (await fetch(`${baseUrl}/payments`)).json()).toEqual([]);
  });

  test('rechaza búsquedas vacías con 400', async () => {
    for (const path of ['/payments/%20', '/payments/reference/%20']) {
      const response = await fetch(baseUrl + path);
      expect(response.status).toBe(400);
    }
  });

  test('rechaza contenido sin JSON, JSON inválido y cuerpos mayores de 64 KiB', async () => {
    const unsupported = await fetch(`${baseUrl}/payments`, { method: 'POST', body: 'text' });
    expect(unsupported.status).toBe(415);
    const malformed = await fetch(`${baseUrl}/payments`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{',
    });
    expect(malformed.status).toBe(400);
    const tooLarge = await post({ ...input, reference: 'a'.repeat(65536) });
    expect(tooLarge.status).toBe(413);
  });

  test.each([
    ['PUT', '/payments', 'GET, HEAD, POST'],
    ['PATCH', '/payments/id', 'GET, HEAD'],
    ['DELETE', '/payments/reference/REF-1', 'GET, HEAD'],
    ['POST', '/payments/id', 'GET, HEAD'],
  ])('rechaza %s %s con 405 y Allow', async (method, path, allow) => {
    const response = await fetch(baseUrl + path, { method });
    expect(response.status).toBe(405);
    expect(response.headers.get('Allow')).toBe(allow);
  });
});
