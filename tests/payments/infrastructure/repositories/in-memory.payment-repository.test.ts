import { describe, expect, test } from 'vitest';
import { Payment } from '../../../../src/payments/domain/entities/payment.entity.ts';
import { InMemoryPaymentRepository } from '../../../../src/payments/infrastructure/repositories/in-memory.payment-repository.ts';
import { ConflictError } from '../../../../src/shared/domain/errors/domain.errors.ts';

describe('InMemoryPaymentRepository', () => {
  test('devuelve undefined para búsquedas inexistentes y un listado vacío', async () => {
    const repository = new InMemoryPaymentRepository();
    expect(await repository.findById('missing')).toBeUndefined();
    expect(await repository.findByReference('missing')).toBeUndefined();
    expect(await repository.findAll()).toEqual([]);
  });

  test('guarda pagos, consulta por ambos identificadores y conserva el orden de creación', async () => {
    const repository = new InMemoryPaymentRepository();
    const first = Payment.create({ reference: 'REF', amount: 1, customerId: 'c' });
    const second = Payment.create({ reference: 'ref', amount: 2, customerId: 'c' });
    await repository.save(first);
    await repository.save(second);
    expect(await repository.findById(first.id)).toBe(first);
    expect(await repository.findByReference('REF')).toBe(first);
    expect(await repository.findByReference('ref')).toBe(second);
    expect(await repository.findAll()).toEqual([first, second]);
    (await repository.findAll()).pop();
    expect(await repository.findAll()).toHaveLength(2);
  });

  test('rechaza referencias y IDs duplicados sin sobrescribir', async () => {
    const repository = new InMemoryPaymentRepository();
    const payment = Payment.create({ reference: 'REF', amount: 1, customerId: 'c' });
    const duplicate = Payment.create({ reference: 'REF', amount: 2, customerId: 'other' });
    await repository.save(payment);
    await expect(repository.save(payment)).rejects.toThrow(ConflictError);
    await expect(repository.save(duplicate)).rejects.toThrow(ConflictError);
    expect(await repository.findByReference('REF')).toBe(payment);
    expect(await repository.findById(duplicate.id)).toBeUndefined();
    expect(await repository.findAll()).toEqual([payment]);
  });
});
