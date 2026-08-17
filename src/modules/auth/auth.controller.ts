import {Request, Response} from 'express';
import AuthService from './auth.service';
import {AppError} from '../../errors/appError';
import {loginAccountSchema} from './schemas/account.login.schema';
import {registerAccountSchema} from './schemas/account.register.schema';

const renderAuthError = (res: Response, view: string, error: unknown, data = {}) => {
  const message = error instanceof AppError || error instanceof Error ? error.message : 'Não foi possível concluir a operação.';
  return res.status(error instanceof AppError ? error.statusCode : 500).render(view, {...data, error: message});
};

const AuthController = {
  login: async (req: Request, res: Response) => {
    try {
      const user = await AuthService.login(req.body);
      req.session.user = {id: user.id, email: user.email, tenantId: user.tenantId};
      return res.status(200).json({user});
    } catch (error: unknown) {
      if (error instanceof AppError) return res.status(error.statusCode).json({message: error.message, statusCode: error.statusCode});
      return res.status(500).json({message: error instanceof Error ? error.message : 'Erro interno do servidor'});
    }
  },

  loginPage: async (req: Request, res: Response) => {
    if (req.session.user) return res.redirect('/');
    return res.render('auth/login', {error: null, email: '', registered: req.query.registered === '1'});
  },

  loginSubmit: async (req: Request, res: Response) => {
    const parsed = loginAccountSchema.safeParse(req.body);
    if (!parsed.success) return renderAuthError(res, 'auth/login', new AppError('Informe um e-mail e uma senha válidos.', 400), {email: req.body.email ?? '', registered: false});
    try {
      const user = await AuthService.login(parsed.data);
      req.session.user = {id: user.id, email: user.email, tenantId: user.tenantId};
      return res.redirect('/');
    } catch (error: unknown) {
      return renderAuthError(res, 'auth/login', error, {email: req.body.email ?? '', registered: false});
    }
  },

  logout: async (req: Request, res: Response) => {
    req.session.destroy(error => {
      if (error) return res.status(500).json({message: 'Failed to logout'});
      res.clearCookie('connect.sid');
      return res.status(200).json({message: 'Logout successful'});
    });
  },

  register: async (req: Request, res: Response) => {
    try {
      const {user, tenant} = await AuthService.createAccount(req.body);
      return res.status(201).json({user, tenant});
    } catch (error: unknown) {
      if (error instanceof AppError) return res.status(error.statusCode).json({message: error.message, statusCode: error.statusCode});
      return res.status(500).json({message: error instanceof Error ? error.message : 'An unknown error occurred'});
    }
  },

  registerPage: async (_req: Request, res: Response) => res.render('auth/register', {error: null, values: {}}),

  registerSubmit: async (req: Request, res: Response) => {
    const parsed = registerAccountSchema.safeParse(req.body);
    if (!parsed.success) return renderAuthError(res, 'auth/register', new AppError('Preencha os dados obrigatórios corretamente.', 400), {values: req.body});
    try {
      await AuthService.createAccount(parsed.data);
      return res.redirect('/login?registered=1');
    } catch (error: unknown) {
      return renderAuthError(res, 'auth/register', error, {values: req.body});
    }
  },
};

export default AuthController;
