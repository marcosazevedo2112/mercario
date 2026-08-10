import {AppError} from '../../../errors/appError';
import ChargeRepository from './charge.repository';
import Installment from './entities/installment.model';
import {ChargeChannel} from './enums/charge-channel';
import {ChargeTrigger} from './enums/charge-trigger';
import {InstallmentStatus} from './enums/installment-status';

interface SendChargeData {
  channel: ChargeChannel;
  triggeredBy: ChargeTrigger;
  message: string;
  sentBy: number | 'system';
}

const ChargeService = {
  send: async (installmentId: number, tenantId: number, data: SendChargeData) => {
    const installment = await Installment.findOne({where: {id: installmentId, tenantId}});
    if (!installment) throw new AppError('Parcela não encontrada', 404);
    if (installment.status !== InstallmentStatus.PENDING) throw new AppError('Só é possível cobrar uma parcela pendente', 400);
    if (!data.message.trim()) throw new AppError('A mensagem da cobrança é obrigatória', 400);
    return ChargeRepository.create({...data, installmentId, tenantId});
  },
  findMany: (installmentId: number, tenantId: number) => ChargeRepository.findManyByInstallment(installmentId, tenantId),
};

export default ChargeService;
