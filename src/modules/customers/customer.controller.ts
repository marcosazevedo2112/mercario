import {Request, Response} from 'express';
import CustomerService from './customer.service';
import {AppError} from '../../errors/appError';
import {getTenantId} from '../shared/utils/getTenantId';

const CustomerController = {
  create: async (req: Request, res: Response) => {
    try {
      const customer = await CustomerService.create(req.body, getTenantId(req));
      return res.status(201).json(customer);
    } catch (error: unknown) {
      console.error(error);
      if (error instanceof AppError)
        return res.status(error.statusCode).json({message: error.message});
      return res.status(500).json({message: 'Erro interno do servidor'});
    }
  },
  findAll: async (req: Request, res: Response) => {
    try {
      const customers = await CustomerService.findAll(getTenantId(req));
      return res.status(200).json(customers);
    } catch (error: unknown) {
      console.error(error);
      if (error instanceof AppError)
        return res.status(error.statusCode).json({message: error.message});
      return res.status(500).json({message: 'Erro interno do servidor'});
    }
  },
  findById: async (req: Request, res: Response) => {
    try {
      const customer = await CustomerService.findById(
        Number(req.params.id),
        getTenantId(req),
      );
      return res.status(200).json(customer);
    } catch (error: unknown) {
      console.error(error);
      if (error instanceof AppError)
        return res.status(error.statusCode).json({message: error.message});
      return res.status(500).json({message: 'Erro interno do servidor'});
    }
  },
  update: async (req: Request, res: Response) => {
    try {
      const customer = await CustomerService.update(
        Number(req.params.id),
        getTenantId(req),
        req.body,
      );
      return res.status(200).json(customer);
    } catch (error: unknown) {
      console.error(error);
      if (error instanceof AppError)
        return res.status(error.statusCode).json({message: error.message});
      return res.status(500).json({message: 'Erro interno do servidor'});
    }
  },
  delete: async (req: Request, res: Response) => {
    try {
      await CustomerService.delete(Number(req.params.id), getTenantId(req));
      return res.status(204).send();
    } catch (error: unknown) {
      console.error(error);
      if (error instanceof AppError)
        return res.status(error.statusCode).json({message: error.message});
      return res.status(500).json({message: 'Erro interno do servidor'});
    }
  },
  pageList: async (req: Request, res: Response) => {
    try {
      const customers = await CustomerService.findAll(getTenantId(req));
      return res.render('customers/index', {customers, error: null});
    } catch (error: unknown) {
      console.error(error);
      return res.status(500).render('customers/index', {
        customers: [],
        error:
          error instanceof Error
            ? error.message
            : 'Não foi possível carregar os clientes.',
      });
    }
  },
};

export default CustomerController;
