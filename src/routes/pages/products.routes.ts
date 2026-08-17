import {Router} from 'express';
import ProductController from '../../modules/products/product.controller';
import {authMiddleware} from '../../modules/shared/middlewares/authMiddleware';

const router = Router();
router.use(authMiddleware);
router.get('/products', ProductController.pageList);
export default router;
