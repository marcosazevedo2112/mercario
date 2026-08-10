import {Transaction} from 'sequelize';
import Charge from './entities/charge.model';

interface CreateChargeData {
  installmentId: number;
  tenantId: number;
  sentBy: number | 'system';
  triggeredBy: Charge['prototype']['triggeredBy'];
  channel: Charge['prototype']['channel'];
  message: string;
}

const ChargeRepository = {
  create: async (data: CreateChargeData, transaction?: Transaction) =>
    Charge.create(data as Parameters<typeof Charge.create>[0], {transaction}),
  findManyByInstallment: async (installmentId: number, tenantId: number) =>
    Charge.findAll({where: {installmentId, tenantId}, order: [['createdAt', 'DESC']]}),
};

export default ChargeRepository;
