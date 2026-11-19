import type { Payment } from '../../domain/entities/payment.entity.ts';
import type { PaymentRepository } from '../../domain/repositories/payment.repository.ts';

export class ListPaymentsUseCase {
  private readonly repository: PaymentRepository;

  constructor(repository: PaymentRepository) {
    this.repository = repository;
  }

  async execute(): Promise<Payment[]> {
    return this.repository.findAll();
  }
}
