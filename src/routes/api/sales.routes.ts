import {Router} from 'express';
import {authMiddleware} from '../../modules/shared/middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware);

export default router;
