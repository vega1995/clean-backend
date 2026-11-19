import { describe, expect, test, vi } from 'vitest';
import { RegisterPaymentUseCase } from '../../../../src/payments/application/use-cases/register-payment.use-case.ts';
import { FindPaymentUseCase } from '../../../../src/payments/application/use-cases/find-payment.use-case.ts';
import { FindPaymentByReferenceUseCase } from '../../../../src/payments/application/use-cases/find-payment-by-reference.use-case.ts';
import { ListPaymentsUseCase } from '../../../../src/payments/application/use-cases/list-payments.use-case.ts';
import { Payment } from '../../../../src/payments/domain/entities/payment.entity.ts';
import type { PaymentRepository } from '../../../../src/payments/domain/repositories/payment.repository.ts';
import { ConflictError, NotFoundError, ValidationError } from '../../../../src/shared/domain/errors/domain.errors.ts';

const input = { reference: ' REF-1 ', amount: 10, customerId: ' customer-1 ' };

function createRepository() {
  return {
    save: vi.fn<PaymentRepository['save']>().mockResolvedValue(undefined),
    findById: vi.fn<PaymentRepository['findById']>().mockResolvedValue(undefined),
    findByReference: vi.fn<PaymentRepository['findByReference']>().mockResolvedValue(undefined),
    findAll: vi.fn<PaymentRepository['findAll']>().mockResolvedValue([]),
  } satisfies PaymentRepository;
}

describe('Casos de uso de pagos', () => {
  test('registra los datos normalizados a través del contrato', async () => {
    const repository = createRepository();
    const payment = await new RegisterPaymentUseCase(repository).execute(input);
    expect(payment.reference).toBe('REF-1');
    expect(repository.findByReference).toHaveBeenCalledExactlyOnceWith('REF-1');
    expect(repository.save).toHaveBeenCalledExactlyOnceWith(payment);
  });

  test('rechaza referencia duplicada sin guardar', async () => {
    const repository = createRepository();
    repository.findByReference.mockResolvedValue(Payment.create(input));
    await expect(new RegisterPaymentUseCase(repository).execute(input)).rejects.toThrow(ConflictError);
    expect(repository.save).not.toHaveBeenCalled();
  });

  test('rechaza datos inválidos antes de consultar persistencia', async () => {
    const repository = createRepository();
    await expect(new RegisterPaymentUseCase(repository).execute({ ...input, amount: 0 })).rejects.toThrow(ValidationError);
    expect(repository.findByReference).not.toHaveBeenCalled();
    expect(repository.save).not.toHaveBeenCalled();
  });

  test('consulta por ID y referencia normalizados y lista pagos', async () => {
    const repository = createRepository();
    const payment = Payment.create(input);
    repository.findById.mockResolvedValue(payment);
    repository.findByReference.mockResolvedValue(payment);
    repository.findAll.mockResolvedValue([payment]);
    expect(await new FindPaymentUseCase(repository).execute(` ${payment.id} `)).toBe(payment);
    expect(await new FindPaymentByReferenceUseCase(repository).execute(' REF-1 ')).toBe(payment);
    expect(await new ListPaymentsUseCase(repository).execute()).toEqual([payment]);
    expect(repository.findById).toHaveBeenCalledExactlyOnceWith(payment.id);
    expect(repository.findByReference).toHaveBeenCalledExactlyOnceWith('REF-1');
  });

  test('reporta pagos inexistentes y devuelve un listado vacío', async () => {
    const repository = createRepository();
    await expect(new FindPaymentUseCase(repository).execute('missing')).rejects.toThrow(NotFoundError);
    await expect(new FindPaymentByReferenceUseCase(repository).execute('missing')).rejects.toThrow(NotFoundError);
    expect(await new ListPaymentsUseCase(repository).execute()).toEqual([]);
  });

  test('rechaza búsquedas vacías sin consultar el repositorio', async () => {
    const repository = createRepository();
    await expect(new FindPaymentUseCase(repository).execute(' ')).rejects.toThrow(ValidationError);
    await expect(new FindPaymentByReferenceUseCase(repository).execute(' ')).rejects.toThrow(ValidationError);
    expect(repository.findById).not.toHaveBeenCalled();
    expect(repository.findByReference).not.toHaveBeenCalled();
  });

  test('propaga errores de persistencia en creación y lecturas', async () => {
    const repository = createRepository();
    const error = new Error('Persistencia no disponible');
    repository.findByReference.mockRejectedValue(error);
    await expect(new RegisterPaymentUseCase(repository).execute(input)).rejects.toBe(error);
    expect(repository.save).not.toHaveBeenCalled();
    await expect(new FindPaymentByReferenceUseCase(repository).execute('REF-1')).rejects.toBe(error);
    repository.findByReference.mockResolvedValue(undefined);
    repository.save.mockRejectedValue(error);
    await expect(new RegisterPaymentUseCase(repository).execute(input)).rejects.toBe(error);
    repository.findById.mockRejectedValue(error);
    repository.findAll.mockRejectedValue(error);
    await expect(new FindPaymentUseCase(repository).execute('id')).rejects.toBe(error);
    await expect(new ListPaymentsUseCase(repository).execute()).rejects.toBe(error);
  });
});
