// Entidad de dominio que representa a un usuario en el sistema. Esta clase es inmutable y encapsula la lógica de validación para la creación de usuarios.
// Se asegura de que el nombre y el correo electrónico sean válidos antes de permitir la creación de una instancia de User.

import { ValidationError } from '../../../shared/domain/errors/domain.errors.ts';

const userRoles = ['admin', 'user', 'sales'] as const;

export type UserRoles = (typeof userRoles)[number];

export interface CreateUserData {
  name: string;
  email: string;
  role?: UserRoles;
}

export interface RestoreUserData extends Required<CreateUserData> {
  id: string;
}

export class User {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: UserRoles;

  private constructor({ id, name, email, role }: RestoreUserData) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.role = role;
    Object.freeze(this);
  }

  static create(input: CreateUserData): User {
    const data = User.validate(input.name, input.email, input.role || 'user');
    return new User({ id: globalThis.crypto.randomUUID(), ...data });
  }

  static restore({ id, name, email, role }: RestoreUserData): User {
    return new User({ id, ...User.validate(name, email, role) });
  }

  static normalizeEmail = (email: string): string => email.trim().toLowerCase();

  private static validate(name: string, email: string, role: UserRoles) {
    const cleanName = name.trim();
    const cleanEmail = User.normalizeEmail(email);
    if (!cleanName || !cleanEmail) {
      throw new ValidationError('Nombre y correo electrónico son obligatorios');
    }
    if (!cleanEmail.includes('@')) {
      throw new ValidationError('Correo electrónico inválido');
    }
    if (!userRoles.includes(role)) {
      throw new ValidationError(`Rol inválido. Los roles válidos son: ${userRoles.join(', ')}`);
    }

    return { name: cleanName, email: cleanEmail, role };
  }
}

