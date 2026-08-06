import {Router} from 'express';
import ProductController from '../../modules/products/product.controller';
import {createProductSchema} from '../../modules/products/schemas/product.create.schema';
import {updateProductSchema} from '../../modules/products/schemas/product.update.schema';
import {deleteProductSchema} from '../../modules/products/schemas/product.delete.schema';
import {getOneProductSchema} from '../../modules/products/schemas/product.getOne.schema';
import {validate} from '../../modules/shared/middlewares/validate';
import {authMiddleware} from '../../modules/shared/middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.post('/', validate(createProductSchema), ProductController.create);

router.get('/', ProductController.findAll);

router.get(
  '/:id',
  validate(getOneProductSchema, 'params'),
  ProductController.findById,
);

router.put('/:id', validate(updateProductSchema), ProductController.update);

router.delete(
  '/:id',
  validate(deleteProductSchema, 'params'),
  ProductController.delete,
);

export default router;
