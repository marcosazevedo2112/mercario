import {z} from 'zod';

export const getOneProductSchema = z.object({
  id: z.coerce
    .number({
      error: 'ID deve ser um número',
    })
    .int('ID precisa ser um número inteiro')
    .positive('ID deve ser maior que zero'),
});

export type CreateProductDTO = z.infer<typeof getOneProductSchema>;
