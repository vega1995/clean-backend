// Entidad de dominio que representa a un usuario en el sistema. Esta clase es inmutable y encapsula la lógica de validación para la creación de usuarios.
// Se asegura de que el nombre y el correo electrónico sean válidos antes de permitir la creación de una instancia de User.

//El constructor privado dirige la creación a Create en TypeScript, lo que permite controlar la validación y garantizar que los objetos User sean siempre válidos.
//readonly protege en Typescrriot; Object.freeze() asegura que la instancia no pueda ser modificada después de su creación, manteniendo la inmutabilidad de la entidad.

import { ValidationError } from '../../../shared/domain/errors/domain.errors.ts';

export class User{
    readonly name: string;
    readonly email:string;
    private constructor(name: string, email: string){
        this.name = name;
        this.email = email;
        Object.freeze(this);
    }

    static create(name: string, email: string): User{
      const cleanName = name.trim();
      const cleanEmail = email.trim().toLowerCase();
      if(!cleanName || !cleanEmail){
        throw new ValidationError('Nombre y correo electrónico son obligatorios');
      }
      if(!cleanEmail.includes('@') ){
        throw new ValidationError('Correo electrónico inválido');
      }
      
      return new User(cleanName, cleanEmail);
    }

}

