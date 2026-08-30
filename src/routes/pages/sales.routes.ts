import {Router} from 'express';
import {requireAuth, setFlash} from '../../modules/shared/middlewares/pageAuth';
import {renderPage} from '../../utils/view';
import SalesService from '../../modules/sales/sales.service';
import SettlementService from '../../modules/sales/sales/settlement.service';
import ChargeService from '../../modules/sales/sales/charge.service';
import Customer from '../../modules/customers/customer.model';
import Product from '../../modules/products/product.model';
import {SaleStatus} from '../../modules/sales/sales/enums/sale-status';
import {InstallmentStatus} from '../../modules/sales/sales/enums/installment-status';

const router = Router();

// List + agenda
router.get('/', requireAuth, async (req, res) => {
  try {
    const tenantId = req.session.user!.tenantId;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const status = (req.query.status as SaleStatus | undefined) || undefined;
    const customerId = req.query.customerId ? Number(req.query.customerId) : undefined;
    const search = req.query.search ? String(req.query.search).trim() : undefined;

    const validStatus = status && Object.values(SaleStatus).includes(status) ? status : undefined;

    const result = await SalesService.findMany(tenantId, {
      page,
      limit,
      status: validStatus,
      customerId: customerId && Number.isInteger(customerId) && customerId > 0 ? customerId : undefined,
      search: search || undefined,
    });

    // Load customers for filter dropdown
    const customers = await Customer.findAll({where: {tenantId, active: true}, order: [['name', 'ASC']]});

    // Build agenda from loaded sales' installments grouped by dueDate
    // Association alias is `Saleinstallments` — `installments` is the INTEGER column (quantity)
    const allInstallments = result.data.flatMap(s => {
      const raw = s as unknown as {Saleinstallments?: unknown[]; installments?: unknown};
      const insts = (Array.isArray(raw.Saleinstallments) ? raw.Saleinstallments : Array.isArray(raw.installments) ? raw.installments : []) as unknown[];
      return insts.map((i: unknown) => ({...(i as Record<string, unknown>), sale: s}));
    });
    const pendingAgenda = allInstallments.filter((i: Record<string, unknown>) => i.status === InstallmentStatus.PENDING);
    const today = new Date().toISOString().slice(0, 10);
    const agendaMap = new Map<string, typeof pendingAgenda>();
    for (const inst of pendingAgenda) {
      const key = String((inst as Record<string, unknown>).dueDate).slice(0, 10);
      if (!agendaMap.has(key)) agendaMap.set(key, []);
      agendaMap.get(key)!.push(inst);
    }
    const agenda = Array.from(agendaMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(0, 10)
      .map(([date, items]) => ({date, items}));

    const qs = (pageNum: number) => {
      const p = new URLSearchParams();
      p.set('page', String(pageNum));
      p.set('limit', String(limit));
      if (validStatus) p.set('status', validStatus);
      if (customerId) p.set('customerId', String(customerId));
      if (search) p.set('search', search);
      return p.toString();
    };

    renderPage(res, 'sales/index', {
      title: 'Vendas',
      sales: result.data,
      pagination: result.pagination,
      customers,
      status: validStatus || '',
      customerId: customerId || '',
      search: search || '',
      agenda,
      today,
      queryString: qs,
    });
  } catch (e) {
    console.error(e);
    renderPage(res, 'sales/index', {
      title: 'Vendas',
      sales: [],
      pagination: {page: 1, limit: 20, total: 0, totalPages: 0},
      customers: [],
      status: '',
      customerId: '',
      search: '',
      agenda: [],
      today: new Date().toISOString().slice(0, 10),
      error: 'Erro ao carregar vendas.',
      queryString: () => '',
    });
  }
});

router.get('/new', requireAuth, async (req, res) => {
  const tenantId = req.session.user!.tenantId;
  const [customers, products] = await Promise.all([
    Customer.findAll({where: {tenantId, active: true}, order: [['name', 'ASC']]}),
    Product.findAll({where: {tenantId, active: true}, order: [['name', 'ASC']]}),
  ]);
  renderPage(res, 'sales/new', {
    title: 'Nova venda',
    customers,
    products,
    preselectedCustomerId: req.query.customerId ? Number(req.query.customerId) : null,
  });
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const tenantId = req.session.user!.tenantId;
    const userId = req.session.user!.id;

    // Parse items from body: items[0][productId], items[0][quantity] etc or JSON
    let items: {productId: number; quantity: number}[] = [];
    if (req.body.items) {
      if (typeof req.body.items === 'string') {
        try { items = JSON.parse(req.body.items); } catch {}
      } else if (Array.isArray(req.body.items)) {
        items = req.body.items.map((it: Record<string, unknown>) => ({
          productId: Number(it.productId),
          quantity: Number(it.quantity),
        }));
      }
    }
    // fallback: productId[] + quantity[]
    if (items.length === 0 && req.body.productId) {
      const pids = Array.isArray(req.body.productId) ? req.body.productId : [req.body.productId];
      const qtys = Array.isArray(req.body.quantity) ? req.body.quantity : [req.body.quantity];
      items = pids.map((pid: unknown, i: number) => ({productId: Number(pid), quantity: Number(qtys[i] || 1)}));
    }

    const discountCents = Math.round(Number(String(req.body.discount || '0').replace(',', '.')) * 100) || 0;
    const installments = Math.max(1, Number(req.body.installments) || 1);
    const initialDueDate = String(req.body.initialDueDate || new Date().toISOString());
    // Ensure datetime format: if date only, add T00:00:00.000Z
    const isoDate = initialDueDate.length === 10 ? initialDueDate + 'T00:00:00.000Z' : initialDueDate;

    const sale = await SalesService.create(
      {
        customerId: Number(req.body.customerId),
        items,
        discountCents,
        paymentPlan: {
          paymentMethod: req.body.paymentMethod,
          installments,
          initialDueDate: isoDate,
          modality: req.body.modality,
        },
        notes: String(req.body.notes || '').trim() || undefined,
      },
      tenantId,
      userId,
    );
    const created = sale as unknown as {id: number};
    setFlash(req, 'success', 'Venda criada com sucesso!');
    return res.redirect('/sales/' + created.id);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Erro ao criar venda';
    const tenantId = req.session.user!.tenantId;
    const [customers, products] = await Promise.all([
      Customer.findAll({where: {tenantId, active: true}, order: [['name', 'ASC']]}),
      Product.findAll({where: {tenantId, active: true}, order: [['name', 'ASC']]}),
    ]);
    return renderPage(res, 'sales/new', {
      title: 'Nova venda',
      customers,
      products,
      preselectedCustomerId: Number(req.body.customerId) || null,
      error: msg,
      formData: req.body,
    });
  }
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const tenantId = req.session.user!.tenantId;
    const sale = await SalesService.findById(Number(req.params.id), tenantId);
    const s = sale as unknown as Record<string, unknown>;
    // Load customer
    const customer = await Customer.findOne({where: {id: (s.customerId as number), tenantId}});
    // Load charges for each installment (alias `Saleinstallments`, `installments` is INTEGER quantity)
    const installments = (((s.Saleinstallments ?? s.installments) as unknown[]) || []) as Record<string, unknown>[];
    const chargesByInstallment: Record<number, unknown[]> = {};
    for (const inst of installments) {
      try {
        const charges = await ChargeService.findMany(Number(s.id), Number(inst.id), tenantId);
        chargesByInstallment[Number(inst.id)] = charges as unknown[];
      } catch { chargesByInstallment[Number(inst.id)] = []; }
    }
    // Settlement if exists
    const settlement = (s.settlement as unknown) || null;

    renderPage(res, 'sales/show', {
      title: 'Venda #' + s.id,
      sale,
      saleRaw: s,
      customer,
      installments,
      chargesByInstallment,
      settlement,
      today: new Date().toISOString().slice(0, 10),
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Venda não encontrada';
    setFlash(req, 'error', msg);
    return res.redirect('/sales');
  }
});

router.post('/:id/cancel', requireAuth, async (req, res) => {
  try {
    const tenantId = req.session.user!.tenantId;
    const userId = req.session.user!.id;
    await SalesService.cancel(Number(req.params.id), tenantId, userId, String(req.body.reason || ''));
    setFlash(req, 'success', 'Venda cancelada.');
    return res.redirect('/sales/' + req.params.id);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Erro ao cancelar';
    setFlash(req, 'error', msg);
    return res.redirect('/sales/' + req.params.id);
  }
});

router.post('/:id/settle', requireAuth, async (req, res) => {
  try {
    const tenantId = req.session.user!.tenantId;
    const userId = req.session.user!.id;
    const discountCents = Math.round(Number(String(req.body.discount || '0').replace(',', '.')) * 100) || 0;
    await SettlementService.settle(Number(req.params.id), tenantId, {
      discountCents,
      paymentMethod: req.body.paymentMethod,
      settledBy: userId,
      notes: String(req.body.notes || '').trim() || null,
    });
    setFlash(req, 'success', 'Venda quitada com sucesso!');
    return res.redirect('/sales/' + req.params.id);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Erro ao quitar venda';
    setFlash(req, 'error', msg);
    return res.redirect('/sales/' + req.params.id);
  }
});

router.post('/:id/installments/:installmentId/payment', requireAuth, async (req, res) => {
  try {
    const tenantId = req.session.user!.tenantId;
    await SalesService.registerPayment(
      Number(req.params.installmentId),
      Number(req.params.id),
      tenantId,
      new Date(),
    );
    // If fetch (AJAX) request, return JSON
    if (req.headers.accept?.includes('application/json') || req.headers['x-requested-with'] === 'XMLHttpRequest') {
      return res.json({ok: true});
    }
    setFlash(req, 'success', 'Pagamento registrado com sucesso.');
    return res.redirect('/sales/' + req.params.id);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Erro ao registrar pagamento';
    if (req.headers.accept?.includes('application/json') || req.headers['x-requested-with'] === 'XMLHttpRequest') {
      return res.status(400).json({message: msg});
    }
    setFlash(req, 'error', msg);
    return res.redirect('/sales/' + req.params.id);
  }
});

router.post('/:id/installments/:installmentId/charges', requireAuth, async (req, res) => {
  try {
    const tenantId = req.session.user!.tenantId;
    const userId = req.session.user!.id;
    await ChargeService.send(
      Number(req.params.id),
      Number(req.params.installmentId),
      tenantId,
      {
        channel: req.body.channel,
        triggeredBy: req.body.triggeredBy || 'MANUAL',
        message: String(req.body.message || '').trim(),
        sentBy: userId,
      },
    );
    if (req.headers.accept?.includes('application/json')) return res.json({ok: true});
    setFlash(req, 'success', 'Cobrança registrada.');
    return res.redirect('/sales/' + req.params.id);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Erro ao registrar cobrança';
    if (req.headers.accept?.includes('application/json')) return res.status(400).json({message: msg});
    setFlash(req, 'error', msg);
    return res.redirect('/sales/' + req.params.id);
  }
});

export default router;
