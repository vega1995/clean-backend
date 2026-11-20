import type { FindProductUseCase } from '../../application/use-cases/find-product.use-case.ts';

export class FindProductController {
  private readonly useCase: FindProductUseCase;

  constructor(useCase: FindProductUseCase) {
    this.useCase = useCase;
  }

  handle(id: string) {
    return this.useCase.execute(id);
  }
}
