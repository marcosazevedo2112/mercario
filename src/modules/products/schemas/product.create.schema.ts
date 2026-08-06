import {z} from 'zod';

export const createProductSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome do produto deve ter pelo menos 2 caracteres')
    .max(150, 'Nome do produto muito longo'),

  description: z
    .string()
    .max(500, 'Descrição muito longa')
    .optional()
    .nullable(),

  priceCents: z
    .number({
      error: 'Preço deve ser um número',
    })
    .int('Preço deve ser informado em centavos')
    .positive('Preço deve ser maior que zero'),

  costPriceCents: z
    .number({
      error: 'Preço de custo deve ser um número',
    })
    .int('Preço de custo deve ser informado em centavos')
    .nonnegative('Preço de custo não pode ser negativo'),
});

export type CreateProductDTO = z.infer<typeof createProductSchema>;
