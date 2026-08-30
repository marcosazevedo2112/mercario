import {Router} from 'express';
import {authMiddleware} from '../../modules/shared/middlewares/authMiddleware';
import Installment from '../../modules/sales/sales/entities/installment.model';
import Sale from '../../modules/sales/sales/entities/sale.model';
import Customer from '../../modules/customers/customer.model';
import {InstallmentStatus} from '../../modules/sales/sales/enums/installment-status';
import {getTenantId} from '../../modules/shared/utils/getTenantId';
import '../../modules/sales/sales/entities/associations';

const router = Router();
router.use(authMiddleware);

router.get('/charges', async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const installments = await Installment.findAll({
      where: {tenantId, status: InstallmentStatus.PENDING},
      include: [{model: Sale, as: 'sale', required: true}],
      order: [['dueDate', 'ASC']],
    });

    const customerIds = [...new Set(installments.map(i => (i as any).sale.customerId))].filter(Boolean);
    const customers = await Customer.findAll({
      where: {id: customerIds, tenantId},
    });
    const customerMap = new Map(customers.map(c => [c.id, c]));

    const charges = installments.map(i => {
      const sale = (i as any).sale;
      const customer = customerMap.get(sale.customerId);
      return {
        saleId: sale.id,
        installmentId: i.id,
        customerName: customer ? customer.name : `Cliente #${sale.customerId}`,
        number: i.number,
        dueDate: i.dueDate,
        amountCents: i.amountCents - i.paidAmountCents,
      };
    });

    res.render('charges/index', {title: 'Cobranças', charges});
  } catch (error) {
    res.render('charges/index', {title: 'Cobranças', charges: [], error: 'Não foi possível carregar as cobranças.'});
  }
});
router.get('/charges/:saleId/:installmentId', (req, res) =>
  res.render('charges/show', {
    title: 'Cobrança',
    saleId: req.params.saleId,
    installmentId: req.params.installmentId,
  }),
);

export default router;
