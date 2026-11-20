import { describe, expect, test } from 'vitest';
import { Product } from '../../../../src/products/domain/entities/product.entity.ts';
import { InMemoryProductRepository } from '../../../../src/products/infrastructure/repositories/in-memory.product-repository.ts';
import { ConflictError } from '../../../../src/shared/domain/errors/domain.errors.ts';

const input = { name: 'Café', cost: 25, price: 35, stock: 10, description: 'Café molido', category: 'Alimentos' };

describe('InMemoryProductRepository', () => {
  test('guarda por ID y lista en orden de registro', async () => {
    const repository = new InMemoryProductRepository();
    const first = Product.create(input);
    const second = Product.create({ ...input, price: 40 });

    expect(await repository.findById(first.id)).toBeUndefined();
    expect(await repository.findAll()).toEqual([]);

    await repository.save(first);
    await repository.save(second);

    expect(await repository.findById(first.id)).toBe(first);
    expect(await repository.findById(second.id)).toBe(second);
    expect(await repository.findAll()).toEqual([first, second]);
  });

  test('rechaza guardar dos veces el mismo ID', async () => {
    const repository = new InMemoryProductRepository();
    const product = Product.create(input);

    await repository.save(product);

    await expect(repository.save(product)).rejects.toThrow(ConflictError);
    expect(await repository.findAll()).toEqual([product]);
  });
});
