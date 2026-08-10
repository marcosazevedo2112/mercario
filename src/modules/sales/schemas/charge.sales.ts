import {z} from 'zod';
import {ChargeChannel} from '../sales/enums/charge-channel';
import {ChargeTrigger} from '../sales/enums/charge-trigger';

export const createChargeSchema = z.object({
  channel: z.nativeEnum(ChargeChannel),
  triggeredBy: z.nativeEnum(ChargeTrigger),
  message: z.string().trim().min(1).max(5000),
});

export type CreateChargeDTO = z.infer<typeof createChargeSchema>;
