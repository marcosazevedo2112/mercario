import {Router} from 'express';
import {authMiddleware} from '../../modules/shared/middlewares/authMiddleware';

const router = Router();
router.use(authMiddleware);

router.get('/charges', (_req, res) => res.render('charges/index', {title: 'Cobranças'}));
router.get('/charges/:saleId/:installmentId', (req, res) =>
  res.render('charges/show', {
    title: 'Cobrança',
    saleId: req.params.saleId,
    installmentId: req.params.installmentId,
  }),
);

export default router;
