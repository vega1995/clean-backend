import { describe, expect, test } from 'vitest';
import { ConflictError } from '../../../../src/shared/domain/errors/domain.errors.ts';
import { User } from '../../../../src/users/domain/entities/user.entity.ts';
import { InMemoryUserRepository } from '../../../../src/users/infrastructure/repositories/in-memory.user-repository.ts';

describe('InMemoryUserRepository', () => {
  test('busca usuarios guardados por email', async () => {
    const repository = new InMemoryUserRepository();
    const user = User.create('Ana', 'ana@example.com');

    expect(await repository.findByEmail(user.email)).toBeUndefined();

    await repository.save(user);

    expect(await repository.findByEmail(user.email)).toBe(user);
    expect(await repository.findByEmail('otro@example.com')).toBeUndefined();
  });

  test('rechaza un email duplicado y conserva el usuario original', async () => {
    const repository = new InMemoryUserRepository();
    const original = User.create('Ana', 'ana@example.com');
    const duplicate = User.create('Otra persona', 'ana@example.com');
    await repository.save(original);

    await expect(repository.save(duplicate)).rejects.toThrow(ConflictError);
    expect(await repository.findByEmail(original.email)).toBe(original);
  });
});
