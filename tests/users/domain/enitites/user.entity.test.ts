
import { describe, expect, test } from 'vitest'
import { User } from '../../../../src/users/domain/entities/user.entity.ts';
import { ValidationError } from '../../../../src/shared/domain/errors/domain.errors.ts';

describe('User Entity', () => {
  test('crea un usuario y normaliza su nombre y email', () => {
    const user = User.create({ name: '     Ana López     ', email: '    ANA@example.coM   ' });

    expect(user).toBeInstanceOf(User);
    expect(user.name).toBe('Ana López');
    expect(user.email).toBe('ana@example.com');
  });

  test('genera un UUID v4 diferente para cada usuario', () => {
    const input = { name: 'Ana', email: 'ana@example.com' };
    const first = User.create(input);
    const second = User.create(input);
    const uuidV4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

    expect(first.id).toMatch(uuidV4);
    expect(second.id).toMatch(uuidV4);
    expect(first.id).not.toBe(second.id);
  });

  test.each(['', '   ', '\t\n'])('rechaza el nombre vacío %j', (name) => {
    expect(() => User.create({ name, email: 'ana@example.com' })).toThrow(
      new ValidationError('Nombre y correo electrónico son obligatorios')
    );
  });

  test.each(['', '   ', 'ana.example.com'])(
    'rechaza el email sin @ %j',
    (email) => {
      expect(() => User.create({ name: 'Ana', email })).toThrow(
        new ValidationError(email.trim() ? 'Correo electrónico inválido' : 'Nombre y correo electrónico son obligatorios')
      );
    }
  );

  test('acepta un email con @ según la regla actual de dominio', () => {
    const user = User.create({ name: 'Ana', email: 'A@B' });
    expect(user.email).toBe('a@b');
  });

  test('impide modificar sus datos en ejecución', () => {
    const user = User.create({ name: 'Ana', email: 'ana@example.com' });
    const originalId = user.id;

    expect(Reflect.set(user, 'id', 'otro-id')).toBe(false);
    expect(Reflect.set(user, 'name', 'Pedro')).toBe(false);
    expect(Reflect.set(user, 'email', 'otro@example.com')).toBe(false);
    expect(user.name).toBe('Ana');
    expect(user.email).toBe('ana@example.com');
    expect(user.id).toBe(originalId);
  });
});
