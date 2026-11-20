import { describe, expect, test } from 'vitest';
import { Product } from '../../../../src/products/domain/entities/product.entity.ts';
import { ValidationError } from '../../../../src/shared/domain/errors/domain.errors.ts';

const input = {
  name: ' Café ',
  cost: 25.5,
  price: 35.75,
  stock: 10,
  description: ' Café molido ',
  category: ' Alimentos ',
};

describe('Product', () => {
  test('genera un UUID, normaliza el texto y permite omitir las imágenes', () => {
    const product = Product.create(input);

    expect(product.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(product).toEqual({
      id: product.id,
      name: 'Café',
      cost: 25.5,
      price: 35.75,
      stock: 10,
      description: 'Café molido',
      category: 'Alimentos',
      images: [],
    });
    expect(Product.create(input).id).not.toBe(product.id);
  });

  test('acepta existencias y valores monetarios en cero', () => {
    expect(Product.create({ ...input, cost: 0, price: 0, stock: 0 })).toMatchObject({
      cost: 0, price: 0, stock: 0,
    });
  });

  test('normaliza las imágenes y mantiene una copia inmutable', () => {
    const images = [' /images/coffee.png '];
    const product = Product.create({ ...input, images });

    images[0] = 'other.png';
    expect(product.images).toEqual(['/images/coffee.png']);
    expect(Reflect.set(product.images, '0', 'other.png')).toBe(false);
    expect(Reflect.set(product, 'stock', -1)).toBe(false);
  });

  test.each([
    { name: ' ' },
    { category: ' ' },
    { cost: -1 },
    { cost: NaN },
    { price: -1 },
    { price: Infinity },
    { stock: -1 },
    { stock: 0.5 },
    { stock: Number.MAX_SAFE_INTEGER + 1 },
    { images: [' '] },
  ])('rechaza valores inválidos: %j', (invalidFields) => {
    expect(() => Product.create({ ...input, ...invalidFields })).toThrow(ValidationError);
  });
});
