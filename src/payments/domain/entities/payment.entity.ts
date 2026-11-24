import { ValidationError } from '../../../shared/domain/errors/domain.errors.ts';

const paymentStatuses = ['pending', 'completed', 'failed'] as const;
export type PaymentStatus = (typeof paymentStatuses)[number];

export interface CreatePaymentData {
  reference: string;
  amount: number;
  customerId: string;
}

export interface RestorePaymentData extends CreatePaymentData {
  id: string;
  status: PaymentStatus;
  createdAt: Date;
}

export class Payment {
  readonly id: string;
  readonly reference: string;
  readonly amount: number;
  readonly status: PaymentStatus;
  readonly customerId: string;
  readonly #createdAt: number;

  private constructor(input: RestorePaymentData) {
    this.id = input.id;
    this.reference = input.reference;
    this.amount = input.amount;
    this.status = input.status;
    this.customerId = input.customerId;
    this.#createdAt = input.createdAt.getTime();
    Object.freeze(this);
  }

  get createdAt(): Date {
    return new Date(this.#createdAt);
  }

  get updatedAt(): Date {
    return new Date(this.#createdAt);
  }

  static create(input: CreatePaymentData): Payment {
    const data = Payment.validate(input);
    return new Payment({
      ...data,
      id: globalThis.crypto.randomUUID(),
      status: 'pending',
      createdAt: new Date(),
    });
  }

  static restore({ id, status, createdAt, ...input }: RestorePaymentData): Payment {
    if (!paymentStatuses.includes(status)) {
      throw new ValidationError('El estado del pago es inválido');
    }
    if (!Number.isFinite(createdAt.getTime())) {
      throw new ValidationError('La fecha de creación del pago es inválida');
    }
    return new Payment({ ...Payment.validate(input), id, status, createdAt });
  }

  private static validate(input: CreatePaymentData): CreatePaymentData {
    const reference = Payment.normalizeReference(input.reference);
    const customerId = input.customerId.trim();

    if (!reference || !customerId) {
      throw new ValidationError('La referencia y el cliente son obligatorios');
    }
    if (!Number.isFinite(input.amount) || input.amount <= 0) {
      throw new ValidationError('El monto debe ser un número finito mayor que cero');
    }

    return { reference, amount: input.amount, customerId };
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
