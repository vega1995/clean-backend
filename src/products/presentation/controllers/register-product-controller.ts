import type { RegisterProductUseCase } from '../../application/use-cases/register-product.use-case.ts';
import type { RegisterProductInput } from '../schemas/register-product.schema.ts';

export class RegisterProductController {
  private readonly useCase: RegisterProductUseCase;

  constructor(useCase: RegisterProductUseCase) {
    this.useCase = useCase;
  }

  handle(input: RegisterProductInput) {
    return this.useCase.execute(input);
  }
}
