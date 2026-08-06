import {Request, Response} from 'express';
import ProductService from './product.service';
import {AppError} from '../../errors/appError';
import {getTenantId} from '../shared/utils/getTenantId';

const ProductController = {
  create: async (req: Request, res: Response) => {
    try {
      const tenantId = getTenantId(req);

      const product = await ProductService.create(req.body, tenantId);

      return res.status(201).json(product);
    } catch (error: unknown) {
      console.error(error);

      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          message: error.message,
        });
      }

      return res.status(500).json({
        message: 'Erro interno do servidor',
      });
    }
  },

  findAll: async (req: Request, res: Response) => {
    try {
      const tenantId = getTenantId(req);

      const products = await ProductService.findAll(tenantId);

      return res.status(200).json(products);
    } catch (error: unknown) {
      console.error(error);

      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          message: error.message,
        });
      }

      return res.status(500).json({
        message: 'Erro interno do servidor',
      });
    }
  },

  findById: async (req: Request, res: Response) => {
    try {
      const tenantId = getTenantId(req);
      const id = Number(req.params.id);

      const product = await ProductService.findById(id, tenantId);

      return res.status(200).json(product);
    } catch (error: unknown) {
      console.error(error);

      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          message: error.message,
        });
      }

      return res.status(500).json({
        message: 'Erro interno do servidor',
      });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const tenantId = getTenantId(req);
      const id = Number(req.params.id);

      const product = await ProductService.update(id, tenantId, req.body);

      return res.status(200).json(product);
    } catch (error: unknown) {
      console.error(error);

      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          message: error.message,
        });
      }

      return res.status(500).json({
        message: 'Erro interno do servidor',
      });
    }
  },

  delete: async (req: Request, res: Response) => {
    try {
      const tenantId = getTenantId(req);
      const id = Number(req.params.id);

      await ProductService.delete(id, tenantId);

      return res.status(204).send();
    } catch (error: unknown) {
      console.error(error);

      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          message: error.message,
        });
      }

      return res.status(500).json({
        message: 'Erro interno do servidor',
      });
    }
  },
};

export default ProductController;
