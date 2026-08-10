import {Router} from 'express';
import authRoutes from './auth.routes';
import productRoutes from './products.routes';
import customerRoutes from './customer.routes';
import salesRoutes from './sales.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/customers', customerRoutes);
router.use('/sales', salesRoutes);

export default router;
