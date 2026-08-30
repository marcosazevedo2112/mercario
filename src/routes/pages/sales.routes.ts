import {Router} from 'express';
import SalesController from '../../modules/sales/sale.controller';
import {authMiddleware} from '../../modules/shared/middlewares/authMiddleware';
const router = Router();
router.use(authMiddleware);
router.get('/sales', SalesController.pageList);
router.get('/sales/:id/cancel', SalesController.pageCancel);
router.get('/sales/:id', SalesController.findById);
export default router;
