import { ConflictError } from '../../../shared/domain/errors/domain.errors.ts';
import type { Product } from '../../domain/entities/product.entity.ts';
import type { ProductRepository } from '../../domain/repositories/product.repository.ts';

export class InMemoryProductRepository implements ProductRepository {
  private readonly products = new Map<string, Product>();

  async save(product: Product): Promise<void> {
    if (this.products.has(product.id)) {
      throw new ConflictError('El producto ya existe');
    }
    this.products.set(product.id, product);
  }

  async findById(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async findAll(): Promise<Product[]> {
    return [...this.products.values()];
  }
}
