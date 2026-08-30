import {Request, Response, NextFunction} from 'express';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.user) {
    const flash = {type: 'error', message: 'Faça login para continuar.'};
    (req.session as unknown as Record<string, unknown>).flash = flash;
    return res.redirect('/auth/login');
  }
  next();
}

export function guestOnly(req: Request, res: Response, next: NextFunction) {
  if (req.session?.user) return res.redirect('/');
  next();
}

export function setFlash(
  req: Request,
  type: 'success' | 'error' | 'info',
  message: string,
) {
  (req.session as unknown as Record<string, unknown>).flash = {type, message};
}
