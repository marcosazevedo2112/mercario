import {Transaction} from 'sequelize';
import Settlement from './entities/settlement.model';
import {PaymentMethod} from './enums/payment-method';

interface CreateSettlementData {
  saleId: number;
  tenantId: number;
  originalRemainingCents: number;
  discountCents: number;
  settledAmountCents: number;
  paymentMethod: PaymentMethod;
  settledAt: Date;
  settledBy: number | 'system';
  notes: string | null;
}

const SettlementRepository = {
  create: async (data: CreateSettlementData, transaction: Transaction) =>
    Settlement.create(data as Parameters<typeof Settlement.create>[0], {transaction}),
  findBySaleId: async (saleId: number, tenantId: number, transaction?: Transaction) =>
    Settlement.findOne({where: {saleId, tenantId}, transaction}),
};

export default SettlementRepository;
