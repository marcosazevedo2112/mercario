import {Money} from './value-objects/money';
import {PaymentPlan} from './value-objects/payment-plan';
import {PaymentModality} from './enums/payment-modality';
import {InstallmentStatus} from './enums/installment-status';

interface GeneratedInstallment {
  number: number;
  amountCents: number;
  paidAmountCents: number;
  dueDate: Date;
  status: InstallmentStatus;
  paidAt: Date | null;
  settlementId: number | null;
  notes: string | null;
}

const InstallmentGenerationService = {
  generate: (
    total: Money,
    paymentPlan: PaymentPlan,
  ): GeneratedInstallment[] => {
    const baseAmount = Math.floor(total.cents / paymentPlan.installments);
    const remainder = total.cents % paymentPlan.installments;

    return Array.from({length: paymentPlan.installments}, (_, index) => {
      const number = index + 1;

      return {
        number,
        amountCents:
          number === paymentPlan.installments
            ? baseAmount + remainder
            : baseAmount,
        paidAmountCents: 0,
        dueDate: getDueDate(
          paymentPlan.initialDueDate,
          number,
          paymentPlan.modality,
        ),
        status: InstallmentStatus.PENDING,
        paidAt: null,
        settlementId: null,
        notes: null,
      };
    });
  },
};

function getDueDate(
  initialDueDate: Date,
  installmentNumber: number,
  modality: PaymentModality,
): Date {
  const date = new Date(initialDueDate);

  switch (modality) {
    case PaymentModality.ONCE:
      return date;

    case PaymentModality.WEEKLY:
      date.setUTCDate(date.getUTCDate() + (installmentNumber - 1) * 7);
      return date;

    case PaymentModality.MONTHLY:
      return addMonths(date, installmentNumber - 1);

    default:
      throw new Error(`Modalidade de pagamento inválida: ${String(modality)}`);
  }
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  const originalDay = result.getUTCDate();

  result.setUTCDate(1);
  result.setUTCMonth(result.getUTCMonth() + months);

  const lastDayOfMonth = new Date(
    Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0),
  ).getUTCDate();

  result.setUTCDate(Math.min(originalDay, lastDayOfMonth));

  return result;
}

export default InstallmentGenerationService;
export type {GeneratedInstallment};
