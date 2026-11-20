import z from 'zod';

export const registerProductSchema = z.strictObject({
  name: z.string({ error: 'name debe ser texto' }),
  cost: z.number({ error: 'cost debe ser un número finito' }),
  price: z.number({ error: 'price debe ser un número finito' }),
  stock: z.number({ error: 'stock debe ser un número finito' }),
  description: z.string({ error: 'description debe ser texto' }),
  category: z.string({ error: 'category debe ser texto' }),
  images: z.array(z.string({ error: 'Cada imagen debe ser texto' }), { error: 'images debe ser un arreglo' }).optional(),
});

export type RegisterProductInput = z.infer<typeof registerProductSchema>;
