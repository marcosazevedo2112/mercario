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
    const totalCents = total.cents;
    const installments = paymentPlan.installments;

    const baseAmount = Math.floor(totalCents / installments);
    const remainder = totalCents % installments;

    const generated: GeneratedInstallment[] = [];

    for (let index = 0; index < installments; index++) {
      const number = index + 1;

      const amountCents =
        number === installments ? baseAmount + remainder : baseAmount;

      generated.push({
        number,
        amountCents,
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
      });
    }

    return generated;
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
      date.setDate(date.getDate() + (installmentNumber - 1) * 7);

      return date;

    case PaymentModality.MONTHLY:
      return addMonths(date, installmentNumber - 1);
  }
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date);

  const originalDay = result.getDate();

  result.setDate(1);
  result.setMonth(result.getMonth() + months);

  const lastDayOfMonth = new Date(
    result.getFullYear(),
    result.getMonth() + 1,
    0,
  ).getDate();

  result.setDate(Math.min(originalDay, lastDayOfMonth));

  return result;
}

export default InstallmentGenerationService;

export type {GeneratedInstallment};
