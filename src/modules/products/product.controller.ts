import {Request, Response} from 'express';
import ProductService from './product.service';
import {AppError} from '../../errors/appError';
import {getTenantId} from '../shared/utils/getTenantId';

const ProductController = {
  create: async (req: Request, res: Response) => {
    try { const product = await ProductService.create(req.body, getTenantId(req)); return res.status(201).json(product); }
    catch (error: unknown) { console.error(error); if (error instanceof AppError) return res.status(error.statusCode).json({message: error.message}); return res.status(500).json({message: 'Erro interno do servidor'}); }
  },
  findAll: async (req: Request, res: Response) => {
    try { const products = await ProductService.findAll(getTenantId(req)); return res.status(200).json(products); }
    catch (error: unknown) { console.error(error); if (error instanceof AppError) return res.status(error.statusCode).json({message: error.message}); return res.status(500).json({message: 'Erro interno do servidor'}); }
  },
  findById: async (req: Request, res: Response) => {
    try { const product = await ProductService.findById(Number(req.params.id), getTenantId(req)); return res.status(200).json(product); }
    catch (error: unknown) { console.error(error); if (error instanceof AppError) return res.status(error.statusCode).json({message: error.message}); return res.status(500).json({message: 'Erro interno do servidor'}); }
  },
  update: async (req: Request, res: Response) => {
    try { const product = await ProductService.update(Number(req.params.id), getTenantId(req), req.body); return res.status(200).json(product); }
    catch (error: unknown) { console.error(error); if (error instanceof AppError) return res.status(error.statusCode).json({message: error.message}); return res.status(500).json({message: 'Erro interno do servidor'}); }
  },
  delete: async (req: Request, res: Response) => {
    try { await ProductService.delete(Number(req.params.id), getTenantId(req)); return res.status(204).send(); }
    catch (error: unknown) { console.error(error); if (error instanceof AppError) return res.status(error.statusCode).json({message: error.message}); return res.status(500).json({message: 'Erro interno do servidor'}); }
  },
  pageList: async (req: Request, res: Response) => {
    try {
      const products = await ProductService.findAll(getTenantId(req));
      return res.render('products/index', {products, error: null});
    } catch (error: unknown) {
      console.error(error);
      return res.status(500).render('products/index', {products: [], error: error instanceof Error ? error.message : 'Não foi possível carregar os produtos.'});
    }
  },
};

export default ProductController;
