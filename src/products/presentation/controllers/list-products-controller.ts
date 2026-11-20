import type { ListProductsUseCase } from '../../application/use-cases/list-products.use-case.ts';

export class ListProductsController {
  private readonly useCase: ListProductsUseCase;

  constructor(useCase: ListProductsUseCase) {
    this.useCase = useCase;
  }

  handle() {
    return this.useCase.execute();
  }
}
