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

  findAll: async (tenantId: number) => {
    const products = await Product.findAll({
      where: {
        tenantId,
        active: true,
      },
      order: [['createdAt', 'DESC']],
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
