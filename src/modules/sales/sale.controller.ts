import {Request, Response} from 'express';

import SalesService from './sales.service';
import {AppError} from '../../errors/appError';
import {getTenantId} from '../shared/utils/getTenantId';
import {createSaleSchema} from './schemas/create.sales';

const SalesController = {
  create: async (req: Request, res: Response) => {
    try {
      const tenantId = getTenantId(req);

      const data = createSaleSchema.parse(req.body);

      if (!req.session?.user?.id) {
        return res.status(401).send();
      }

      const createdBy = req.session.user.id;

      const sale = await SalesService.create(data, tenantId, createdBy);

      return res.status(201).json(sale);
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
      const saleId = Number(req.params.id);

      const sale = await SalesService.findById(saleId, tenantId);

      return res.status(200).json(sale);
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

  cancel: async (req: Request, res: Response) => {
    try {
      const tenantId = getTenantId(req);
      const saleId = Number(req.params.id);

      if (!req.session?.user?.id) {
        return res.status(401).send();
      }

      const canceledBy = req.session.user.id;

      const cancelReason = req.body.reason;

      await SalesService.cancel(saleId, tenantId, canceledBy, cancelReason);

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

  registerPayment: async (req: Request, res: Response) => {
    try {
      const tenantId = getTenantId(req);

      const saleId = Number(req.params.id);
      const installmentId = Number(req.params.installmentId);

      const paidAt = new Date();

      await SalesService.registerPayment(
        installmentId,
        saleId,
        tenantId,
        paidAt,
      );

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

export default SalesController;
