import {InferCreationAttributes, Transaction} from 'sequelize';
import Settlement from './entities/settlement.model';

interface CreateSettlementData extends Omit<InferCreationAttributes<Settlement>, 'id' | 'createdAt' | 'updatedAt'> {}

const SettlementRepository = {
  create: async (data: CreateSettlementData, transaction: Transaction) =>
    Settlement.create(data, {transaction}),
  findBySaleId: async (saleId: number, tenantId: number, transaction?: Transaction) =>
    Settlement.findOne({where: {saleId, tenantId}, transaction}),
};

export default SettlementRepository;
