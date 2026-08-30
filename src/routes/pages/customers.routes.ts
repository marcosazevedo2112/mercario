import {Router} from 'express';
import CustomerController from '../../modules/customers/customer.controller';
import {authMiddleware} from '../../modules/shared/middlewares/authMiddleware';

const router = Router();
router.use(authMiddleware);

router.get('/customers', CustomerController.pageList);
router.get('/customers/new', (_req, res) =>
  res.render('customers/new', {title: 'Novo cliente'}),
);
router.get('/customers/:id/edit', (req, res) =>
  res.render('customers/edit', {
    title: 'Editar cliente',
    customerId: req.params.id,
  }),
);
router.get('/customers/:id', (req, res) =>
  res.render('customers/show', {title: 'Cliente', customerId: req.params.id}),
);

export default router;
