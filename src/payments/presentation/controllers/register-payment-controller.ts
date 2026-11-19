import type { RegisterPaymentUseCase } from '../../application/use-cases/register-payment.use-case.ts';
import type { RegisterPaymentInput } from '../schemas/register-payment.schema.ts';

export class RegisterPaymentController {
  private readonly useCase: RegisterPaymentUseCase;

  constructor(useCase: RegisterPaymentUseCase) {
    this.useCase = useCase;
  }

  handle(input: RegisterPaymentInput) {
    return this.useCase.execute(input);
  }
}
