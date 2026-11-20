import { Router } from "express";
import { createExpressApp } from "./server/presentation/config/express.config.ts";
import { createPublicRoutes } from "./server/presentation/routes/public.routes.ts";
import { InMemoryUserRepository } from "./users/infrastructure/repositories/in-memory.user-repository.ts";
import { RegisterUserUseCase } from "./users/application/use-cases/register-user.use-case.ts";
import { RegisterUserController } from "./users/presentation/controllers/register-user-controller.ts";
import { createUsersRouter } from "./users/routes/user.route.ts";
import { FindUserController } from "./users/presentation/controllers/find-user-controller.ts";
import { FindUserUseCase } from "./users/application/use-cases/find-user.use-case.ts";
import { InMemoryPaymentRepository } from './payments/infrastructure/repositories/in-memory.payment-repository.ts';
import { RegisterPaymentUseCase } from './payments/application/use-cases/register-payment.use-case.ts';
import { FindPaymentUseCase } from './payments/application/use-cases/find-payment.use-case.ts';
import { FindPaymentByReferenceUseCase } from './payments/application/use-cases/find-payment-by-reference.use-case.ts';
import { ListPaymentsUseCase } from './payments/application/use-cases/list-payments.use-case.ts';
import { RegisterPaymentController } from './payments/presentation/controllers/register-payment-controller.ts';
import { FindPaymentController } from './payments/presentation/controllers/find-payment-controller.ts';
import { FindPaymentByReferenceController } from './payments/presentation/controllers/find-payment-by-reference-controller.ts';
import { ListPaymentsController } from './payments/presentation/controllers/list-payments-controller.ts';
import { createPaymentsRouter } from './payments/routes/payment.route.ts';
import { InMemoryProductRepository } from './products/infrastructure/repositories/in-memory.product-repository.ts';
import { RegisterProductUseCase } from './products/application/use-cases/register-product.use-case.ts';
import { FindProductUseCase } from './products/application/use-cases/find-product.use-case.ts';
import { ListProductsUseCase } from './products/application/use-cases/list-products.use-case.ts';
import { RegisterProductController } from './products/presentation/controllers/register-product-controller.ts';
import { FindProductController } from './products/presentation/controllers/find-product-controller.ts';
import { ListProductsController } from './products/presentation/controllers/list-products-controller.ts';
import { createProductsRouter } from './products/routes/product.route.ts';

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
    

    const paymentRepository = new InMemoryPaymentRepository();
    const registerPaymentUseCase = new RegisterPaymentUseCase(paymentRepository);
    const findPaymentUseCase = new FindPaymentUseCase(paymentRepository);
    const findPaymentByReferenceUseCase = new FindPaymentByReferenceUseCase(paymentRepository);
    const listPaymentsUseCase = new ListPaymentsUseCase(paymentRepository);

    router.use('/payments', createPaymentsRouter(
        new RegisterPaymentController(registerPaymentUseCase),
        new FindPaymentController(findPaymentUseCase),
        new FindPaymentByReferenceController(findPaymentByReferenceUseCase),
        new ListPaymentsController(listPaymentsUseCase),
    ));

    const productRepository = new InMemoryProductRepository();
    const registerProductUseCase = new RegisterProductUseCase(productRepository);
    const findProductUseCase = new FindProductUseCase(productRepository);
    const listProductsUseCase = new ListProductsUseCase(productRepository);

    router.use('/products', createProductsRouter(
        new RegisterProductController(registerProductUseCase),
        new FindProductController(findProductUseCase),
        new ListProductsController(listProductsUseCase),
    ));

    return createExpressApp(router);
}
