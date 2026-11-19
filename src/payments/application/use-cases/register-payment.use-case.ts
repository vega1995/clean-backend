import { ConflictError } from '../../../shared/domain/errors/domain.errors.ts';
import { Payment, type CreatePaymentData } from '../../domain/entities/payment.entity.ts';
import type { PaymentRepository } from '../../domain/repositories/payment.repository.ts';

export class RegisterPaymentUseCase {
  private readonly repository: PaymentRepository;

  constructor(repository: PaymentRepository) {
    this.repository = repository;
  }

  async execute(input: CreatePaymentData): Promise<Payment> {
    const payment = Payment.create(input);
    if (await this.repository.findByReference(payment.reference)) {
      throw new ConflictError('La referencia del pago ya está registrada');
    }

    await this.repository.save(payment);
    return payment;
  }
}
