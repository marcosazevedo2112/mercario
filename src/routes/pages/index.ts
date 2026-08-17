import {Router} from 'express';
import authRoutes from './auth.routes';
import homeRoutes from './home.routes';
import customersRoutes from './customers.routes';
import productsRoutes from './products.routes';
import salesRoutes from './sales.routes';

const router = Router();
router.use(authRoutes);
router.use(homeRoutes);
router.use(customersRoutes);
router.use(productsRoutes);
router.use(salesRoutes);
export default router;
