import { NotFoundError, ValidationError } from '../../../shared/domain/errors/domain.errors.ts';
import { Payment } from '../../domain/entities/payment.entity.ts';
import type { PaymentRepository } from '../../domain/repositories/payment.repository.ts';

export class FindPaymentByReferenceUseCase {
  private readonly repository: PaymentRepository;

  constructor(repository: PaymentRepository) {
    this.repository = repository;
  }

  async execute(reference: string): Promise<Payment> {
    const normalizedReference = Payment.normalizeReference(reference);
    if (!normalizedReference) {
      throw new ValidationError('La referencia del pago es obligatoria');
    }
    const payment = await this.repository.findByReference(normalizedReference);
    if (!payment) {
      throw new NotFoundError('Pago no encontrado');
    }
    return payment;
  }
}
