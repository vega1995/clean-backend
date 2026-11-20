import { describe, expect, test, vi } from 'vitest';
import { FindProductUseCase } from '../../../../src/products/application/use-cases/find-product.use-case.ts';
import { ListProductsUseCase } from '../../../../src/products/application/use-cases/list-products.use-case.ts';
import { RegisterProductUseCase } from '../../../../src/products/application/use-cases/register-product.use-case.ts';
import { Product } from '../../../../src/products/domain/entities/product.entity.ts';
import type { ProductRepository } from '../../../../src/products/domain/repositories/product.repository.ts';
import { NotFoundError, ValidationError } from '../../../../src/shared/domain/errors/domain.errors.ts';

const input = { name: ' Café ', cost: 25, price: 35, stock: 10, description: 'Café molido', category: 'Alimentos' };

function createRepository() {
  return {
    save: vi.fn<ProductRepository['save']>().mockResolvedValue(undefined),
    findById: vi.fn<ProductRepository['findById']>().mockResolvedValue(undefined),
    findAll: vi.fn<ProductRepository['findAll']>().mockResolvedValue([]),
  } satisfies ProductRepository;
}

describe('Casos de uso de productos', () => {
  test('registra el producto normalizado a través del contrato', async () => {
    const repository = createRepository();
    const product = await new RegisterProductUseCase(repository).execute(input);

    expect(product.name).toBe('Café');
    expect(repository.save).toHaveBeenCalledExactlyOnceWith(product);
  });

  test('valida el producto antes de guardarlo', async () => {
    const repository = createRepository();
    const useCase = new RegisterProductUseCase(repository);

    await expect(useCase.execute({ ...input, stock: -1 })).rejects.toThrow(ValidationError);
    expect(repository.save).not.toHaveBeenCalled();
  });

  test('consulta por ID normalizado y lista productos a través del contrato', async () => {
    const repository = createRepository();
    const product = Product.create(input);
    repository.findById.mockResolvedValue(product);
    repository.findAll.mockResolvedValue([product]);

    expect(await new FindProductUseCase(repository).execute(` ${product.id} `)).toBe(product);
    expect(repository.findById).toHaveBeenCalledExactlyOnceWith(product.id);
    expect(await new ListProductsUseCase(repository).execute()).toEqual([product]);
    expect(repository.findAll).toHaveBeenCalledOnce();
  });

  test('distingue un ID vacío de un producto inexistente', async () => {
    const repository = createRepository();
    const useCase = new FindProductUseCase(repository);

    await expect(useCase.execute(' ')).rejects.toThrow(ValidationError);
    expect(repository.findById).not.toHaveBeenCalled();
    await expect(useCase.execute('missing')).rejects.toThrow(NotFoundError);
  });
});
