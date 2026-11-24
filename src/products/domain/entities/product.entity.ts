import { ValidationError } from '../../../shared/domain/errors/domain.errors.ts';

export interface CreateProductData {
  name: string;
  cost: number;
  price: number;
  stock: number;
  description: string;
  category: string;
  images?: readonly string[];
}

export interface RestoreProductData extends Required<CreateProductData> {
  id: string;
}

export class Product {
  readonly id: string;
  readonly name: string;
  readonly cost: number;
  readonly price: number;
  readonly stock: number;
  readonly description: string;
  readonly category: string;
  readonly images: readonly string[];

  private constructor(input: RestoreProductData) {
    this.id = input.id;
    this.name = input.name;
    this.cost = input.cost;
    this.price = input.price;
    this.stock = input.stock;
    this.description = input.description;
    this.category = input.category;
    this.images = Object.freeze(input.images);
    Object.freeze(this);
  }

  static create(input: CreateProductData): Product {
    const data = Product.validate(input);
    return new Product({ id: globalThis.crypto.randomUUID(), ...data });
  }

  static restore({ id, ...input }: RestoreProductData): Product {
    return new Product({ id, ...Product.validate(input) });
  }

  private static validate(input: CreateProductData): Required<CreateProductData> {
    const { cost, price, stock, images = [] } = input;
    const name = input.name.trim();
    const category = input.category.trim();

    if (!name || !category) {
      throw new ValidationError('El nombre y la categoría son obligatorios');
    }
    if (!Number.isFinite(cost) || cost < 0) {
      throw new ValidationError('El costo debe ser un número finito mayor o igual a cero');
    }
    if (!Number.isFinite(price) || price < 0) {
      throw new ValidationError('El precio debe ser un número finito mayor o igual a cero');
    }
    if (!Number.isSafeInteger(stock) || stock < 0) {
      throw new ValidationError('El stock debe ser un número entero seguro mayor o igual a cero');
    }
    if (!Array.isArray(images)) {
      throw new ValidationError('Las imágenes deben estar en un arreglo');
    }

    const normalizedImages = Array.from(images, (image) => {
      if (typeof image !== 'string' || !image.trim()) {
        throw new ValidationError('Cada imagen debe tener una referencia de texto');
      }
      return image.trim();
    });

    return {
      name,
      cost,
      price,
      stock,
      description: input.description.trim(),
      category,
      images: normalizedImages,
    };
  }
}
