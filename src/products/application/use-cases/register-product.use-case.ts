import { Product, type CreateProductData } from '../../domain/entities/product.entity.ts';
import type { ProductRepository } from '../../domain/repositories/product.repository.ts';

export class RegisterProductUseCase {
  private readonly repository: ProductRepository;

  constructor(repository: ProductRepository) {
    this.repository = repository;
  }

  async execute(input: CreateProductData): Promise<Product> {
    const product = Product.create(input);
    await this.repository.save(product);
    return product;
  }
}
