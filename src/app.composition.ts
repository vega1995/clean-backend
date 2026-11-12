import { Router } from "express";
import { createExpressApp } from "./server/presentation/config/express.config.ts";
import { createPublicRoutes } from "./server/presentation/routes/public.routes.ts";
import { InMemoryUserRepository } from "./users/infrastructure/repositories/in-memory.user-repository.ts";
import { RegisterUserUseCase } from "./users/application/use-cases/register-user.use-case.ts";
import { RegisterUserController } from "./users/presentation/controllers/register-user-controller.ts";
import { createUsersRouter } from "./users/routes/user.route.ts";
import { FindUserController } from "./users/presentation/controllers/find-user-controller.ts";
import { FindUserUseCase } from "./users/application/use-cases/find-user.use-case.ts";

export function createApp() {
    //! Repositorios
    const userRepository =new InMemoryUserRepository(); 

    //! Casos de uso
    const registerUserUseCase=new RegisterUserUseCase(userRepository);
    const findUserUseCase=new FindUserUseCase(userRepository);

    //! Controladores
    const registerUserController=new RegisterUserController(registerUserUseCase); 
    const findUserController=new FindUserController(findUserUseCase);
    const router=Router();

    router.use("/", createPublicRoutes());

    //!users
    router.use("/users", createUsersRouter(registerUserController, findUserController));
    

    //TODO:/paym

    return createExpressApp(router);
}