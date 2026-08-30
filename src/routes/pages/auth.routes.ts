import {Router} from 'express';
import AuthService from '../../modules/auth/auth.service';
import {AppError} from '../../errors/appError';
import {guestOnly, setFlash} from '../../modules/shared/middlewares/pageAuth';
import {renderPage} from '../../utils/view';

const router = Router();

router.get('/login', guestOnly, (_req, res) => {
  renderPage(res, 'auth/login', {title: 'Entrar', hideNav: true});
});

router.post('/login', guestOnly, async (req, res) => {
  try {
    const user = await AuthService.login({
      email: String(req.body.email || '').trim(),
      password: String(req.body.password || ''),
    });
    req.session.user = {id: user.id, email: user.email, tenantId: user.tenantId};
    return res.redirect('/');
  } catch (error: unknown) {
    const message =
      error instanceof AppError
        ? error.message
        : error instanceof Error
          ? error.message
          : 'Erro ao entrar';
    return renderPage(res, 'auth/login', {
      title: 'Entrar',
      hideNav: true,
      error: message,
      formData: {email: req.body.email},
    });
  }
});

router.get('/register', guestOnly, (_req, res) => {
  renderPage(res, 'auth/register', {title: 'Criar conta', hideNav: true});
});

router.post('/register', guestOnly, async (req, res) => {
  try {
    const {user} = await AuthService.createAccount({
      tenantName: String(req.body.tenantName || '').trim(),
      name: String(req.body.name || '').trim(),
      email: String(req.body.email || '').trim(),
      password: String(req.body.password || ''),
    });
    req.session.user = {id: user.id, email: user.email, tenantId: user.tenantId};
    setFlash(req, 'success', 'Conta criada com sucesso!');
    return res.redirect('/');
  } catch (error: unknown) {
    const message =
      error instanceof AppError
        ? error.message
        : error instanceof Error
          ? error.message
          : 'Erro ao criar conta';
    return renderPage(res, 'auth/register', {
      title: 'Criar conta',
      hideNav: true,
      error: message,
      formData: req.body,
    });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error(err);
      return res.redirect('/');
    }
    res.clearCookie('connect.sid');
    return res.redirect('/auth/login');
  });
});

export default router;
