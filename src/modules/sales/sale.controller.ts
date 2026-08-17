import {Request, Response} from 'express';
import SalesService from './sales.service';
import {AppError} from '../../errors/appError';
import {getTenantId} from '../shared/utils/getTenantId';
import {createSaleSchema, cancelSaleSchema, settleSaleSchema} from './schemas/create.sales';
import {SaleStatus} from './sales/enums/sale-status';
import CustomerService from '../customers/customer.service';

const parseId = (value: string | string[]) => {
  if (Array.isArray(value)) throw new AppError('Identificador inválido', 400);
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw new AppError('Identificador inválido', 400);
  return id;
};

const SalesController = {
  create: async (req: Request, res: Response) => {
    try { const tenantId = getTenantId(req); if (!req.session?.user?.id) return res.status(401).send(); const sale = await SalesService.create(createSaleSchema.parse(req.body), tenantId, req.session.user.id); return res.status(201).json(sale); }
    catch (error: unknown) { if (error instanceof AppError) return res.status(error.statusCode).json({message: error.message}); return res.status(400).json({message: error instanceof Error ? error.message : 'Requisição inválida'}); }
  },
  findMany: async (req: Request, res: Response) => {
    try { const tenantId = getTenantId(req); const page = Math.max(1, Number(req.query.page) || 1); const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20)); const status = req.query.status as SaleStatus | undefined; const customerId = req.query.customerId ? parseId(String(req.query.customerId)) : undefined; const search = req.query.search ? String(req.query.search).trim() : undefined; const result = await SalesService.findMany(tenantId, {page, limit, status, customerId, search}); return res.status(200).json(result); }
    catch (error: unknown) { if (error instanceof AppError) return res.status(error.statusCode).json({message: error.message}); return res.status(400).json({message: error instanceof Error ? error.message : 'Requisição inválida'}); }
  },
  findById: async (req: Request, res: Response) => {
    try { const sale = await SalesService.findById(parseId(req.params.id), getTenantId(req)); return res.status(200).json(sale); }
    catch (error: unknown) { if (error instanceof AppError) return res.status(error.statusCode).json({message: error.message}); return res.status(500).json({message: 'Erro interno do servidor'}); }
  },
  cancel: async (req: Request, res: Response) => {
    try { if (!req.session?.user?.id) return res.status(401).send(); const data = cancelSaleSchema.parse(req.body); await SalesService.cancel(parseId(req.params.id), getTenantId(req), req.session.user.id, data.reason); return res.status(204).send(); }
    catch (error: unknown) { if (error instanceof AppError) return res.status(error.statusCode).json({message: error.message}); return res.status(400).json({message: error instanceof Error ? error.message : 'Requisição inválida'}); }
  },
  registerPayment: async (req: Request, res: Response) => {
    try { await SalesService.registerPayment(parseId(req.params.installmentId), parseId(req.params.id), getTenantId(req), new Date()); return res.status(204).send(); }
    catch (error: unknown) { if (error instanceof AppError) return res.status(error.statusCode).json({message: error.message}); return res.status(400).json({message: error instanceof Error ? error.message : 'Requisição inválida'}); }
  },
  settle: async (req: Request, res: Response) => {
    try { if (!req.session?.user?.id) return res.status(401).send(); const data = settleSaleSchema.parse(req.body); const settlement = await SalesService.settle(parseId(req.params.id), getTenantId(req), {...data, settledBy: req.session.user.id}); return res.status(201).json(settlement); }
    catch (error: unknown) { if (error instanceof AppError) return res.status(error.statusCode).json({message: error.message}); return res.status(400).json({message: error instanceof Error ? error.message : 'Requisição inválida'}); }
  },
  pageList: async (req: Request, res: Response) => {
    try {
      const tenantId = getTenantId(req);
      const result = await SalesService.findMany(tenantId, {page: 1, limit: 20});
      const customers = await CustomerService.findAll(tenantId);
      const customerMap = new Map(customers.map(customer => [customer.id, customer]));
      const sales = result.data.map(sale => ({...sale.toJSON(), customer: customerMap.get(sale.customerId) ?? null}));
      return res.render('sales/index', {sales, pagination: result.pagination, error: null});
    } catch (error: unknown) {
      console.error(error);
      return res.status(500).render('sales/index', {sales: [], pagination: null, error: error instanceof Error ? error.message : 'Não foi possível carregar as vendas.'});
    }
  },
};

export default SalesController;
