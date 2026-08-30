import {Router} from 'express';
import {requireAuth} from '../../modules/shared/middlewares/pageAuth';
import {renderPage} from '../../utils/view';
import Installment from '../../modules/sales/sales/entities/installment.model';
import Customer from '../../modules/customers/customer.model';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const tenantId = req.session.user!.tenantId;

    const installments = await Installment.findAll({
      where: {tenantId},
      order: [['dueDate', 'ASC']],
      include: [{association: 'sale'}],
    }).catch(() => [] as Installment[]);

    // Batch load customers for sale -> customerName
    const saleRows = installments.map(i => (i as unknown as {sale?: Record<string, unknown>}).sale).filter(Boolean) as Record<string, unknown>[];
    const customerIds = [...new Set(saleRows.map(s => Number(s.customerId)).filter(n => Number.isInteger(n) && n > 0))];
    const customers = customerIds.length ? await Customer.findAll({where: {id: customerIds, tenantId}}) : [];
    const customerMap = new Map<number, string>(customers.map(c => [Number((c as unknown as {id: number}).id), String((c as unknown as {name: string}).name)]));

    const today = new Date().toISOString().slice(0, 10);

    const data = installments.map(inst => {
      const raw = inst as unknown as Record<string, unknown>;
      const sale = (raw.sale as Record<string, unknown> | undefined) || null;
      const dueRaw = raw.dueDate as unknown;
      const dueDate = String(dueRaw).slice(0, 10);
      const customerName = sale ? (customerMap.get(Number(sale.customerId)) || `Cliente #${sale.customerId}`) : '—';
      return {
        id: Number(raw.id),
        saleId: Number(raw.saleId),
        number: Number(raw.number),
        amountCents: Number(raw.amountCents),
        dueDate,
        status: String(raw.status),
        paymentMethod: sale ? String(sale.paymentMethod) : 'PIX',
        modality: sale ? String(sale.modality) : 'MONTHLY',
        saleInstallments: sale ? Number(sale.installments) : 1,
        customerName,
        saleStatus: sale ? String(sale.status) : 'OPEN',
      };
    });

    renderPage(res, 'installments/index', {
      title: 'Parcelas',
      installments: data,
      today,
      installmentsJson: JSON.stringify(data),
    });
  } catch (e) {
    console.error(e);
    renderPage(res, 'installments/index', {
      title: 'Parcelas',
      installments: [],
      today: new Date().toISOString().slice(0, 10),
      installmentsJson: '[]',
      error: 'Não foi possível carregar as parcelas. Tente novamente.',
    });
  }
});

export default router;
