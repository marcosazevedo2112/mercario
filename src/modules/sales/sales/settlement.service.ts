import sequelize from '../../../database/connection';
import {AppError} from '../../../errors/appError';
import SaleRepository from './sale.repository';
import SettlementRepository from './settlement.repository';
import {SaleStatus} from './enums/sale-status';
import {InstallmentStatus} from './enums/installment-status';
import {PaymentMethod} from './enums/payment-method';

interface SettleData {
  discountCents: number;
  paymentMethod: PaymentMethod;
  settledBy: number | 'system';
  notes?: string | null;
}

const SettlementService = {
  settle: async (saleId: number, tenantId: number, data: SettleData) => {
    const sale = await SaleRepository.findById(saleId, tenantId);
    if (!sale) throw new AppError('Venda não encontrada', 404);
    if (sale.status !== SaleStatus.OPEN)
      throw new AppError('A venda não pode ser quitada', 400);

    const remaining = (
      sale as unknown as {Saleinstallments: Array<{status: string; amountCents: number}>}
    ).Saleinstallments.filter(item => item.status === InstallmentStatus.PENDING).reduce(
      (sum, item) => sum + item.amountCents,
      0,
    );

    if (remaining <= 0)
      throw new AppError('A venda não possui saldo pendente', 400);
    if (data.discountCents < 0 || data.discountCents > remaining) {
      throw new AppError('O desconto da quitação é inválido', 400);
    }

    const settledAmountCents = remaining - data.discountCents;

    return sequelize.transaction(async transaction => {
      const existing = await SettlementRepository.findBySaleId(
        saleId,
        tenantId,
        transaction,
      );
      if (existing) throw new AppError('A venda já possui uma quitação', 400);

      const settlement = await SettlementRepository.create(
        {
          saleId,
          tenantId,
          originalRemainingCents: remaining,
          discountCents: data.discountCents,
          settledAmountCents,
          paymentMethod: data.paymentMethod,
          settledAt: new Date(),
          settledBy: data.settledBy,
          notes: data.notes ?? null,
        },
        transaction,
      );

      await SaleRepository.settle(saleId, tenantId, settlement.id, transaction);
      return settlement;
    });
  },
};

export default SettlementService;
