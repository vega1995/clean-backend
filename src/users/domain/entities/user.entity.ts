// Entidad de dominio que representa a un usuario en el sistema. Esta clase es inmutable y encapsula la lógica de validación para la creación de usuarios.
// Se asegura de que el nombre y el correo electrónico sean válidos antes de permitir la creación de una instancia de User.

//El constructor privado dirige la creación a Create en TypeScript, lo que permite controlar la validación y garantizar que los objetos User sean siempre válidos.
//readonly protege en Typescrriot; Object.freeze() asegura que la instancia no pueda ser modificada después de su creación, manteniendo la inmutabilidad de la entidad.

import { ValidationError } from '../../../shared/domain/errors/domain.errors.ts';

const userRoles = ['admin', 'user', 'sales'] as const;

 export type UserRoles = (typeof userRoles)[number];


 export interface CreateUserData{
    name: string;
    email: string;
    role?: UserRoles;
 }

export class User{

    readonly id: string;
    readonly name: string;
    readonly email:string;
    readonly role: UserRoles ;
    private constructor( user:{   name: string, email: string, role: UserRoles}){
       const {name, email, role} = user;
        this.id = globalThis.crypto.randomUUID();
        this.name = name;
        this.email = email;
        this.role = role;
        Object.freeze(this);
    }

    static create(input:CreateUserData): User{
      const cleanName = input.name.trim();
      const cleanEmail = input.email.trim().toLowerCase();
      const role = input.role || 'user';
      if(!cleanName || !cleanEmail){
        throw new ValidationError('Nombre y correo electrónico son obligatorios');
      }
      if(!cleanEmail.includes('@') ){
        throw new ValidationError('Correo electrónico inválido');
      }

      if(!userRoles.includes(role)){
        throw new ValidationError(`Rol inválido. Los roles válidos son: ${userRoles.join(', ')}`);
      }
      
      return new User({name: cleanName, email: cleanEmail, role});
    }

    static normalizeEmail = (email: string): string => email.trim().toLowerCase();

}

