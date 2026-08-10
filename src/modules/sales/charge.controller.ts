import {Request, Response} from 'express';
import {AppError} from '../../errors/appError';
import {getTenantId} from '../shared/utils/getTenantId';
import ChargeService from './sales/charge.service';
import {createChargeSchema} from './schemas/charge.sales';

const id = (value: string) => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) throw new AppError('Identificador inválido', 400);
  return parsed;
};

const ChargeController = {
  create: async (req: Request, res: Response) => {
    try {
      if (!req.session?.user?.id) return res.status(401).send();
      const charge = await ChargeService.send(id(req.params.installmentId), getTenantId(req), {...createChargeSchema.parse(req.body), sentBy: req.session.user.id});
      return res.status(201).json(charge);
    } catch (error: unknown) {
      if (error instanceof AppError) return res.status(error.statusCode).json({message: error.message});
      return res.status(400).json({message: error instanceof Error ? error.message : 'Requisição inválida'});
    }
  },
  findMany: async (req: Request, res: Response) => {
    try {
      return res.status(200).json(await ChargeService.findMany(id(req.params.installmentId), getTenantId(req)));
    } catch (error: unknown) {
      if (error instanceof AppError) return res.status(error.statusCode).json({message: error.message});
      return res.status(500).json({message: 'Erro interno do servidor'});
    }
  },
};

export default ChargeController;
