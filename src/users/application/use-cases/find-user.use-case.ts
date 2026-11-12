import { NotFoundError } from "../../../shared/domain/errors/domain.errors.ts";
import  { User } from "../../domain/entities/user.entity.ts";
import type { UserRepository } from "../../domain/repositories/user.repository.ts";



export class FindUserUseCase {

    userRepository: UserRepository;

    constructor(userRepository: UserRepository) {
        this.userRepository = userRepository;
    }

    async execute(email: string): Promise<User> {
        const normalizedEmail = User.normalizeEmail(email);
        const user = await this.userRepository.findByEmail(normalizedEmail);
        
        if(!user){
           throw new NotFoundError('Usuario no encontrado');
        }
        
        return user;
    }


}