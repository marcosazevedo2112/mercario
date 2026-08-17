import {Router, Request, Response} from 'express';
import {authMiddleware} from '../../modules/shared/middlewares/authMiddleware';

const router = Router();
router.use(authMiddleware);
router.get('/', (_req: Request, res: Response) => {
  res.render('home/index', {
    stats: {
      sales: 'R$ 23.756,91',
      salesDelta: '+12%',
      profit: 'R$ 3.563,53',
      activeCustomers: 127,
      products: 76,
    },
    recentSales: [
      {initials: 'JC', customer: 'João Carlos', meta: '2 produtos', value: 'R$ 99,99'},
      {initials: 'FS', customer: 'Fernanda Souza', meta: '3 produtos', value: 'R$ 246,00'},
      {initials: 'AP', customer: 'Ana Paula', meta: '1 produto', value: 'R$ 39,90'},
    ],
    error: null,
  });
});
export default router;
