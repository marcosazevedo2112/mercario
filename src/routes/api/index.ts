import {Router} from 'express';
import authRoutes from './auth.routes';
import productRoutes from './products.routes';
import customerRoutes from './customer.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/customers', customerRoutes);

export default router;
