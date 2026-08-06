import {Request, Response} from 'express';
import CustomerService from './customer.service';
import {AppError} from '../../errors/appError';
import {getTenantId} from '../shared/utils/getTenantId';

const CustomerController = {
  create: async (req: Request, res: Response) => {
    try {
      const tenantId = getTenantId(req);

      const customer = await CustomerService.create(req.body, tenantId);

      return res.status(201).json(customer);
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

      const customers = await CustomerService.findAll(tenantId);

      return res.status(200).json(customers);
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

      const customer = await CustomerService.findById(id, tenantId);

      return res.status(200).json(customer);
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

      const customer = await CustomerService.update(id, tenantId, req.body);

      return res.status(200).json(customer);
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

      await CustomerService.delete(id, tenantId);

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

export default CustomerController;
