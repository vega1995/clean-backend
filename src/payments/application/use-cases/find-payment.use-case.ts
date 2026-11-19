import { NotFoundError, ValidationError } from '../../../shared/domain/errors/domain.errors.ts';
import type { Payment } from '../../domain/entities/payment.entity.ts';
import type { PaymentRepository } from '../../domain/repositories/payment.repository.ts';

export class FindPaymentUseCase {
  private readonly repository: PaymentRepository;

  constructor(repository: PaymentRepository) {
    this.repository = repository;
  }

  async execute(id: string): Promise<Payment> {
    const normalizedId = id.trim();
    if (!normalizedId) {
      throw new ValidationError('El ID del pago es obligatorio');
    }
    const payment = await this.repository.findById(normalizedId);
    if (!payment) {
      throw new NotFoundError('Pago no encontrado');
    }
    return payment;
  }
}
