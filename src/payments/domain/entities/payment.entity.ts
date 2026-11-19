import { ValidationError } from '../../../shared/domain/errors/domain.errors.ts';

export type PaymentStatus = 'pending' | 'completed' | 'failed';

export interface CreatePaymentData {
  reference: string;
  amount: number;
  customerId: string;
}

export class Payment {
  readonly id: string;
  readonly reference: string;
  readonly amount: number;
  readonly status: PaymentStatus;
  readonly customerId: string;
  readonly #createdAt: number;

  private constructor(input: CreatePaymentData) {
    this.id = globalThis.crypto.randomUUID();
    this.reference = input.reference;
    this.amount = input.amount;
    this.status = 'pending';
    this.customerId = input.customerId;
    this.#createdAt = Date.now();
    Object.freeze(this);
  }

  get createdAt(): Date {
    return new Date(this.#createdAt);
  }

  get updatedAt(): Date {
    return new Date(this.#createdAt);
  }

  static create(input: CreatePaymentData): Payment {
    const reference = Payment.normalizeReference(input.reference);
    const customerId = input.customerId.trim();

    if (!reference || !customerId) {
      throw new ValidationError('La referencia y el cliente son obligatorios');
    }
    if (!Number.isFinite(input.amount) || input.amount <= 0) {
      throw new ValidationError('El monto debe ser un número finito mayor que cero');
    }

    return new Payment({ reference, amount: input.amount, customerId });
  }

  static normalizeReference(reference: string): string {
    return reference.trim();
  }

  toJSON() {
    return {
      id: this.id,
      reference: this.reference,
      amount: this.amount,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      customerId: this.customerId,
    };
  }
}
