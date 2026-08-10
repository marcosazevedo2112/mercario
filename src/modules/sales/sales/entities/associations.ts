import Sale from './sale.model';
import SaleItem from './sale-item.model';
import Installment from './installment.model';

Sale.hasMany(SaleItem, {
  foreignKey: 'saleId',
  as: 'items',
});

SaleItem.belongsTo(Sale, {
  foreignKey: 'saleId',
  as: 'sale',
});

Sale.hasMany(Installment, {
  foreignKey: 'saleId',
  as: 'installments',
});

Installment.belongsTo(Sale, {
  foreignKey: 'saleId',
  as: 'sale',
});
