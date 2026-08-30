import {Op} from 'sequelize';
import Customer from './customer.model';
import {CreateCustomerDTO} from './schemas/customer.create.schema';
import {UpdateCustomerDTO} from './schemas/customer.update.schema';
import {AppError} from '../../errors/appError';

const CustomerService = {
  create: async (data: CreateCustomerDTO, tenantId: number) => {
    const customer = await Customer.create({
      ...data,
      tenantId,
    });

    return customer;
  },

  findAll: async (tenantId: number, opts?: {search?: string}) => {
    const search = opts?.search?.trim();
    const where: Record<string, unknown> = {tenantId, active: true};
    if (search) {
      const like = `%${search.replace(/[%_\\]/g, '\\$&')}%`;
      Object.assign(where, {
        [Op.or]: [
          {name: {[Op.iLike]: like}},
          {nickname: {[Op.iLike]: like}},
          {phone: {[Op.iLike]: like}},
          {email: {[Op.iLike]: like}},
        ],
      });
    }
    const customers = await Customer.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: search ? 10 : undefined,
    });

    return customers;
  },

  findById: async (id: number, tenantId: number) => {
    const customer = await Customer.findOne({
      where: {
        id,
        tenantId,
        active: true,
      },
    });

    if (!customer) {
      throw new AppError('Cliente não encontrado', 404);
    }

    return customer;
  },

  update: async (id: number, tenantId: number, data: UpdateCustomerDTO) => {
    const customer = await CustomerService.findById(id, tenantId);

    await customer.update(data);

    return customer;
  },

  delete: async (id: number, tenantId: number) => {
    const customer = await CustomerService.findById(id, tenantId);

    await customer.update({
      active: false,
    });

    return true;
  },
};

export default CustomerService;
