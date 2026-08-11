import {PaymentMethod} from '../enums/payment-method';
import {PaymentModality} from '../enums/payment-modality';

export interface PaymentPlanProps {
  paymentMethod: PaymentMethod;
  installments: number;
  initialDueDate: Date;
  modality: PaymentModality;
}

export class PaymentPlan {
  public readonly paymentMethod: PaymentMethod;
  public readonly installments: number;
  public readonly initialDueDate: Date;
  public readonly modality: PaymentModality;

  private constructor(props: PaymentPlanProps) {
    this.paymentMethod = props.paymentMethod;
    this.installments = props.installments;
    this.initialDueDate = new Date(props.initialDueDate);
    this.modality = props.modality;
  }

  static create(props: PaymentPlanProps): PaymentPlan {
    if (Number.isNaN(props.initialDueDate.getTime()))
      throw new Error('A data de vencimento inicial é inválida');
    if (!Number.isInteger(props.installments) || props.installments <= 0)
      throw new Error('A quantidade de parcelas deve ser maior que zero');
    if (props.modality === PaymentModality.ONCE && props.installments !== 1)
      throw new Error('A modalidade ONCE deve possuir exatamente uma parcela');
    return new PaymentPlan(props);
  }
}
