import { describe, expect, test } from 'vitest';
import { Payment } from '../../../../src/payments/domain/entities/payment.entity.ts';
import { ValidationError } from '../../../../src/shared/domain/errors/domain.errors.ts';

const input = { reference: '  REF-1  ', amount: 25.5, customerId: '  customer-1  ' };

describe('Payment', () => {
  test('crea pagos normalizados con UUID único, estado pending y fechas iguales', () => {
    const before = Date.now();
    const payment = Payment.create(input);
    expect(payment.reference).toBe('REF-1');
    expect(payment.customerId).toBe('customer-1');
    expect(payment.amount).toBe(25.5);
    expect(payment.status).toBe('pending');
    expect(payment.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(Payment.create(input).id).not.toBe(payment.id);
    expect(payment.createdAt.getTime()).toBeGreaterThanOrEqual(before);
    expect(payment.createdAt.getTime()).toBeLessThanOrEqual(Date.now());
    expect(payment.updatedAt).toEqual(payment.createdAt);
  });

  test.each([0, -1, NaN, Infinity, -Infinity])('rechaza el monto %s', (amount) => {
    expect(() => Payment.create({ ...input, amount })).toThrow(ValidationError);
  });

  test.each(['reference', 'customerId'] as const)('rechaza %s vacío', (field) => {
    expect(() => Payment.create({ ...input, [field]: '   ' })).toThrow(ValidationError);
  });

  test('conserva mayúsculas y protege propiedades y fechas', () => {
    const payment = Payment.create(input);
    const date = payment.createdAt.getTime();
    expect(Reflect.set(payment, 'amount', 0)).toBe(false);
    expect(Reflect.set(payment, 'createdAt', new Date(0))).toBe(false);
    payment.createdAt.setTime(0);
    payment.updatedAt.setTime(0);
    payment.toJSON().createdAt.setTime(0);
    expect(payment.createdAt.getTime()).toBe(date);
    expect(payment.updatedAt.getTime()).toBe(date);
    expect(payment.reference).toBe('REF-1');
  });

  test('serializa exactamente los siete campos, con fechas ISO', () => {
    const payment = Payment.create(input);
    expect(JSON.parse(JSON.stringify(payment))).toEqual({
      id: payment.id, reference: 'REF-1', amount: 25.5, status: 'pending',
      createdAt: payment.createdAt.toISOString(), updatedAt: payment.updatedAt.toISOString(),
      customerId: 'customer-1',
    });
  });
});
