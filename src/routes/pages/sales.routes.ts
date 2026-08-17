import {Router} from 'express';
import SalesController from '../../modules/sales/sale.controller';
import {authMiddleware} from '../../modules/shared/middlewares/authMiddleware';

const router = Router();
router.use(authMiddleware);
router.get('/sales', SalesController.pageList);
export default router;
