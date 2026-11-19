import type { Payment } from '../entities/payment.entity.ts';

export interface PaymentRepository {
  save(payment: Payment): Promise<void>;
  findById(id: string): Promise<Payment | undefined>;
  findByReference(reference: string): Promise<Payment | undefined>;
  findAll(): Promise<Payment[]>;
}
