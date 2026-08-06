import {Request, Response} from 'express';
import AuthService from './auth.service';
import {AppError} from '../../errors/appError';

const AuthController = {
  loginPage: (req: Request, res: Response) => {},
  login: async (req: Request, res: Response) => {
    try {
      const user = await AuthService.login(req.body);
      req.session.user = {
        id: user.id,
        email: user.email,
        tenantId: user.tenantId,
      };

      return res.status(200).json({
        user,
      });
    } catch (error: Error | unknown) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          message: error.message,
          statusCode: error.statusCode,
        });
      } else if (error instanceof Error) {
        return res.status(500).json({
          message: error.message,
        });
      }
    }
  },

  logout: async (req: Request, res: Response) => {
    req.session.destroy(error => {
      if (error) {
        console.error(error);

        return res.status(500).json({
          message: 'Failed to logout',
        });
      }

      res.clearCookie('connect.sid');

      return res.status(200).json({
        message: 'Logout successful',
      });
    });
  },

  registerPage: (req: Request, res: Response) => {},
  register: async (req: Request, res: Response) => {
    try {
      const {user, tenant} = await AuthService.createAccount(req.body);

      return res.status(201).json({user, tenant});
    } catch (error: Error | unknown) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          message: error.message,
          statusCode: error.statusCode,
        });
      } else if (error instanceof Error) {
        return res.status(500).json({
          message: error.message,
        });
      } else {
        return res.status(500).json({
          message: 'An unknown error occurred',
        });
      }
    }
  },

  forgotPasswordPage: (req: Request, res: Response) => {},
  forgotPassword: (req: Request, res: Response) => {},

  resetPasswordPage: (req: Request, res: Response) => {},
  resetPassword: (req: Request, res: Response) => {},
};

export default AuthController;
