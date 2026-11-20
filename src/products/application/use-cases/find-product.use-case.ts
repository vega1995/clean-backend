import { NotFoundError, ValidationError } from '../../../shared/domain/errors/domain.errors.ts';
import type { Product } from '../../domain/entities/product.entity.ts';
import type { ProductRepository } from '../../domain/repositories/product.repository.ts';

export class FindProductUseCase {
  private readonly repository: ProductRepository;

  constructor(repository: ProductRepository) {
    this.repository = repository;
  }

  async execute(id: string): Promise<Product> {
    const normalizedId = id.trim();
    if (!normalizedId) {
      throw new ValidationError('El ID del producto es obligatorio');
    }

    const product = await this.repository.findById(normalizedId);
    if (!product) {
      throw new NotFoundError('Producto no encontrado');
    }
    return product;
  }
}
