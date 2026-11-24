import type Database from 'better-sqlite3';
import { ConflictError } from '../../../shared/domain/errors/domain.errors.ts';
import { Product, type RestoreProductData } from '../../domain/entities/product.entity.ts';
import type { ProductRepository } from '../../domain/repositories/product.repository.ts';

interface ProductRow extends Omit<RestoreProductData, 'images'> {
  images: string;
}

export class SqliteProductRepository implements ProductRepository {
  private readonly insertProduct: Database.Statement<[ProductRow]>;
  private readonly selectById: Database.Statement<[string], ProductRow>;
  private readonly selectAll: Database.Statement<[], ProductRow>;

  constructor(database: Database.Database) {
    database.exec(`
      CREATE TABLE IF NOT EXISTS products (
        registration_order INTEGER PRIMARY KEY,
        id TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        cost REAL NOT NULL,
        price REAL NOT NULL,
        stock INTEGER NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        images TEXT NOT NULL
      )
    `);

    this.insertProduct = database.prepare(`
      INSERT INTO products (id, name, cost, price, stock, description, category, images)
      VALUES (@id, @name, @cost, @price, @stock, @description, @category, @images)
      ON CONFLICT(id) DO NOTHING
    `);
    const selectProducts = 'SELECT id, name, cost, price, stock, description, category, images FROM products';
    this.selectById = database.prepare(`${selectProducts} WHERE id = ?`);
    this.selectAll = database.prepare(`${selectProducts} ORDER BY registration_order`);
  }

  async save(product: Product): Promise<void> {
    const result = this.insertProduct.run({ ...product, images: JSON.stringify(product.images) });
    if (result.changes === 0) {
      throw new ConflictError('El producto ya existe');
    }
  }

  async findById(id: string): Promise<Product | undefined> {
    const row = this.selectById.get(id);
    return row === undefined ? undefined : restoreProduct(row);
  }

  async findAll(): Promise<Product[]> {
    return this.selectAll.all().map(restoreProduct);
  }
}

function restoreProduct(row: ProductRow): Product {
  return Product.restore({ ...row, images: JSON.parse(row.images) });
}
