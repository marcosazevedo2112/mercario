import {Transaction} from 'sequelize';
import Charge from './entities/charge.model';

const ChargeRepository = {
  create: async (data: object, transaction?: Transaction) => Charge.create(data, {transaction}),
  findManyByInstallment: async (installmentId: number, tenantId: number) =>
    Charge.findAll({where: {installmentId, tenantId}, order: [['createdAt', 'DESC']]}),
};

export default ChargeRepository;
