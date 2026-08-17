import {Router} from 'express';
import CustomerController from '../../modules/customers/customer.controller';
import {authMiddleware} from '../../modules/shared/middlewares/authMiddleware';

const router = Router();
router.use(authMiddleware);
router.get('/customers', CustomerController.pageList);
export default router;
