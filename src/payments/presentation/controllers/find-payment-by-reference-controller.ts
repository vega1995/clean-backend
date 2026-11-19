import type { FindPaymentByReferenceUseCase } from '../../application/use-cases/find-payment-by-reference.use-case.ts';

export class FindPaymentByReferenceController {
  private readonly useCase: FindPaymentByReferenceUseCase;

  constructor(useCase: FindPaymentByReferenceUseCase) {
    this.useCase = useCase;
  }

  handle(reference: string) {
    return this.useCase.execute(reference);
  }
}
