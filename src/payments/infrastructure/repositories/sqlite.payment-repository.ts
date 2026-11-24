import type Database from 'better-sqlite3';
import { ConflictError } from '../../../shared/domain/errors/domain.errors.ts';
import { Payment, type RestorePaymentData } from '../../domain/entities/payment.entity.ts';
import type { PaymentRepository } from '../../domain/repositories/payment.repository.ts';

interface PaymentRow extends Omit<RestorePaymentData, 'createdAt'> {
  createdAt: number;
}

export class SqlitePaymentRepository implements PaymentRepository {
  private readonly insertPayment: Database.Statement<[PaymentRow]>;
  private readonly selectById: Database.Statement<[string], PaymentRow>;
  private readonly selectByReference: Database.Statement<[string], PaymentRow>;
  private readonly selectAll: Database.Statement<[], PaymentRow>;

  constructor(database: Database.Database) {
    database.exec(`
      CREATE TABLE IF NOT EXISTS payments (
        registration_order INTEGER PRIMARY KEY,
        id TEXT NOT NULL UNIQUE,
        reference TEXT NOT NULL UNIQUE,
        amount REAL NOT NULL,
        status TEXT NOT NULL,
        customer_id TEXT NOT NULL,
        created_at INTEGER NOT NULL
      )
    `);

    this.insertPayment = database.prepare(`
      INSERT INTO payments (id, reference, amount, status, customer_id, created_at)
      VALUES (@id, @reference, @amount, @status, @customerId, @createdAt)
      ON CONFLICT(id) DO NOTHING
      ON CONFLICT(reference) DO NOTHING
    `);
    const selectPayments = `
      SELECT id, reference, amount, status, customer_id AS customerId, created_at AS createdAt
      FROM payments
    `;
    this.selectById = database.prepare(`${selectPayments} WHERE id = ?`);
    this.selectByReference = database.prepare(`${selectPayments} WHERE reference = ?`);
    this.selectAll = database.prepare(`${selectPayments} ORDER BY registration_order`);
  }

  async save(payment: Payment): Promise<void> {
    const result = this.insertPayment.run({ ...payment, createdAt: payment.createdAt.getTime() });
    if (result.changes === 0) {
      throw new ConflictError('El pago ya existe');
    }
  }

  async findById(id: string): Promise<Payment | undefined> {
    const row = this.selectById.get(id);
    return row === undefined ? undefined : restorePayment(row);
  }

  async findByReference(reference: string): Promise<Payment | undefined> {
    const row = this.selectByReference.get(reference);
    return row === undefined ? undefined : restorePayment(row);
  }

  async findAll(): Promise<Payment[]> {
    return this.selectAll.all().map(restorePayment);
  }
}

function restorePayment(row: PaymentRow): Payment {
  return Payment.restore({ ...row, createdAt: new Date(row.createdAt) });
}
