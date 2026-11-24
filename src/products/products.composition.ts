import { FindProductUseCase } from './application/use-cases/find-product.use-case.ts';
import { ListProductsUseCase } from './application/use-cases/list-products.use-case.ts';
import { RegisterProductUseCase } from './application/use-cases/register-product.use-case.ts';
import type { ProductRepository } from './domain/repositories/product.repository.ts';
import { InMemoryProductRepository } from './infrastructure/repositories/in-memory.product-repository.ts';
import { FindProductController } from './presentation/controllers/find-product-controller.ts';
import { ListProductsController } from './presentation/controllers/list-products-controller.ts';
import { RegisterProductController } from './presentation/controllers/register-product-controller.ts';
import { createProductsRouter } from './routes/product.route.ts';

export function composeProductsRouter(repository: ProductRepository = new InMemoryProductRepository()) {
    return createProductsRouter(
        new RegisterProductController(new RegisterProductUseCase(repository)),
        new FindProductController(new FindProductUseCase(repository)),
        new ListProductsController(new ListProductsUseCase(repository)),
    );
}
