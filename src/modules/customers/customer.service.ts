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

  findAll: async (tenantId: number) => {
    const customers = await Customer.findAll({
      where: {
        tenantId,
        active: true,
      },
      order: [['createdAt', 'DESC']],
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
