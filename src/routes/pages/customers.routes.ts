import {Router} from 'express';
import {requireAuth, setFlash} from '../../modules/shared/middlewares/pageAuth';
import {renderPage} from '../../utils/view';
import CustomerService from '../../modules/customers/customer.service';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const tenantId = req.session.user!.tenantId;
    const customers = await CustomerService.findAll(tenantId);
    const q = String(req.query.q || '').trim().toLowerCase();
    const filtered = q
      ? customers.filter(
          c =>
            c.name.toLowerCase().includes(q) ||
            (c.nickname && c.nickname.toLowerCase().includes(q)) ||
            (c.phone && c.phone.includes(q)) ||
            (c.email && c.email.toLowerCase().includes(q)),
        )
      : customers;
    renderPage(res, 'customers/index', {title: 'Clientes', customers: filtered, q});
  } catch (e) {
    console.error(e);
    renderPage(res, 'customers/index', {title: 'Clientes', customers: [], q: '', error: 'Erro ao carregar clientes.'});
  }
});

router.get('/new', requireAuth, (_req, res) => {
  renderPage(res, 'customers/form', {title: 'Novo cliente', customer: null, isEdit: false});
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const tenantId = req.session.user!.tenantId;
    await CustomerService.create(
      {
        name: String(req.body.name || '').trim(),
        nickname: String(req.body.nickname || '').trim() || null,
        phone: String(req.body.phone || '').trim() || null,
        email: String(req.body.email || '').trim() || null,
        address: String(req.body.address || '').trim() || null,
        notes: String(req.body.notes || '').trim() || null,
      },
      tenantId,
    );
    setFlash(req, 'success', 'Cliente cadastrado com sucesso!');
    return res.redirect('/customers');
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Erro ao criar cliente';
    return renderPage(res, 'customers/form', {title: 'Novo cliente', customer: null, isEdit: false, error: msg, formData: req.body});
  }
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const tenantId = req.session.user!.tenantId;
    const customer = await CustomerService.findById(Number(req.params.id), tenantId);
    renderPage(res, 'customers/show', {title: customer.name, customer});
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Cliente não encontrado';
    setFlash(req, 'error', msg);
    return res.redirect('/customers');
  }
});

router.get('/:id/edit', requireAuth, async (req, res) => {
  try {
    const tenantId = req.session.user!.tenantId;
    const customer = await CustomerService.findById(Number(req.params.id), tenantId);
    renderPage(res, 'customers/form', {title: 'Editar cliente', customer, isEdit: true});
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Cliente não encontrado';
    setFlash(req, 'error', msg);
    return res.redirect('/customers');
  }
});

router.post('/:id/edit', requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  try {
    const tenantId = req.session.user!.tenantId;
    await CustomerService.update(id, tenantId, {
      name: String(req.body.name || '').trim() || undefined,
      nickname: String(req.body.nickname || '').trim() || null,
      phone: String(req.body.phone || '').trim() || null,
      email: String(req.body.email || '').trim() || null,
      address: String(req.body.address || '').trim() || null,
      notes: String(req.body.notes || '').trim() || null,
    });
    setFlash(req, 'success', 'Cliente atualizado!');
    return res.redirect('/customers/' + id);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Erro ao atualizar';
    try {
      const tenantId = req.session.user!.tenantId;
      const customer = await CustomerService.findById(id, tenantId);
      return renderPage(res, 'customers/form', {title: 'Editar cliente', customer, isEdit: true, error: msg});
    } catch {
      return renderPage(res, 'customers/form', {title: 'Editar cliente', customer: null, isEdit: true, error: msg});
    }
  }
});

router.post('/:id/delete', requireAuth, async (req, res) => {
  try {
    const tenantId = req.session.user!.tenantId;
    await CustomerService.delete(Number(req.params.id), tenantId);
    setFlash(req, 'success', 'Cliente removido.');
    return res.redirect('/customers');
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Erro ao excluir';
    setFlash(req, 'error', msg);
    return res.redirect('/customers');
  }
});

export default router;
