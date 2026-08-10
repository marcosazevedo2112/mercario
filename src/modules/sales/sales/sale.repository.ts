import {Transaction} from 'sequelize';

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
    tenantId: number;
    customerId: number;

    subtotalCents: number;
    discountCents: number;
    totalCents: number;

    paymentMethod: PaymentMethod;
    installments: number;
    initialDueDate: Date;
    modality: PaymentModality;

    notes: string | null;

    status: SaleStatus;
    createdBy: number;
    confirmedAt: Date;
  };

  items: Array<{
    tenantId: number;
    productId: number;
    productName: string;
    quantity: number;
    unitPriceCents: number;
    subtotalCents: number;
  }>;

  installments: Array<{
    tenantId: number;
    number: number;
    amountCents: number;
    paidAmountCents: number;
    dueDate: Date;
    status: InstallmentStatus;
    paidAt: Date | null;
    settlementId: number | null;
    notes: string | null;
  }>;
}

const SaleRepository = {
  create: async (
    data: CreateSaleData,
    transaction: Transaction,
  ): Promise<Sale> => {
    const sale = await Sale.create(data.sale, {
      transaction,
    });

    await SaleItem.bulkCreate(
      data.items.map(item => ({
        ...item,
        saleId: sale.id,
      })),
      {
        transaction,
      },
    );

    await Installment.bulkCreate(
      data.installments.map(installment => ({
        ...installment,
        saleId: sale.id,
      })),
      {
        transaction,
      },
    );

    return sale;
  },

  findById: async (
    saleId: number,
    tenantId: number,
    transaction?: Transaction,
  ): Promise<SaleWithRelations | null> => {
    return Sale.findOne({
      where: {
        id: saleId,
        tenantId,
      },
      include: [
        {
          model: SaleItem,
          as: 'items',
        },
        {
          model: Installment,
          as: 'installments',
        },
      ],
      transaction,
    }) as Promise<SaleWithRelations | null>;
  },

  cancel: async (
    saleId: number,
    tenantId: number,
    canceledBy: number,
    cancelReason: string,
    transaction: Transaction,
  ): Promise<void> => {
    await Sale.update(
      {
        status: SaleStatus.CANCELED,
        canceledAt: new Date(),
        canceledBy,
        cancelReason,
      },
      {
        where: {
          id: saleId,
          tenantId,
        },
        transaction,
      },
    );

    await Installment.update(
      {
        status: InstallmentStatus.CANCELED,
      },
      {
        where: {
          saleId,
          tenantId,
          status: InstallmentStatus.PENDING,
        },
        transaction,
      },
    );
  },

  registerPayment: async (
    installmentId: number,
    saleId: number,
    tenantId: number,
    paidAt: Date,
    transaction: Transaction,
  ): Promise<void> => {
    const installment = await Installment.findOne({
      where: {
        id: installmentId,
        saleId,
        tenantId,
        status: InstallmentStatus.PENDING,
      },
      transaction,
    });

    if (!installment) {
      throw new Error('Parcela não encontrada ou não está pendente');
    }

    await installment.update(
      {
        status: InstallmentStatus.PAID,
        paidAmountCents: installment.amountCents,
        paidAt,
      },
      {
        transaction,
      },
    );

    const pendingInstallments = await Installment.count({
      where: {
        saleId,
        tenantId,
        status: InstallmentStatus.PENDING,
      },
      transaction,
    });

    if (pendingInstallments === 0) {
      await Sale.update(
        {
          status: SaleStatus.COMPLETED,
        },
        {
          where: {
            id: saleId,
            tenantId,
            status: SaleStatus.OPEN,
          },
          transaction,
        },
      );
    }
  },
};

export default SaleRepository;

export type {CreateSaleData};
