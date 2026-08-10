import {Router} from 'express';
import {authMiddleware} from '../../modules/shared/middlewares/authMiddleware';
import SalesController from '../../modules/sales/sale.controller';

const router = Router();
router.use(authMiddleware);

router.get('/', SalesController.findMany);
router.post('/', SalesController.create);
router.get('/:id', SalesController.findById);
router.post('/:id/cancel', SalesController.cancel);
router.post('/:id/settle', SalesController.settle);
router.post('/:id/installments/:installmentId/payment', SalesController.registerPayment);

export default router;
