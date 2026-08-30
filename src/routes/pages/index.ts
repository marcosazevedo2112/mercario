import {Router} from 'express';
import authRoutes from './auth.routes';
import dashboardRoutes from './dashboard.routes';
import customerPages from './customers.routes';
import productPages from './products.routes';
import salesPages from './sales.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/customers', customerPages);
router.use('/products', productPages);
router.use('/sales', salesPages);
router.use('/', dashboardRoutes);

export default router;
