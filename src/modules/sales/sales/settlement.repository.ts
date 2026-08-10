import {Transaction} from 'sequelize';
import Settlement from './entities/settlement.model';

const SettlementRepository = {
  create: async (data: object, transaction: Transaction) => {
    return Settlement.create(data, {transaction});
  },
  findBySaleId: async (saleId: number, tenantId: number, transaction?: Transaction) => {
    return Settlement.findOne({where: {saleId, tenantId}, transaction});
  },
};

export default SettlementRepository;
