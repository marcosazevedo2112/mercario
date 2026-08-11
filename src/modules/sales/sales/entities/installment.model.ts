import {DataTypes, Model} from 'sequelize';
import sequelize from '../../../../database/connection';
import {InstallmentStatus} from '../enums/installment-status';

class Installment extends Model {
  declare id: number;
  declare saleId: number;
  declare tenantId: number;
  declare number: number;
  declare amountCents: number;
  declare paidAmountCents: number;
  declare dueDate: Date;
  declare status: InstallmentStatus;
  declare paidAt: Date | null;
  declare settlementId: number | null;
  declare notes: string | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Installment.init(
  {
    id: {type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true},
    saleId: {type: DataTypes.INTEGER, allowNull: false},
    tenantId: {type: DataTypes.INTEGER, allowNull: false},
    number: {type: DataTypes.INTEGER, allowNull: false},
    amountCents: {type: DataTypes.INTEGER, allowNull: false},
    paidAmountCents: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    dueDate: {type: DataTypes.DATEONLY, allowNull: false},
    status: {
      type: DataTypes.ENUM(...Object.values(InstallmentStatus)),
      allowNull: false,
    },
    paidAt: {type: DataTypes.DATE, allowNull: true},
    settlementId: {type: DataTypes.INTEGER, allowNull: true},
    notes: {type: DataTypes.TEXT, allowNull: true},
  },
  {
    sequelize,
    tableName: 'installments',
    timestamps: true,
    indexes: [
      {fields: ['saleId']},
      {fields: ['tenantId']},
      {fields: ['tenantId', 'status']},
      {fields: ['dueDate']},
    ],
  },
);

export default Installment;
