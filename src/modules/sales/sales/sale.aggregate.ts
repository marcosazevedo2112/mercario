import {PaymentPlan} from './value-objects/payment-plan';
import {Money} from './value-objects/money';
import InstallmentGenerationService, {
  GeneratedInstallment,
} from './installment-generation.service';
import {SaleStatus} from './enums/sale-status';

export interface SaleItemSnapshot {
  tenantId: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPriceCents: number;
  subtotalCents: number;
}

export interface ConfirmedSale {
  sale: {
    tenantId: number;
    customerId: number;
    subtotalCents: number;
    discountCents: number;
    totalCents: number;
    paymentMethod: PaymentPlan['paymentMethod'];
    installments: number;
    initialDueDate: Date;
    modality: PaymentPlan['modality'];
    notes: string | null;
    status: SaleStatus;
    createdBy: number;
    confirmedAt: Date;
  };
  items: SaleItemSnapshot[];
  installments: GeneratedInstallment[];
}

export class SaleAggregate {
  private readonly items: SaleItemSnapshot[] = [];
  private discountCents = 0;
  private paymentPlan: PaymentPlan | null = null;
  private confirmed = false;

  constructor(
    private readonly tenantId: number,
    private readonly customerId: number,
    private readonly createdBy: number,
    private readonly notes: string | null,
  ) {}

  addItem(item: SaleItemSnapshot): void {
    this.ensureBuilding();
    if (item.quantity <= 0 || !Number.isInteger(item.quantity))
      throw new Error('A quantidade do item deve ser positiva');
    this.items.push(item);
  }

  removeItem(productId: number): void {
    this.ensureBuilding();
    const index = this.items.findIndex(item => item.productId === productId);
    if (index >= 0) this.items.splice(index, 1);
  }

  setPaymentPlan(paymentPlan: PaymentPlan): void {
    this.ensureBuilding();
    this.paymentPlan = paymentPlan;
  }

  setDiscount(discountCents: number): void {
    this.ensureBuilding();
    if (!Number.isInteger(discountCents) || discountCents < 0)
      throw new Error('O desconto deve ser um valor inteiro não negativo');
    if (discountCents > this.subtotalCents())
      throw new Error('O desconto não pode ser maior que o subtotal');
    this.discountCents = discountCents;
  }

  confirm(): ConfirmedSale {
    this.ensureBuilding();
    if (this.items.length === 0)
      throw new Error('A venda deve possuir ao menos um item');
    if (!this.paymentPlan)
      throw new Error('O plano de pagamento é obrigatório');

    this.confirmed = true;
    const totalCents = this.subtotalCents() - this.discountCents;
    const generated = InstallmentGenerationService.generate(
      Money.fromCents(totalCents),
      this.paymentPlan,
    );

    return {
      sale: {
        tenantId: this.tenantId,
        customerId: this.customerId,
        subtotalCents: this.subtotalCents(),
        discountCents: this.discountCents,
        totalCents,
        paymentMethod: this.paymentPlan.paymentMethod,
        installments: this.paymentPlan.installments,
        initialDueDate: this.paymentPlan.initialDueDate,
        modality: this.paymentPlan.modality,
        notes: this.notes,
        status: SaleStatus.OPEN,
        createdBy: this.createdBy,
        confirmedAt: new Date(),
      },
      items: [...this.items],
      installments: generated,
    };
  }

  private subtotalCents(): number {
    return this.items.reduce((total, item) => total + item.subtotalCents, 0);
  }

  private ensureBuilding(): void {
    if (this.confirmed)
      throw new Error('A venda já foi confirmada e não pode mais ser alterada');
  }
}
