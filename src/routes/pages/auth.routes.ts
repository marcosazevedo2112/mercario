import {Router} from 'express';
import AuthController from '../../modules/auth/auth.controller';

const router = Router();

// Autenticação
router.get('/login', AuthController.loginPage);

// Cadastro
router.get('/register', AuthController.registerPage);

// Recuperação de senha
router.get('/forgot-password', AuthController.forgotPasswordPage);
router.get('/reset-password/:token', AuthController.resetPasswordPage);

export default router;
