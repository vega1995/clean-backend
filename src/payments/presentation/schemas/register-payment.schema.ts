import z from 'zod';

export const registerPaymentSchema = z.strictObject({
  reference: z.string({ error: 'reference debe ser texto' }).trim().min(1, 'La referencia es obligatoria'),
  amount: z.number({ error: 'amount debe ser un número finito' }).positive('El monto debe ser mayor que cero'),
  customerId: z.string({ error: 'customerId debe ser texto' }).trim().min(1, 'El cliente es obligatorio'),
});

export type RegisterPaymentInput = z.infer<typeof registerPaymentSchema>;
