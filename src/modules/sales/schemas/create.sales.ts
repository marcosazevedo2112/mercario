import {z} from 'zod';

import {PaymentMethod} from '../sales/enums/payment-method';
import {PaymentModality} from '../sales/enums/payment-modality';

export const createSaleSchema = z.object({
  customerId: z.number().int().positive(),

  items: z
    .array(
      z.object({
        productId: z.number().int().positive(),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1),

  discountCents: z.number().int().nonnegative(),

  paymentPlan: z.object({
    paymentMethod: z.nativeEnum(PaymentMethod),

    installments: z.number().int().positive(),

    initialDueDate: z.string().datetime(),

    modality: z.nativeEnum(PaymentModality),
  }),

  notes: z.string().optional(),
});

export type CreateSaleDTO = z.infer<typeof createSaleSchema>;
