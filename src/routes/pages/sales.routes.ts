import {Router} from 'express';
import SalesController from '../../modules/sales/sale.controller';
import {authMiddleware} from '../../modules/shared/middlewares/authMiddleware';

const router = Router();
router.use(authMiddleware);

router.get('/sales', SalesController.pageList);
router.get('/sales/new', (_req, res) =>
  res.render('sales/new', {title: 'Nova venda'}),
);
router.get('/sales/:id/cancel', (req, res) =>
  res.render('sales/cancel', {title: 'Cancelar venda', saleId: req.params.id}),
);
router.get('/sales/:id/settle', (req, res) =>
  res.render('sales/settle', {
    title: 'Registrar pagamento',
    saleId: req.params.id,
  }),
);
router.get('/sales/:id', SalesController.findById);

export default router;
