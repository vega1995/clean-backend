import { once } from 'node:events';
import { mkdtemp, rm, rmdir } from 'node:fs/promises';
import type { AddressInfo } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import Database from 'better-sqlite3';
import { expect, test } from 'vitest';
import { createApp } from '../../../src/app.composition.ts';
import { SqliteUserRepository } from '../../../src/users/infrastructure/repositories/sqlite.user-repository.ts';

async function withUsersApi(databasePath: string, run: (usersUrl: string) => Promise<void>) {
  const database = new Database(databasePath);
  try {
    const server = createApp(new SqliteUserRepository(database)).listen(0, '127.0.0.1');
    try {
      await once(server, 'listening');
      const { port } = server.address() as AddressInfo;
      await run(`http://127.0.0.1:${port}/users`);
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

function register(usersUrl: string) {
  return fetch(usersUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Ana', email: ' ANA@example.com ' }),
  });
}

test('conserva los usuarios después de reabrir la base SQLite', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'clean-backend-users-'));
  const databasePath = join(directory, 'users.sqlite');
  let registeredUser: unknown;

  try {
    await withUsersApi(databasePath, async (usersUrl) => {
      const response = await register(usersUrl);
      expect(response.status).toBe(201);
      registeredUser = await response.json();
      expect(registeredUser).toEqual({
        id: expect.any(String), name: 'Ana', email: 'ana@example.com', role: 'user',
      });
    });

    await withUsersApi(databasePath, async (usersUrl) => {
      const found = await fetch(`${usersUrl}/ANA%40example.com`);
      expect(found.status).toBe(200);
      expect(await found.json()).toEqual(registeredUser);

      const duplicate = await register(usersUrl);
      expect(duplicate.status).toBe(409);
      expect(await duplicate.json()).toEqual({ error: 'El email ya está registrado' });

      const missing = await fetch(`${usersUrl}/otro%40example.com`);
      expect(missing.status).toBe(404);
      expect(await missing.json()).toEqual({ error: 'Usuario no encontrado' });
    });
  } finally {
    await rm(databasePath, { force: true });
    await rmdir(directory);
  }
});
