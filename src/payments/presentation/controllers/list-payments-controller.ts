import type { ListPaymentsUseCase } from '../../application/use-cases/list-payments.use-case.ts';

export class ListPaymentsController {
  private readonly useCase: ListPaymentsUseCase;

  constructor(useCase: ListPaymentsUseCase) {
    this.useCase = useCase;
  }

  handle() {
    return this.useCase.execute();
  }
}
