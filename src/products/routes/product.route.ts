import { json, Router } from 'express';
import { requireJson } from '../../server/presentation/http/require-json.ts';
import { validateBody } from '../../server/presentation/http/validate-body.ts';
import type { FindProductController } from '../presentation/controllers/find-product-controller.ts';
import type { ListProductsController } from '../presentation/controllers/list-products-controller.ts';
import type { RegisterProductController } from '../presentation/controllers/register-product-controller.ts';
import { registerProductSchema } from '../presentation/schemas/register-product.schema.ts';

export function createProductsRouter(
  registerProductController: RegisterProductController,
  findProductController: FindProductController,
  listProductsController: ListProductsController,
) {
  const router = Router();

  router.post('/', requireJson, json({ limit: '64kb' }), validateBody(registerProductSchema), async (request, response) => {
    const product = await registerProductController.handle(request.body);
    response.status(201).json(product);
  });

  router.get('/', async (_request, response) => {
    response.status(200).json(await listProductsController.handle());
  });

  router.get('/:id', async (request, response) => {
    response.status(200).json(await findProductController.handle(request.params.id));
  });

  router.all('/', (_request, response) => {
    response.set('Allow', 'GET, HEAD, POST').status(405).json({ error: 'Método no permitido' });
  });

  router.all('/:id', (_request, response) => {
    response.set('Allow', 'GET, HEAD').status(405).json({ error: 'Método no permitido' });
  });

  return router;
}
