export function formatCurrency(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('pt-BR', {timeZone: 'UTC'});
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateInput(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().slice(0, 10);
}

export const saleStatusLabel: Record<string, string> = {
  OPEN: 'Aberta',
  CANCELED: 'Cancelada',
  COMPLETED: 'Concluída',
};

export const saleStatusClass: Record<string, string> = {
  OPEN: 'bg-warning text-dark',
  CANCELED: 'bg-danger',
  COMPLETED: 'bg-success',
};

export const installmentStatusLabel: Record<string, string> = {
  PENDING: 'Pendente',
  PAID: 'Pago',
  SETTLED: 'Quitado',
  CANCELED: 'Cancelado',
};

export const installmentStatusClass: Record<string, string> = {
  PENDING: 'bg-warning text-dark',
  PAID: 'bg-success',
  SETTLED: 'bg-info text-dark',
  CANCELED: 'bg-secondary',
};

export const paymentMethodLabel: Record<string, string> = {
  PIX: 'PIX',
  BOLETO: 'Boleto',
  CREDIT_CARD: 'Cartão de crédito',
  DEBIT_CARD: 'Cartão de débito',
  CASH: 'Dinheiro',
};

export const paymentModalityLabel: Record<string, string> = {
  ONCE: 'À vista',
  WEEKLY: 'Semanal',
  MONTHLY: 'Mensal',
};

export const chargeChannelLabel: Record<string, string> = {
  WHATSAPP: 'WhatsApp',
  EMAIL: 'E-mail',
};

export const chargeTriggerLabel: Record<string, string> = {
  MANUAL: 'Manual',
  AUTOMATIC: 'Automático',
};
