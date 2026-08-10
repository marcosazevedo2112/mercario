export type SaleDomainEvent =
  | {type: 'SaleCreated'; saleId: number; tenantId: number}
  | {type: 'SaleConfirmed'; saleId: number; tenantId: number}
  | {type: 'SaleCanceled'; saleId: number; tenantId: number; cancelReason: string}
  | {type: 'InstallmentPaid'; installmentId: number; saleId: number; tenantId: number}
  | {type: 'InstallmentCanceled'; installmentId: number; saleId: number; tenantId: number}
  | {type: 'InstallmentOverdueDetected'; installmentId: number; saleId: number; tenantId: number}
  | {type: 'SaleCompleted'; saleId: number; tenantId: number}
  | {type: 'SaleSettled'; saleId: number; tenantId: number; settlementId: number}
  | {type: 'ChargeSent'; chargeId: number; installmentId: number; tenantId: number};
