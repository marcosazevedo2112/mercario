import {Router} from 'express';
import CustomerController from '../../modules/customers/customer.controller';
import {createCustomerSchema} from '../../modules/customers/schemas/customer.create.schema';
import {updateCustomerSchema} from '../../modules/customers/schemas/customer.update.schema';
import {deleteCustomerSchema} from '../../modules/customers/schemas/customer.delete.schema';
import {getOneCustomerSchema} from '../../modules/customers/schemas/customer.getOne.schema';
import {validate} from '../../modules/shared/middlewares/validate';
import {authMiddleware} from '../../modules/shared/middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.post('/', validate(createCustomerSchema), CustomerController.create);

router.get('/', CustomerController.findAll);

router.get(
  '/:id',
  validate(getOneCustomerSchema, 'params'),
  CustomerController.findById,
);

router.put('/:id', validate(updateCustomerSchema), CustomerController.update);

router.delete(
  '/:id',
  validate(deleteCustomerSchema, 'params'),
  CustomerController.delete,
);

export default router;
