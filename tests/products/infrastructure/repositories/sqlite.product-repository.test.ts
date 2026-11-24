import Database from 'better-sqlite3';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { Product } from '../../../../src/products/domain/entities/product.entity.ts';
import { SqliteProductRepository } from '../../../../src/products/infrastructure/repositories/sqlite.product-repository.ts';
import { ConflictError } from '../../../../src/shared/domain/errors/domain.errors.ts';

const input = {
  name: "Café d'Ana", cost: 25.5, price: 35.75, stock: 10,
  description: 'Café molido', category: 'Alimentos',
};

describe('SqliteProductRepository', () => {
  let database: Database.Database;
  let repository: SqliteProductRepository;

  beforeEach(() => {
    database = new Database(':memory:');
    repository = new SqliteProductRepository(database);
  });

  afterEach(() => {
    database.close();
  });

  test('reconstruye los productos y los lista en orden de registro', async () => {
    const first = Product.restore({ ...input, id: 'z', images: ['/café.png', '/otra, imagen.jpg'] });
    const second = Product.restore({ ...input, id: 'a', stock: 0, images: [] });

    expect(await repository.findById(first.id)).toBeUndefined();
    expect(await repository.findAll()).toEqual([]);
    await repository.save(first);
    await repository.save(second);

    const stored = await repository.findById(first.id);
    expect(stored).toBeInstanceOf(Product);
    expect(stored).toEqual(first);
    expect(Object.isFrozen(stored)).toBe(true);
    expect(Object.isFrozen(stored?.images)).toBe(true);
    expect(await repository.findAll()).toEqual([first, second]);
  });

  test('rechaza un ID duplicado y conserva el producto original', async () => {
    const original = Product.create(input);
    const duplicate = Product.restore({ ...original, name: 'Otro producto' });

    await repository.save(original);
    await expect(repository.save(duplicate)).rejects.toThrow(new ConflictError('El producto ya existe'));
    expect(await repository.findAll()).toEqual([original]);
  });
});
