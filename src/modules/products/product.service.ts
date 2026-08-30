import {Op} from 'sequelize';
import Product from './product.model';
import {CreateProductDTO} from './schemas/product.create.schema';
import {UpdateProductDTO} from './schemas/product.update.schema';
import {AppError} from '../../errors/appError';

const ProductService = {
  create: async (data: CreateProductDTO, tenantId: number) => {
    const product = await Product.create({
      ...data,
      tenantId,
    });

    return product;
  },

  findAll: async (tenantId: number, opts?: {search?: string}) => {
    const search = opts?.search?.trim();
    const where: Record<string, unknown> = {tenantId, active: true};
    if (search) {
      const like = `%${search.replace(/[%_\\]/g, '\\$&')}%`;
      Object.assign(where, {
        [Op.or]: [
          {name: {[Op.iLike]: like}},
          {description: {[Op.iLike]: like}},
        ],
      });
    }
    const products = await Product.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: search ? 10 : undefined,
    });

    return products;
  },

  findById: async (id: number, tenantId: number) => {
    const product = await Product.findOne({
      where: {
        id,
        tenantId,
        active: true,
      },
    });

    if (!product) {
      throw new AppError('Produto não encontrado', 404);
    }

    return product;
  },

  update: async (id: number, tenantId: number, data: UpdateProductDTO) => {
    const product = await ProductService.findById(id, tenantId);

    await product.update(data);

    return product;
  },

  delete: async (id: number, tenantId: number) => {
    const product = await ProductService.findById(id, tenantId);
    if (!product) {
      throw new AppError('Product not found', 404);
    }
    await product.update({
      active: false,
    });

    return true;
  },
};

export default ProductService;
