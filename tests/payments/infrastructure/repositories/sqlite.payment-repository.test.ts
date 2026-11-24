import Database from 'better-sqlite3';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { Payment } from '../../../../src/payments/domain/entities/payment.entity.ts';
import { SqlitePaymentRepository } from '../../../../src/payments/infrastructure/repositories/sqlite.payment-repository.ts';
import { ConflictError } from '../../../../src/shared/domain/errors/domain.errors.ts';

const input = { reference: 'REF', amount: 25.5, customerId: 'customer-1' };

describe('SqlitePaymentRepository', () => {
  let database: Database.Database;
  let repository: SqlitePaymentRepository;

  beforeEach(() => {
    database = new Database(':memory:');
    repository = new SqlitePaymentRepository(database);
  });

  afterEach(() => {
    database.close();
  });

  test('reconstruye los pagos y conserva su orden de registro y referencia exacta', async () => {
    const first = Payment.restore({
      ...input, id: 'z', status: 'completed', createdAt: new Date('2026-01-02T12:30:00.123Z'),
    });
    const second = Payment.restore({
      ...input, id: 'a', reference: 'ref', status: 'failed', createdAt: new Date('2026-01-01T00:00:00.000Z'),
    });

    expect(await repository.findById(first.id)).toBeUndefined();
    expect(await repository.findByReference(first.reference)).toBeUndefined();
    expect(await repository.findAll()).toEqual([]);
    await repository.save(first);
    await repository.save(second);

    const stored = await repository.findById(first.id);
    expect(stored).toBeInstanceOf(Payment);
    expect(Object.isFrozen(stored)).toBe(true);
    expect(stored?.toJSON()).toEqual(first.toJSON());
    expect((await repository.findByReference('REF'))?.toJSON()).toEqual(first.toJSON());
    expect((await repository.findByReference('ref'))?.toJSON()).toEqual(second.toJSON());
    expect((await repository.findAll()).map((payment) => payment.toJSON())).toEqual([
      first.toJSON(), second.toJSON(),
    ]);
  });

  test('rechaza IDs y referencias duplicados sin sobrescribir', async () => {
    const original = Payment.create(input);
    await repository.save(original);

    const sameId = Payment.restore({ ...original.toJSON(), reference: 'OTHER' });
    const sameReference = Payment.create({ ...input, amount: 99 });
    const conflict = new ConflictError('El pago ya existe');
    await expect(repository.save(sameId)).rejects.toThrow(conflict);
    await expect(repository.save(sameReference)).rejects.toThrow(conflict);
    expect(await repository.findByReference(sameId.reference)).toBeUndefined();
    expect(await repository.findById(sameReference.id)).toBeUndefined();
    expect((await repository.findAll()).map((payment) => payment.toJSON())).toEqual([original.toJSON()]);
  });
});
