import {Transaction} from 'sequelize';
import Charge from './entities/charge.model';
import {ChargeChannel} from './enums/charge-channel';
import {ChargeTrigger} from './enums/charge-trigger';

interface CreateChargeData {
  installmentId: number;
  tenantId: number;
  sentBy: number | 'system';
  triggeredBy: ChargeTrigger;
  channel: ChargeChannel;
  message: string;
}

const ChargeRepository = {
  create: async (data: CreateChargeData, transaction?: Transaction) =>
    Charge.create(data, {transaction}),
  findManyByInstallment: async (installmentId: number, tenantId: number) =>
    Charge.findAll({where: {installmentId, tenantId}, order: [['createdAt', 'DESC']]}),
};

export default ChargeRepository;
