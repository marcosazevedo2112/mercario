import {Router} from 'express';
import authRoutes from './auth.routes';
import appRoutes from './app.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/', appRoutes);

export default router;
