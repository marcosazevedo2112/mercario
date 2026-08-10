import {z} from 'zod';
import {PaymentMethod} from '../sales/enums/payment-method';
import {PaymentModality} from '../sales/enums/payment-modality';

export const createSaleSchema = z.object({
  customerId: z.number().int().positive(),
  items: z.array(z.object({productId: z.number().int().positive(), quantity: z.number().int().positive()})).min(1),
  discountCents: z.number().int().nonnegative(),
  paymentPlan: z.object({
    paymentMethod: z.nativeEnum(PaymentMethod),
    installments: z.number().int().positive(),
    initialDueDate: z.string().datetime(),
    modality: z.nativeEnum(PaymentModality),
  }),
  notes: z.string().trim().max(500).optional(),
});

export const cancelSaleSchema = z.object({
  reason: z.string().trim().min(1).max(500),
});

export const settleSaleSchema = z.object({
  discountCents: z.number().int().nonnegative().default(0),
  paymentMethod: z.nativeEnum(PaymentMethod),
  notes: z.string().trim().max(500).optional(),
});

export type CreateSaleDTO = z.infer<typeof createSaleSchema>;
export type SettleSaleDTO = z.infer<typeof settleSaleSchema>;
