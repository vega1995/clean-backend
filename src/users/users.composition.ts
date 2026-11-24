import { FindUserUseCase } from './application/use-cases/find-user.use-case.ts';
import { RegisterUserUseCase } from './application/use-cases/register-user.use-case.ts';
import type { UserRepository } from './domain/repositories/user.repository.ts';
import { InMemoryUserRepository } from './infrastructure/repositories/in-memory.user-repository.ts';
import { FindUserController } from './presentation/controllers/find-user-controller.ts';
import { RegisterUserController } from './presentation/controllers/register-user-controller.ts';
import { createUsersRouter } from './routes/user.route.ts';

export function composeUsersRouter(repository: UserRepository = new InMemoryUserRepository()) {
    return createUsersRouter(
        new RegisterUserController(new RegisterUserUseCase(repository)),
        new FindUserController(new FindUserUseCase(repository)),
    );
}
