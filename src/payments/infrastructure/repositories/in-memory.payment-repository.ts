import { ConflictError } from '../../../shared/domain/errors/domain.errors.ts';
import type { Payment } from '../../domain/entities/payment.entity.ts';
import type { PaymentRepository } from '../../domain/repositories/payment.repository.ts';

export class InMemoryPaymentRepository implements PaymentRepository {
  private readonly payments = new Map<string, Payment>();
  private readonly references = new Map<string, Payment>();

  async save(payment: Payment): Promise<void> {
    if (this.payments.has(payment.id) || this.references.has(payment.reference)) {
      throw new ConflictError('El pago ya existe');
    }

    this.payments.set(payment.id, payment);
    this.references.set(payment.reference, payment);
  }

  async findById(id: string): Promise<Payment | undefined> {
    return this.payments.get(id);
  }

  async findByReference(reference: string): Promise<Payment | undefined> {
    return this.references.get(reference);
  }

  async findAll(): Promise<Payment[]> {
    return [...this.payments.values()];
  }
}
