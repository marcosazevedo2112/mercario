import {Op, Transaction} from 'sequelize';

import Sale from './entities/sale.model';
import SaleItem from './entities/sale-item.model';
import Installment from './entities/installment.model';

import {SaleStatus} from './enums/sale-status';
import {InstallmentStatus} from './enums/installment-status';
import {PaymentMethod} from './enums/payment-method';
import {PaymentModality} from './enums/payment-modality';

type SaleWithRelations = Sale & {
  items: SaleItem[];
  installments: Installment[];
};

interface CreateSaleData {
  sale: {
    tenantId: number; customerId: number; subtotalCents: number;
    discountCents: number; totalCents: number; paymentMethod: PaymentMethod;
    installments: number; initialDueDate: Date; modality: PaymentModality;
    notes: string | null; status: SaleStatus; createdBy: number; confirmedAt: Date;
  };
  items: Array<{tenantId: number; productId: number; productName: string; quantity: number; unitPriceCents: number; subtotalCents: number}>;
  installments: Array<{tenantId: number; number: number; amountCents: number; paidAmountCents: number; dueDate: Date; status: InstallmentStatus; paidAt: Date | null; settlementId: number | null; notes: string | null}>;
}

const SaleRepository = {
  create: async (data: CreateSaleData, transaction: Transaction): Promise<Sale> => {
    const sale = await Sale.create(data.sale, {transaction});
    await SaleItem.bulkCreate(data.items.map(item => ({...item, saleId: sale.id})), {transaction});
    await Installment.bulkCreate(data.installments.map(item => ({...item, saleId: sale.id})), {transaction});
    return sale;
  },

  findById: async (saleId: number, tenantId: number, transaction?: Transaction): Promise<SaleWithRelations | null> =>
    Sale.findOne({where: {id: saleId, tenantId}, include: [{model: SaleItem, as: 'items'}, {model: Installment, as: 'installments'}], transaction}) as Promise<SaleWithRelations | null>,

  findMany: async (tenantId: number, options: {page: number; limit: number; status?: SaleStatus; customerId?: number; search?: string}) => {
    const where: Record<string, unknown> = {tenantId};
    if (options.status) where.status = options.status;
    if (options.customerId) where.customerId = options.customerId;
    if (options.search) where.id = {[Op.like]: `%${options.search}%`};

    const offset = (options.page - 1) * options.limit;
    const result = await Sale.findAndCountAll({where, limit: options.limit, offset, order: [['createdAt', 'DESC']], include: [{model: SaleItem, as: 'items'}, {model: Installment, as: 'installments'}]});
    return {rows: result.rows as SaleWithRelations[], count: result.count};
  },

  cancel: async (saleId: number, tenantId: number, canceledBy: number, cancelReason: string, transaction: Transaction): Promise<void> => {
    const [updated] = await Sale.update({status: SaleStatus.CANCELED, canceledAt: new Date(), canceledBy, cancelReason}, {where: {id: saleId, tenantId, status: SaleStatus.OPEN}, transaction});
    if (updated !== 1) throw new Error('A venda não pôde ser cancelada');
    await Installment.update({status: InstallmentStatus.CANCELED}, {where: {saleId, tenantId, status: {[Op.in]: [InstallmentStatus.PENDING, InstallmentStatus.PAID]}}, transaction});
  },

  registerPayment: async (installmentId: number, saleId: number, tenantId: number, paidAt: Date, transaction: Transaction): Promise<void> => {
    const [updated] = await Installment.update({status: InstallmentStatus.PAID, paidAmountCents: SaleRepository.amountFromInstallment(installmentId, transaction), paidAt}, {where: {id: installmentId, saleId, tenantId, status: InstallmentStatus.PENDING}, transaction});
    if (updated !== 1) throw new Error('Parcela não encontrada ou não está pendente');

    const pending = await Installment.count({where: {saleId, tenantId, status: InstallmentStatus.PENDING}, transaction});
    if (pending === 0) await Sale.update({status: SaleStatus.COMPLETED}, {where: {id: saleId, tenantId, status: SaleStatus.OPEN}, transaction});
  },

  amountFromInstallment: async (installmentId: number, transaction: Transaction): Promise<number> => {
    const installment = await Installment.findByPk(installmentId, {transaction, lock: transaction.LOCK.UPDATE});
    if (!installment) throw new Error('Parcela não encontrada');
    return installment.amountCents;
  },

  settle: async (saleId: number, tenantId: number, settlementId: number, transaction: Transaction): Promise<void> => {
    await Installment.update({status: InstallmentStatus.SETTLED, settlementId}, {where: {saleId, tenantId, status: InstallmentStatus.PENDING}, transaction});
    const [updated] = await Sale.update({status: SaleStatus.COMPLETED}, {where: {id: saleId, tenantId, status: SaleStatus.OPEN}, transaction});
    if (updated !== 1) throw new Error('A venda não pôde ser finalizada');
  },
};

export default SaleRepository;
export type {CreateSaleData};
export type {SaleWithRelations};
