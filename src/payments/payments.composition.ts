import { FindPaymentByReferenceUseCase } from './application/use-cases/find-payment-by-reference.use-case.ts';
import { FindPaymentUseCase } from './application/use-cases/find-payment.use-case.ts';
import { ListPaymentsUseCase } from './application/use-cases/list-payments.use-case.ts';
import { RegisterPaymentUseCase } from './application/use-cases/register-payment.use-case.ts';
import type { PaymentRepository } from './domain/repositories/payment.repository.ts';
import { InMemoryPaymentRepository } from './infrastructure/repositories/in-memory.payment-repository.ts';
import { FindPaymentByReferenceController } from './presentation/controllers/find-payment-by-reference-controller.ts';
import { FindPaymentController } from './presentation/controllers/find-payment-controller.ts';
import { ListPaymentsController } from './presentation/controllers/list-payments-controller.ts';
import { RegisterPaymentController } from './presentation/controllers/register-payment-controller.ts';
import { createPaymentsRouter } from './routes/payment.route.ts';

export function composePaymentsRouter(repository: PaymentRepository = new InMemoryPaymentRepository()) {
    return createPaymentsRouter(
        new RegisterPaymentController(new RegisterPaymentUseCase(repository)),
        new FindPaymentController(new FindPaymentUseCase(repository)),
        new FindPaymentByReferenceController(new FindPaymentByReferenceUseCase(repository)),
        new ListPaymentsController(new ListPaymentsUseCase(repository)),
    );
}
