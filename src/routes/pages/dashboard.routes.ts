import {Router} from 'express';
import {requireAuth} from '../../modules/shared/middlewares/pageAuth';
import {renderPage} from '../../utils/view';
import SaleRepository from '../../modules/sales/sales/sale.repository';
import Customer from '../../modules/customers/customer.model';
import Product from '../../modules/products/product.model';
import {InstallmentStatus} from '../../modules/sales/sales/enums/installment-status';
import Installment from '../../modules/sales/sales/entities/installment.model';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const tenantId = req.session.user!.tenantId;
    const [customersCount, productsCount, salesResult, installments] = await Promise.all([
      Customer.count({where: {tenantId, active: true}}),
      Product.count({where: {tenantId, active: true}}),
      SaleRepository.findMany(tenantId, {page: 1, limit: 5}),
      Installment.findAll({
        where: {tenantId},
        order: [['dueDate', 'ASC']],
        limit: 20,
        include: [{association: 'sale'}],
      }).catch(() => [] as Installment[]),
    ]);

    // Try to build agenda from installments — group by dueDate
    const today = new Date().toISOString().slice(0, 10);
    const pending = installments.filter(i => (i as unknown as {status: string}).status === InstallmentStatus.PENDING);
    const paid = installments.filter(i => (i as unknown as {status: string}).status === InstallmentStatus.PAID);
    const overdue = pending.filter(i => String((i as unknown as {dueDate: unknown}).dueDate).slice(0, 10) < today);
    const pendingTotal = pending.reduce((s, i) => s + ((i as unknown as {amountCents: number}).amountCents || 0), 0);
    const overdueTotal = overdue.reduce((s, i) => s + ((i as unknown as {amountCents: number}).amountCents || 0), 0);
    const receivedTotal = paid.reduce((s, i) => s + ((i as unknown as {amountCents: number}).amountCents || 0), 0);

    // Group pending by dueDate string
    const agendaMap = new Map<string, typeof pending>();
    for (const inst of pending) {
      const key = String((inst as unknown as {dueDate: unknown}).dueDate).slice(0, 10);
      if (!agendaMap.has(key)) agendaMap.set(key, []);
      agendaMap.get(key)!.push(inst);
    }
    const agenda = Array.from(agendaMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(0, 7)
      .map(([date, items]) => ({date, items}));

    renderPage(res, 'dashboard/index', {
      title: 'Visão geral',
      customersCount,
      productsCount,
      sales: salesResult.rows,
      salesTotal: salesResult.count,
      agenda,
      pending,
      overdue,
      pendingTotal,
      overdueTotal,
      receivedTotal,
      today,
    });
  } catch (e) {
    console.error(e);
    renderPage(res, 'dashboard/index', {
      title: 'Visão geral',
      customersCount: 0,
      productsCount: 0,
      sales: [],
      salesTotal: 0,
      agenda: [],
      pending: [],
      overdue: [],
      pendingTotal: 0,
      overdueTotal: 0,
      receivedTotal: 0,
      today: new Date().toISOString().slice(0, 10),
      error: 'Erro ao carregar dados do dashboard.',
    });
  }
});

export default router;
