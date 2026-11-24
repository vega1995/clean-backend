import { Router } from 'express';
import type { PaymentRepository } from './payments/domain/repositories/payment.repository.ts';
import { composePaymentsRouter } from './payments/payments.composition.ts';
import type { ProductRepository } from './products/domain/repositories/product.repository.ts';
import { composeProductsRouter } from './products/products.composition.ts';
import { createExpressApp } from './server/presentation/config/express.config.ts';
import { createPublicRoutes } from './server/presentation/routes/public.routes.ts';
import type { UserRepository } from './users/domain/repositories/user.repository.ts';
import { composeUsersRouter } from './users/users.composition.ts';

interface AppRepositories {
    userRepository?: UserRepository;
    productRepository?: ProductRepository;
    paymentRepository?: PaymentRepository;
}

export function createApp(
    { userRepository, productRepository, paymentRepository }: AppRepositories = {},
) {
    const router = Router();

    router.use('/', createPublicRoutes());
    router.use('/users', composeUsersRouter(userRepository));
    router.use('/payments', composePaymentsRouter(paymentRepository));
    router.use('/products', composeProductsRouter(productRepository));

    return createExpressApp(router);
}
