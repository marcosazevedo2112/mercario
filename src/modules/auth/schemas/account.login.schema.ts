import {z} from 'zod';

export const loginAccountSchema = z.object({
  email: z.string().email('E-mail inválido').max(255, 'E-mail muito longo'),

  password: z
    .string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .max(100, 'Senha muito longa'),
});

export type LoginDTO = z.infer<typeof loginAccountSchema>;
