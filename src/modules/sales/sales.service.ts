import sequelize from '../../database/connection';
import {AppError} from '../../errors/appError';
import Customer from '../customers/customer.model';
import Product from '../products/product.model';
import SaleRepository, {CreateSaleData} from './sales/sale.repository';
import {PaymentPlan} from './sales/value-objects/payment-plan';
import {SaleStatus} from './sales/enums/sale-status';
import {InstallmentStatus} from './sales/enums/installment-status';
import {CreateSaleDTO} from './schemas/create.sales';
import SettlementService from './sales/settlement.service';
import {PaymentMethod} from './sales/enums/payment-method';
import {SaleAggregate} from './sales/sale.aggregate';

const SalesService = {
  create: async (data: CreateSaleDTO, tenantId: number, createdBy: number) => {
    const customer = await Customer.findOne({
      where: {id: data.customerId, tenantId, active: true},
    });
    if (!customer) throw new AppError('Cliente não encontrado', 404);

    const productIds = data.items.map(item => item.productId);
    const uniqueProductIds = [...new Set(productIds)];
    const products = await Product.findAll({
      where: {id: uniqueProductIds, tenantId, active: true},
    });
    if (products.length !== uniqueProductIds.length)
      throw new AppError('Um ou mais produtos não foram encontrados', 404);

    const productMap = new Map(products.map(product => [product.id, product]));
    const sale = new SaleAggregate(
      tenantId,
      customer.id,
      createdBy,
      data.notes ?? null,
    );

    for (const item of data.items) {
      const product = productMap.get(item.productId);
      if (!product)
        throw new AppError(`Produto ${item.productId} não encontrado`, 404);
      sale.addItem({
        tenantId,
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        unitPriceCents: product.priceCents,
        subtotalCents: product.priceCents * item.quantity,
      });
    }

    sale.setDiscount(data.discountCents);
    sale.setPaymentPlan(
      PaymentPlan.create({
        initialDueDate: new Date(data.paymentPlan.initialDueDate),
        installments: data.paymentPlan.installments,
        modality: data.paymentPlan.modality,
        paymentMethod: data.paymentPlan.paymentMethod,
      }),
    );

    const confirmed = sale.confirm();
    const createData: CreateSaleData = {
      sale: confirmed.sale,
      items: confirmed.items,
      installments: confirmed.installments.map(installment => ({
        tenantId,
        number: installment.number,
        amountCents: installment.amountCents,
        paidAmountCents: installment.paidAmountCents,
        dueDate: installment.dueDate,
        status: InstallmentStatus.PENDING,
        paidAt: null,
        settlementId: null,
        notes: null,
      })),
    };

    return sequelize.transaction(transaction =>
      SaleRepository.create(createData, transaction),
    );
  },

  findById: async (saleId: number, tenantId: number) => {
    const sale = await SaleRepository.findById(saleId, tenantId);
    if (!sale) throw new AppError('Venda não encontrada', 404);
    return sale;
  },

  findMany: async (
    tenantId: number,
    options: {
      page: number;
      limit: number;
      status?: SaleStatus;
      customerId?: number;
      search?: string;
    },
  ) => {
    const result = await SaleRepository.findMany(tenantId, options);
    return {
      data: result.rows,
      pagination: {
        page: options.page,
        limit: options.limit,
        total: result.count,
        totalPages: Math.ceil(result.count / options.limit),
      },
    };
  },

  cancel: async (
    saleId: number,
    tenantId: number,
    canceledBy: number,
    cancelReason: string,
  ) => {
    const reason = cancelReason.trim();
    if (!reason)
      throw new AppError('O motivo do cancelamento é obrigatório', 400);
    const sale = await SaleRepository.findById(saleId, tenantId);
    if (!sale) throw new AppError('Venda não encontrada', 404);
    if (sale.status !== SaleStatus.OPEN)
      throw new AppError('A venda não pode ser cancelada', 400);
    await sequelize.transaction(transaction =>
      SaleRepository.cancel(saleId, tenantId, canceledBy, reason, transaction),
    );
  },

  registerPayment: async (
    installmentId: number,
    saleId: number,
    tenantId: number,
    paidAt: Date,
  ) => {
    const sale = await SaleRepository.findById(saleId, tenantId);
    if (!sale) throw new AppError('Venda não encontrada', 404);
    if (sale.status !== SaleStatus.OPEN)
      throw new AppError(
        'Não é possível registrar pagamento em uma venda encerrada',
        400,
      );
    const installment = (
      sale as unknown as {Saleinstallments: Array<{id: number; status: string}>}
    ).Saleinstallments.find(item => item.id === installmentId);
    if (!installment) throw new AppError('Parcela não encontrada', 404);
    if (installment.status !== InstallmentStatus.PENDING)
      throw new AppError('A parcela não está pendente', 400);
    await sequelize.transaction(transaction =>
      SaleRepository.registerPayment(
        installmentId,
        saleId,
        tenantId,
        paidAt,
        transaction,
      ),
    );
  },

  settle: async (
    saleId: number,
    tenantId: number,
    data: {
      discountCents: number;
      paymentMethod: PaymentMethod;
      settledBy: number | 'system';
      notes?: string | null;
    },
  ) => SettlementService.settle(saleId, tenantId, data),
};

export default SalesService;
