import type { FindPaymentUseCase } from '../../application/use-cases/find-payment.use-case.ts';

export class FindPaymentController {
  private readonly useCase: FindPaymentUseCase;

  constructor(useCase: FindPaymentUseCase) {
    this.useCase = useCase;
  }

  handle(id: string) {
    return this.useCase.execute(id);
  }
}
