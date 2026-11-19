import { json, Router } from 'express';
import { requireJson } from '../../server/presentation/http/require-json.ts';
import { validateBody } from '../../server/presentation/http/validate-body.ts';
import type { RegisterPaymentController } from '../presentation/controllers/register-payment-controller.ts';
import type { FindPaymentController } from '../presentation/controllers/find-payment-controller.ts';
import type { FindPaymentByReferenceController } from '../presentation/controllers/find-payment-by-reference-controller.ts';
import type { ListPaymentsController } from '../presentation/controllers/list-payments-controller.ts';
import { registerPaymentSchema } from '../presentation/schemas/register-payment.schema.ts';

export function createPaymentsRouter(
  registerPaymentController: RegisterPaymentController,
  findPaymentController: FindPaymentController,
  findPaymentByReferenceController: FindPaymentByReferenceController,
  listPaymentsController: ListPaymentsController,
) {
  const router = Router();

  router.post('/', requireJson, json({ limit: '64kb' }), validateBody(registerPaymentSchema), async (request, response) => {
    const payment = await registerPaymentController.handle(request.body);
    response.status(201).json(payment);
  });

  router.get('/', async (_request, response) => {
    response.status(200).json(await listPaymentsController.handle());
  });

  router.get('/reference/:reference', async (request, response) => {
    response.status(200).json(await findPaymentByReferenceController.handle(request.params.reference));
  });

  router.get('/:id', async (request, response) => {
    response.status(200).json(await findPaymentController.handle(request.params.id));
  });

  router.all('/', (_request, response) => {
    response.set('Allow', 'GET, HEAD, POST').status(405).json({ error: 'Método no permitido' });
  });

  router.all(['/reference/:reference', '/:id'], (_request, response) => {
    response.set('Allow', 'GET, HEAD').status(405).json({ error: 'Método no permitido' });
  });

  return router;
}
