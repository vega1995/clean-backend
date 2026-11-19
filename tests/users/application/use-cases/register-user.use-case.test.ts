import { describe, expect, test, vi } from 'vitest';
import { ConflictError, ValidationError } from '../../../../src/shared/domain/errors/domain.errors.ts';
import { RegisterUserUseCase } from '../../../../src/users/application/use-cases/register-user.use-case.ts';
import { User } from '../../../../src/users/domain/entities/user.entity.ts';
import type { UserRepository } from '../../../../src/users/domain/repositories/user.repository.ts';
import { FindUserUseCase } from '../../../../src/users/application/use-cases/find-user.use-case.ts';
import { InMemoryUserRepository } from '../../../../src/users/infrastructure/repositories/in-memory.user-repository.ts';

function createRepository() {
  return {
    findByEmail: vi.fn<UserRepository['findByEmail']>().mockResolvedValue(undefined),
    save: vi.fn<UserRepository['save']>().mockResolvedValue(undefined),
  } satisfies UserRepository;
}

describe('RegisterUserUseCase', () => {
  test('registra y devuelve el usuario guardado con sus datos normalizados', async () => {
    const repository = createRepository();
    const useCase = new RegisterUserUseCase(repository);

    const user = await useCase.execute({ name: '  Ana  ', email: '  ANA@example.coM  ' });

    expect(user).toBeInstanceOf(User);
    expect(user.name).toBe('Ana');
    expect(user.email).toBe('ana@example.com');
    expect(repository.findByEmail).toHaveBeenCalledExactlyOnceWith('ana@example.com');
    expect(repository.save).toHaveBeenCalledExactlyOnceWith(user);
  });

  test('conserva el UUID al registrar y consultar el usuario', async () => {
    const repository = new InMemoryUserRepository();
    const registered = await new RegisterUserUseCase(repository).execute({
      name: 'Ana', email: 'ana@example.com',
    });
    const found = await new FindUserUseCase(repository).execute(' ANA@example.com ');

    expect(registered.id).toEqual(expect.any(String));
    expect(found.id).toBe(registered.id);
    expect(found).toBe(registered);
  });

  test('rechaza un email duplicado normalizado sin guardar otro usuario', async () => {
    const repository = createRepository();
    repository.findByEmail.mockResolvedValue(User.create({ name: 'Ana', email: 'ana@example.com' }));
    const useCase = new RegisterUserUseCase(repository);

    await expect(useCase.execute({ name: 'Otra persona', email: '  ANA@example.com  ' })).rejects.toThrow(
      new ConflictError('El email ya está registrado')
    );

    expect(repository.findByEmail).toHaveBeenCalledExactlyOnceWith('ana@example.com');
    expect(repository.save).not.toHaveBeenCalled();
  });

  test.each([
    ['   ', 'ana@example.com'],
    ['Ana', '   '],
    ['Ana', 'ana.example.com'],
  ])('rechaza datos inválidos (%j, %j) sin consultar ni guardar', async (name, email) => {
    const repository = createRepository();
    const useCase = new RegisterUserUseCase(repository);

    await expect(useCase.execute({ name, email })).rejects.toThrow(ValidationError);

    expect(repository.findByEmail).not.toHaveBeenCalled();
    expect(repository.save).not.toHaveBeenCalled();
  });

  test('propaga el error de búsqueda sin intentar guardar', async () => {
    const repository = createRepository();
    const error = new Error('No se pudo consultar el repositorio');
    repository.findByEmail.mockRejectedValue(error);
    const useCase = new RegisterUserUseCase(repository);

    await expect(useCase.execute({ name: 'Ana', email: 'ana@example.com' })).rejects.toBe(error);

    expect(repository.save).not.toHaveBeenCalled();
  });

  test('propaga el error de guardado', async () => {
    const repository = createRepository();
    const error = new Error('No se pudo guardar el usuario');
    repository.save.mockRejectedValue(error);
    const useCase = new RegisterUserUseCase(repository);

    await expect(useCase.execute({ name: 'Ana', email: 'ana@example.com' })).rejects.toBe(error);

    expect(repository.save).toHaveBeenCalledTimes(1);
  });
});
