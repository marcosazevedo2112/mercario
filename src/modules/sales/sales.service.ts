import sequelize from '../../database/connection';
import {AppError} from '../../errors/appError';

import Customer from '../customers/customer.model';
import Product from '../products/product.model';

import SaleRepository, {CreateSaleData} from './sales/sale.repository';

import InstallmentGenerationService from './sales/installment-generation.service';

import {Money} from './sales/value-objects/money';
import {PaymentPlan} from './sales/value-objects/payment-plan';

import {SaleStatus} from './sales/enums/sale-status';
import {InstallmentStatus} from './sales/enums/installment-status';

import {CreateSaleDTO} from './schemas/create.sales';

const SalesService = {
  create: async (data: CreateSaleDTO, tenantId: number, createdBy: number) => {
    const customer = await Customer.findOne({
      where: {
        id: data.customerId,
        tenantId,
        active: true,
      },
    });

    if (!customer) {
      throw new AppError('Cliente não encontrado', 404);
    }

    const productIds = data.items.map(item => item.productId);

    const products = await Product.findAll({
      where: {
        id: productIds,
        tenantId,
        active: true,
      },
    });

    if (products.length !== productIds.length) {
      throw new AppError('Um ou mais produtos não foram encontrados', 404);
    }

    const productMap = new Map(products.map(product => [product.id, product]));

    const items = data.items.map(item => {
      const product = productMap.get(item.productId);

      if (!product) {
        throw new AppError(`Produto ${item.productId} não encontrado`, 404);
      }

      const subtotalCents = product.priceCents * item.quantity;

      return {
        tenantId,
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        unitPriceCents: product.priceCents,
        subtotalCents,
      };
    });

    const subtotalCents = items.reduce(
      (total, item) => total + item.subtotalCents,
      0,
    );

    if (data.discountCents > subtotalCents) {
      throw new AppError('O desconto não pode ser maior que o subtotal', 400);
    }

    const totalCents = subtotalCents - data.discountCents;

    const money = Money.fromCents(totalCents);

    const paymentPlan = PaymentPlan.create({
      initialDueDate: new Date(data.paymentPlan.initialDueDate),
      installments: data.paymentPlan.installments,
      modality: data.paymentPlan.modality,
      paymentMethod: data.paymentPlan.paymentMethod,
    });

    const generatedInstallments =
      totalCents > 0
        ? InstallmentGenerationService.generate(money, paymentPlan)
        : [];

    const status = totalCents === 0 ? SaleStatus.COMPLETED : SaleStatus.OPEN;

    const createData: CreateSaleData = {
      sale: {
        tenantId,
        customerId: customer.id,

        subtotalCents,
        discountCents: data.discountCents,
        totalCents,

        paymentMethod: paymentPlan.paymentMethod,
        installments: paymentPlan.installments,
        initialDueDate: paymentPlan.initialDueDate,
        modality: paymentPlan.modality,

        notes: data.notes ?? null,

        status,
        createdBy,
        confirmedAt: new Date(),
      },

      items,

      installments: generatedInstallments.map(installment => ({
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

    return sequelize.transaction(async transaction => {
      return SaleRepository.create(createData, transaction);
    });
  },

  findById: async (saleId: number, tenantId: number) => {
    const sale = await SaleRepository.findById(saleId, tenantId);

    if (!sale) {
      throw new AppError('Venda não encontrada', 404);
    }

    return sale;
  },

  cancel: async (
    saleId: number,
    tenantId: number,
    canceledBy: number,
    cancelReason: string,
  ) => {
    const sale = await SaleRepository.findById(saleId, tenantId);

    if (!sale) {
      throw new AppError('Venda não encontrada', 404);
    }

    if (sale.status !== SaleStatus.OPEN) {
      throw new AppError('A venda não pode ser cancelada', 400);
    }

    return sequelize.transaction(async transaction => {
      await SaleRepository.cancel(
        saleId,
        tenantId,
        canceledBy,
        cancelReason,
        transaction,
      );
    });
  },

  registerPayment: async (
    installmentId: number,
    saleId: number,
    tenantId: number,
    paidAt: Date,
  ) => {
    const sale = await SaleRepository.findById(saleId, tenantId);

    if (!sale) {
      throw new AppError('Venda não encontrada', 404);
    }

    if (sale.status !== SaleStatus.OPEN) {
      throw new AppError(
        'Não é possível registrar pagamento em uma venda encerrada',
        400,
      );
    }

    const installment = sale.installments.find(
      item => item.id === installmentId,
    );

    if (!installment) {
      throw new AppError('Parcela não encontrada', 404);
    }

    if (installment.status !== InstallmentStatus.PENDING) {
      throw new AppError('A parcela não está pendente', 400);
    }

    return sequelize.transaction(async transaction => {
      await SaleRepository.registerPayment(
        installmentId,
        saleId,
        tenantId,
        paidAt,
        transaction,
      );
    });
  },
};

export default SalesService;
