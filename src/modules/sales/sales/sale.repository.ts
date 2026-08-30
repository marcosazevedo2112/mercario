import {Op, Transaction} from 'sequelize';
import Sale from './entities/sale.model';
import SaleItem from './entities/sale-item.model';
import Installment from './entities/installment.model';
import Settlement from './entities/settlement.model';
import Customer from '../../customers/customer.model';
import {SaleStatus} from './enums/sale-status';
import {InstallmentStatus} from './enums/installment-status';
import {PaymentMethod} from './enums/payment-method';
import {PaymentModality} from './enums/payment-modality';

type SaleWithRelations = Sale & {items: SaleItem[]; installments: Installment[]; settlement?: Settlement | null; customer?: Customer | null};
type Receivable = Installment & {sale: Sale & {customer: Customer | null}};
interface CreateSaleData {
  sale: {tenantId: number; customerId: number; subtotalCents: number; discountCents: number; totalCents: number; paymentMethod: PaymentMethod; installments: number; initialDueDate: Date; modality: PaymentModality; notes: string | null; status: SaleStatus; createdBy: number; confirmedAt: Date};
  items: Array<{tenantId: number; productId: number; productName: string; quantity: number; unitPriceCents: number; subtotalCents: number}>;
  installments: Array<{tenantId: number; number: number; amountCents: number; paidAmountCents: number; dueDate: Date; status: InstallmentStatus; paidAt: Date | null; settlementId: number | null; notes: string | null}>;
}
const includes = [
  {model: SaleItem, as: 'items'},
  {model: Installment, as: 'Saleinstallments'},
  {model: Settlement, as: 'settlement'},
  {model: Customer, as: 'customer'},
];
const SaleRepository = {
  create: async (data: CreateSaleData, transaction: Transaction): Promise<Sale> => {
    const sale = await Sale.create(data.sale, {transaction});
    await SaleItem.bulkCreate(data.items.map(item => ({...item, saleId: sale.id})), {transaction});
    await Installment.bulkCreate(data.installments.map(item => ({...item, saleId: sale.id})), {transaction});
    return sale;
  },
  findById: async (saleId: number, tenantId: number, transaction?: Transaction): Promise<SaleWithRelations | null> => Sale.findOne({where: {id: saleId, tenantId}, include: includes, transaction}) as Promise<SaleWithRelations | null>,
  findMany: async (tenantId: number, options: {page: number; limit: number; status?: SaleStatus; customerId?: number; search?: string}) => {
    const where: Record<string, unknown> = {tenantId};
    if (options.status) where.status = options.status;
    if (options.customerId) where.customerId = options.customerId;
    if (options.search) {
      const saleId = Number(options.search);
      where.id = Number.isInteger(saleId) && saleId > 0 ? {[Op.eq]: saleId} : {[Op.eq]: -1};
    }
    const offset = (options.page - 1) * options.limit;
    const result = await Sale.findAndCountAll({where, limit: options.limit, offset, order: [['createdAt', 'DESC']], include: includes, distinct: true});
    return {rows: result.rows as SaleWithRelations[], count: result.count};
  },
  findReceivables: async ({tenantId, from, to}: {tenantId: number; from: string; to: string}): Promise<Receivable[]> => Installment.findAll({
    where: {tenantId, dueDate: {[Op.between]: [from, to]}, status: InstallmentStatus.PENDING},
    include: [{model: Sale, as: 'sale', required: true, where: {tenantId}, include: [{model: Customer, as: 'customer', required: false}]}],
    order: [['dueDate', 'ASC']],
  }) as Promise<Receivable[]>,
  cancel: async (saleId: number, tenantId: number, canceledBy: number, cancelReason: string, transaction: Transaction): Promise<void> => {
    const [updated] = await Sale.update({status: SaleStatus.CANCELED, canceledAt: new Date(), canceledBy, cancelReason}, {where: {id: saleId, tenantId, status: SaleStatus.OPEN}, transaction});
    if (updated !== 1) throw new Error('A venda não pôde ser cancelada');
    await Installment.update({status: InstallmentStatus.CANCELED}, {where: {saleId, tenantId, status: InstallmentStatus.PENDING}, transaction});
  },
  registerPayment: async (installmentId: number, saleId: number, tenantId: number, paidAt: Date, transaction: Transaction): Promise<{installment: Installment; saleCompleted: boolean}> => {
    const installment = await Installment.findOne({where: {id: installmentId, saleId, tenantId, status: InstallmentStatus.PENDING}, transaction, lock: transaction.LOCK.UPDATE});
    if (!installment) throw new Error('Parcela não encontrada ou não está pendente');
    const [updated] = await Installment.update({status: InstallmentStatus.PAID, paidAmountCents: installment.amountCents, paidAt}, {where: {id: installmentId, saleId, tenantId, status: InstallmentStatus.PENDING}, transaction});
    if (updated !== 1) throw new Error('A parcela já foi encerrada');
    const pending = await Installment.count({where: {saleId, tenantId, status: InstallmentStatus.PENDING}, transaction});
    const saleCompleted = pending === 0;
    if (saleCompleted) await Sale.update({status: SaleStatus.COMPLETED}, {where: {id: saleId, tenantId, status: SaleStatus.OPEN}, transaction});
    await installment.reload({transaction});
    return {installment, saleCompleted};
  },
  settle: async (saleId: number, tenantId: number, settlementId: number, transaction: Transaction): Promise<void> => {
    await Installment.update({status: InstallmentStatus.SETTLED, settlementId}, {where: {saleId, tenantId, status: InstallmentStatus.PENDING}, transaction});
    const [updated] = await Sale.update({status: SaleStatus.COMPLETED}, {where: {id: saleId, tenantId, status: SaleStatus.OPEN}, transaction});
    if (updated !== 1) throw new Error('A venda não pôde ser finalizada');
  },
};
export default SaleRepository;
export type {CreateSaleData, SaleWithRelations, Receivable};
