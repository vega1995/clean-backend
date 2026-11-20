import type { Product } from '../entities/product.entity.ts';

export interface ProductRepository {
  /** Guarda un producto nuevo y rechaza un ID que ya existe. */
  save(product: Product): Promise<void>;
  findById(id: string): Promise<Product | undefined>;
  /** Devuelve los productos en orden de registro. */
  findAll(): Promise<Product[]>;
}
