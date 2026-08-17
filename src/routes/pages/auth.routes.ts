import {Router} from 'express';
import AuthController from '../../modules/auth/auth.controller';
import {authMiddleware} from '../../modules/shared/middlewares/authMiddleware';

const router = Router();

router.get('/login', AuthController.loginPage);
router.post('/login', AuthController.loginSubmit);
router.get('/register', AuthController.registerPage);
router.post('/register', AuthController.registerSubmit);
router.post('/logout', authMiddleware, AuthController.logout);

export default router;
