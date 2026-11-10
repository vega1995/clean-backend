import { describe, expect, test, vi } from 'vitest';
import { ConflictError, ValidationError } from '../../../../src/shared/domain/errors/domain.errors.ts';
import { RegisterUserUseCase } from '../../../../src/users/application/use-cases/register-user.use-case.ts';
import { User } from '../../../../src/users/domain/entities/user.entity.ts';
import type { UserRepository } from '../../../../src/users/domain/repositories/user.repository.ts';

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

    const user = await useCase.execute('  Ana  ', '  ANA@example.coM  ');

    expect(user).toBeInstanceOf(User);
    expect(user.name).toBe('Ana');
    expect(user.email).toBe('ana@example.com');
    expect(repository.findByEmail).toHaveBeenCalledExactlyOnceWith('ana@example.com');
    expect(repository.save).toHaveBeenCalledExactlyOnceWith(user);
  });

  test('rechaza un email duplicado normalizado sin guardar otro usuario', async () => {
    const repository = createRepository();
    repository.findByEmail.mockResolvedValue(User.create('Ana', 'ana@example.com'));
    const useCase = new RegisterUserUseCase(repository);

    await expect(useCase.execute('Otra persona', '  ANA@example.com  ')).rejects.toThrow(
      new ConflictError('El usuario ya existe')
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

    await expect(useCase.execute(name, email)).rejects.toThrow(ValidationError);

    expect(repository.findByEmail).not.toHaveBeenCalled();
    expect(repository.save).not.toHaveBeenCalled();
  });

  test('propaga el error de búsqueda sin intentar guardar', async () => {
    const repository = createRepository();
    const error = new Error('No se pudo consultar el repositorio');
    repository.findByEmail.mockRejectedValue(error);
    const useCase = new RegisterUserUseCase(repository);

    await expect(useCase.execute('Ana', 'ana@example.com')).rejects.toBe(error);

    expect(repository.save).not.toHaveBeenCalled();
  });

  test('propaga el error de guardado', async () => {
    const repository = createRepository();
    const error = new Error('No se pudo guardar el usuario');
    repository.save.mockRejectedValue(error);
    const useCase = new RegisterUserUseCase(repository);

    await expect(useCase.execute('Ana', 'ana@example.com')).rejects.toBe(error);

    expect(repository.save).toHaveBeenCalledTimes(1);
  });
});
