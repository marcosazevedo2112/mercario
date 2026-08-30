import {Request, Response} from 'express';
import SalesService from './sales.service';
import {AppError} from '../../errors/appError';
import {getTenantId} from '../shared/utils/getTenantId';
import {
  createSaleSchema,
  cancelSaleSchema,
  settleSaleSchema,
} from './schemas/create.sales';
import {SaleStatus} from './sales/enums/sale-status';

const parseId = (value: string | string[]) => {
  if (Array.isArray(value)) throw new AppError('Identificador inválido', 400);
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0)
    throw new AppError('Identificador inválido', 400);
  return id;
};

function isSaleStatus(value: string): boolean {
  return (Object.values(SaleStatus) as string[]).includes(value);
}

function isoDateNDaysFromToday(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

const SalesController = {
  create: async (req: Request, res: Response) => {
    try {
      const tenantId = getTenantId(req);
      if (!req.session?.user?.id) return res.status(401).send();
      const sale = await SalesService.create(
        createSaleSchema.parse(req.body),
        tenantId,
        req.session.user.id,
      );
      return res.status(201).json(sale);
    } catch (error: unknown) {
      if (error instanceof AppError)
        return res.status(error.statusCode).json({message: error.message});
      return res.status(400).json({
        message: error instanceof Error ? error.message : 'Requisição inválida',
      });
    }
  },
  findMany: async (req: Request, res: Response) => {
    try {
      const tenantId = getTenantId(req);
      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
      const rawStatus = req.query.status
        ? String(req.query.status).trim()
        : undefined;
      const status =
        rawStatus && isSaleStatus(rawStatus)
          ? (rawStatus as SaleStatus)
          : undefined;
      const customerId = req.query.customerId
        ? parseId(String(req.query.customerId))
        : undefined;
      const search = req.query.search
        ? String(req.query.search).trim()
        : undefined;
      const result = await SalesService.findMany(tenantId, {
        page,
        limit,
        status,
        customerId,
        search,
      });
      return res.status(200).json(result);
    } catch (error: unknown) {
      if (error instanceof AppError)
        return res.status(error.statusCode).json({message: error.message});
      return res.status(400).json({
        message: error instanceof Error ? error.message : 'Requisição inválida',
      });
    }
  },
  getReceivables: async (req: Request, res: Response) => {
    try {
      const tenantId = getTenantId(req);
      const from =
        typeof req.query.from === 'string' && req.query.from.trim()
          ? req.query.from.trim().slice(0, 10)
          : isoDateNDaysFromToday(-60);
      const to =
        typeof req.query.to === 'string' && req.query.to.trim()
          ? req.query.to.trim().slice(0, 10)
          : isoDateNDaysFromToday(7);
      const finalFrom = from <= to ? from : to;
      const finalTo = from <= to ? to : from;
      const result = await SalesService.getReceivables({
        tenantId,
        from: finalFrom,
        to: finalTo,
      });
      return res.status(200).json(result);
    } catch (error: unknown) {
      if (error instanceof AppError)
        return res.status(error.statusCode).json({message: error.message});
      return res.status(400).json({
        message: error instanceof Error ? error.message : 'Requisição inválida',
      });
    }
  },
  findById: async (req: Request, res: Response) => {
    try {
      const sale = await SalesService.findById(
        parseId(req.params.id),
        getTenantId(req),
      );
      if (!req.accepts('json')) {
        return res.render('sales/show', {sale: sale.toJSON(), title: 'Venda'});
      }
      return res.status(200).json(sale);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        if (!req.accepts('json')) {
          return res.status(error.statusCode).render('sales/show', {
            sale: null,
            title: 'Venda',
            error: error.message,
          });
        }
        return res.status(error.statusCode).json({message: error.message});
      }
      if (!req.accepts('json')) {
        return res.status(500).render('sales/show', {
          sale: null,
          title: 'Venda',
          error: 'Erro interno do servidor',
        });
      }
      return res.status(500).json({message: 'Erro interno do servidor'});
    }
  },
  cancel: async (req: Request, res: Response) => {
    try {
      if (!req.session?.user?.id) return res.status(401).send();
      const data = cancelSaleSchema.parse(req.body);
      await SalesService.cancel(
        parseId(req.params.id),
        getTenantId(req),
        req.session.user.id,
        data.reason,
      );
      return res.status(204).send();
    } catch (error: unknown) {
      if (error instanceof AppError)
        return res.status(error.statusCode).json({message: error.message});
      return res.status(400).json({
        message: error instanceof Error ? error.message : 'Requisição inválida',
      });
    }
  },
  registerPayment: async (req: Request, res: Response) => {
    try {
      const result = await SalesService.registerPayment(
        parseId(req.params.installmentId),
        parseId(req.params.id),
        getTenantId(req),
        new Date(),
      );
      return res.status(200).json({
        message: 'Pagamento registrado com sucesso',
        installment: {
          id: result.installment.id,
          status: result.installment.status,
          paidAmountCents: result.installment.paidAmountCents,
          paidAt: result.installment.paidAt,
        },
        saleCompleted: result.saleCompleted,
      });
    } catch (error: unknown) {
      if (error instanceof AppError)
        return res.status(error.statusCode).json({message: error.message});
      return res.status(400).json({
        message: error instanceof Error ? error.message : 'Requisição inválida',
      });
    }
  },
  settle: async (req: Request, res: Response) => {
    try {
      if (!req.session?.user?.id) return res.status(401).send();
      const data = settleSaleSchema.parse(req.body);
      const settlement = await SalesService.settle(
        parseId(req.params.id),
        getTenantId(req),
        {...data, settledBy: req.session.user.id},
      );
      return res.status(201).json(settlement);
    } catch (error: unknown) {
      if (error instanceof AppError)
        return res.status(error.statusCode).json({message: error.message});
      return res.status(400).json({
        message: error instanceof Error ? error.message : 'Requisição inválida',
      });
    }
  },
  pageList: async (req: Request, res: Response) => {
    try {
      const tenantId = getTenantId(req);
      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
      const rawStatus = req.query.status
        ? String(req.query.status).trim()
        : undefined;
      const saleStatus =
        rawStatus && isSaleStatus(rawStatus)
          ? (rawStatus as SaleStatus)
          : undefined;
      const search = req.query.search
        ? String(req.query.search).trim() || undefined
        : undefined;
      const fromParam =
        typeof req.query.from === 'string' && req.query.from.trim()
          ? req.query.from.trim().slice(0, 10)
          : isoDateNDaysFromToday(-60);
      const toParam =
        typeof req.query.to === 'string' && req.query.to.trim()
          ? req.query.to.trim().slice(0, 10)
          : isoDateNDaysFromToday(7);
      const from = fromParam <= toParam ? fromParam : toParam;
      const to = fromParam <= toParam ? toParam : fromParam;

      const [salesResult, receivables] = await Promise.all([
        SalesService.findMany(tenantId, {
          page,
          limit,
          status: saleStatus,
          search,
        }),
        SalesService.getReceivables({tenantId, from, to}).catch(() => ({
          grouped: {} as Record<string, unknown>,
          summary: {overdueTotal: 0, todayTotal: 0, upcomingTotal: 0},
          installments: [] as unknown[],
        })),
      ]);

      return res.render('sales/index', {
        sales: salesResult.data.map(s => s.toJSON()),
        pagination: salesResult.pagination,
        receivables,
        summary: (
          receivables as {
            summary: {overdueTotal: number; todayTotal: number; upcomingTotal: number};
          }
        ).summary,
        grouped: (receivables as {grouped: Record<string, unknown>}).grouped,
        search: search || '',
        status: rawStatus || '',
        from,
        to,
        today: new Date().toISOString().slice(0, 10),
        query: req.query,
        error: null,
      });
    } catch (error: unknown) {
      console.error(error);
      return res.status(500).render('sales/index', {
        sales: [],
        pagination: {page: 1, limit: 20, total: 0, totalPages: 0},
        receivables: {
          grouped: {},
          summary: {overdueTotal: 0, todayTotal: 0, upcomingTotal: 0},
          installments: [],
        },
        summary: {overdueTotal: 0, todayTotal: 0, upcomingTotal: 0},
        grouped: {},
        search: req.query.search ? String(req.query.search) : '',
        status: req.query.status ? String(req.query.status) : '',
        from: isoDateNDaysFromToday(-60),
        to: isoDateNDaysFromToday(7),
        today: new Date().toISOString().slice(0, 10),
        query: req.query,
        error:
          error instanceof Error
            ? error.message
            : 'Não foi possível carregar as vendas.',
      });
    }
  },
};

export default SalesController;
