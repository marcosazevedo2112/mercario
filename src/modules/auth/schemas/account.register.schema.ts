import {z} from 'zod';

export const registerAccountSchema = z.object({
  tenantName: z
    .string()
    .min(2, 'Nome da empresa deve ter pelo menos 2 caracteres')
    .max(100, 'Nome da empresa muito longo'),

  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome muito longo'),

  email: z.string().email('E-mail inválido').max(255, 'E-mail muito longo'),

  password: z
    .string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .max(100, 'Senha muito longa'),
});

export type AccountDTO = z.infer<typeof registerAccountSchema>;
