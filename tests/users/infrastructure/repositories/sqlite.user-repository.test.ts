import Database from 'better-sqlite3';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { ConflictError } from '../../../../src/shared/domain/errors/domain.errors.ts';
import { User } from '../../../../src/users/domain/entities/user.entity.ts';
import { SqliteUserRepository } from '../../../../src/users/infrastructure/repositories/sqlite.user-repository.ts';

describe('SqliteUserRepository', () => {
  let database: Database.Database;
  let repository: SqliteUserRepository;

  beforeEach(() => {
    database = new Database(':memory:');
    repository = new SqliteUserRepository(database);
  });

  afterEach(() => {
    database.close();
  });

  test('reconstruye el usuario y busca por el email exacto', async () => {
    const user = User.create({ name: "Ana O'Connor", email: 'ana@example.com', role: 'sales' });
    expect(await repository.findByEmail(user.email)).toBeUndefined();

    await repository.save(user);

    const stored = await repository.findByEmail(user.email);
    expect(stored).toBeInstanceOf(User);
    expect(stored).toEqual(user);
    expect(Object.isFrozen(stored)).toBe(true);
    expect(await repository.findByEmail('ANA@example.com')).toBeUndefined();
    expect(await repository.findByEmail('otro@example.com')).toBeUndefined();
  });

  test('rechaza un email duplicado y conserva el usuario original', async () => {
    const original = User.create({ name: 'Ana', email: 'ana@example.com' });
    const duplicate = User.create({ name: 'Otra persona', email: original.email });
    await repository.save(original);

    await expect(repository.save(duplicate)).rejects.toThrow(new ConflictError('El usuario ya existe'));
    await expect(repository.save(original)).rejects.toBeInstanceOf(ConflictError);
    expect(await repository.findByEmail(original.email)).toEqual(original);
  });

  test('propaga otros conflictos de SQLite', async () => {
    const original = User.create({ name: 'Ana', email: 'ana@example.com' });
    const sameId = User.restore({ ...original, email: 'otra@example.com' });
    await repository.save(original);

    await expect(repository.save(sameId)).rejects.toMatchObject({ code: 'SQLITE_CONSTRAINT_PRIMARYKEY' });
    expect(await repository.findByEmail(sameId.email)).toBeUndefined();
  });
});
