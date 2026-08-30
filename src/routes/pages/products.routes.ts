import {Router} from 'express';
import ProductController from '../../modules/products/product.controller';
import {authMiddleware} from '../../modules/shared/middlewares/authMiddleware';

const router = Router();
router.use(authMiddleware);

router.get('/products', ProductController.pageList);
router.get('/products/new', (_req, res) =>
  res.render('products/new', {title: 'Novo produto'}),
);
router.get('/products/:id/edit', (req, res) =>
  res.render('products/edit', {
    title: 'Editar produto',
    productId: req.params.id,
  }),
);
router.get('/products/:id', (req, res) =>
  res.render('products/show', {title: 'Produto', productId: req.params.id}),
);

export default router;
