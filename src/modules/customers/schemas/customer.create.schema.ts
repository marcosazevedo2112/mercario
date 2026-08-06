import {z} from 'zod';

export const createCustomerSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome do cliente deve ter pelo menos 2 caracteres')
    .max(150, 'Nome do cliente muito longo'),

  nickname: z.string().max(150, 'Apelido muito longo').optional().nullable(),

  phone: z.string().max(30, 'Telefone muito longo').optional().nullable(),

  email: z
    .email('E-mail inválido')
    .max(180, 'E-mail muito longo')
    .optional()
    .nullable(),

  address: z.string().max(500, 'Endereço muito longo').optional().nullable(),

  notes: z.string().max(1000, 'Observações muito longas').optional().nullable(),
});

export type CreateCustomerDTO = z.infer<typeof createCustomerSchema>;
