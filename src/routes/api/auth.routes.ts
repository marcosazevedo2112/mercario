import {Router} from 'express';
import AuthController from '../../modules/auth/auth.controller';
import {registerAccountSchema} from '../../modules/auth/schemas/account.register.schema';
import {loginAccountSchema} from '../../modules/auth/schemas/account.login.schema';
import {validate} from '../../modules/shared/middlewares/validate';
import {authMiddleware} from '../../modules/shared/middlewares/authMiddleware';

const router = Router();

router.post('/login', validate(loginAccountSchema), AuthController.login);

router.post('/logout', authMiddleware, AuthController.logout);

router.post(
  '/register',
  validate(registerAccountSchema),
  AuthController.register,
);

export default router;
