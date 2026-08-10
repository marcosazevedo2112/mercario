import Sale from './sale.model';
import SaleItem from './sale-item.model';
import Installment from './installment.model';
import Settlement from './settlement.model';
import Charge from './charge.model';

Sale.hasMany(SaleItem, {foreignKey: 'saleId', as: 'items'});
SaleItem.belongsTo(Sale, {foreignKey: 'saleId', as: 'sale'});
Sale.hasMany(Installment, {foreignKey: 'saleId', as: 'installments'});
Installment.belongsTo(Sale, {foreignKey: 'saleId', as: 'sale'});
Sale.hasOne(Settlement, {foreignKey: 'saleId', as: 'settlement'});
Settlement.belongsTo(Sale, {foreignKey: 'saleId', as: 'sale'});
Installment.hasMany(Charge, {foreignKey: 'installmentId', as: 'charges'});
Charge.belongsTo(Installment, {foreignKey: 'installmentId', as: 'installment'});
