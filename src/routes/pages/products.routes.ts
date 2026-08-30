import {Router} from 'express';
import {requireAuth, setFlash} from '../../modules/shared/middlewares/pageAuth';
import {renderPage} from '../../utils/view';
import ProductService from '../../modules/products/product.service';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const tenantId = req.session.user!.tenantId;
    const products = await ProductService.findAll(tenantId);
    const q = String(req.query.q || '').trim().toLowerCase();
    const filtered = q
      ? products.filter(
          p =>
            p.name.toLowerCase().includes(q) ||
            (p.description && p.description.toLowerCase().includes(q)),
        )
      : products;
    const queryString = (page: number) => '';
    renderPage(res, 'products/index', {title: 'Produtos', products: filtered, q, queryString});
  } catch (e) {
    console.error(e);
    renderPage(res, 'products/index', {title: 'Produtos', products: [], q: '', error: 'Erro ao carregar produtos.'});
  }
});

router.get('/new', requireAuth, (_req, res) => {
  renderPage(res, 'products/form', {title: 'Novo produto', product: null, isEdit: false});
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const tenantId = req.session.user!.tenantId;
    const price = Math.round(Number(String(req.body.price).replace(',', '.')) * 100);
    const costPriceRaw = String(req.body.costPriceCents ?? req.body.costPrice ?? '').trim();
    const costPriceCents = costPriceRaw === '' ? 0 : Math.round(Number(costPriceRaw.replace(',', '.')) * 100);
    await ProductService.create(
      {
        name: String(req.body.name || '').trim(),
        description: String(req.body.description || '').trim() || null,
        priceCents: price,
        costPriceCents,
      },
      tenantId,
    );
    setFlash(req, 'success', 'Produto criado com sucesso!');
    return res.redirect('/products');
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Erro ao criar produto';
    return renderPage(res, 'products/form', {title: 'Novo produto', product: null, isEdit: false, error: msg, formData: req.body});
  }
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const tenantId = req.session.user!.tenantId;
    const product = await ProductService.findById(Number(req.params.id), tenantId);
    renderPage(res, 'products/show', {title: product.name, product});
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Produto não encontrado';
    setFlash(req, 'error', msg);
    return res.redirect('/products');
  }
});

router.get('/:id/edit', requireAuth, async (req, res) => {
  try {
    const tenantId = req.session.user!.tenantId;
    const product = await ProductService.findById(Number(req.params.id), tenantId);
    renderPage(res, 'products/form', {title: 'Editar produto', product, isEdit: true});
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Produto não encontrado';
    setFlash(req, 'error', msg);
    return res.redirect('/products');
  }
});

router.post('/:id/edit', requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  try {
    const tenantId = req.session.user!.tenantId;
    const data: Record<string, unknown> = {};
    if (req.body.name !== undefined) data.name = String(req.body.name).trim();
    if (req.body.description !== undefined) data.description = String(req.body.description).trim() || null;
    if (req.body.price !== undefined && String(req.body.price).trim() !== '') {
      data.priceCents = Math.round(Number(String(req.body.price).replace(',', '.')) * 100);
    }
    const costRaw = String(req.body.costPrice ?? req.body.costPriceCents ?? '').trim();
    if (costRaw !== '') data.costPriceCents = Math.round(Number(costRaw.replace(',', '.')) * 100);
    if (req.body.active !== undefined) data.active = req.body.active === 'true' || req.body.active === 'on';
    await ProductService.update(id, tenantId, data as never);
    setFlash(req, 'success', 'Produto atualizado!');
    return res.redirect('/products/' + id);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Erro ao atualizar';
    const tenantId = req.session.user!.tenantId;
    try {
      const product = await ProductService.findById(id, tenantId);
      return renderPage(res, 'products/form', {title: 'Editar produto', product, isEdit: true, error: msg});
    } catch {
      return renderPage(res, 'products/form', {title: 'Editar produto', product: null, isEdit: true, error: msg});
    }
  }
});

router.post('/:id/delete', requireAuth, async (req, res) => {
  try {
    const tenantId = req.session.user!.tenantId;
    await ProductService.delete(Number(req.params.id), tenantId);
    setFlash(req, 'success', 'Produto removido.');
    return res.redirect('/products');
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Erro ao excluir';
    setFlash(req, 'error', msg);
    return res.redirect('/products');
  }
});

export default router;
