import {CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model} from 'sequelize';
import sequelize from '../../../../database/connection';
import {PaymentMethod} from '../enums/payment-method';

class Settlement extends Model<InferAttributes<Settlement>, InferCreationAttributes<Settlement>> {
  declare id: CreationOptional<number>;
  declare saleId: number;
  declare tenantId: number;
  declare originalRemainingCents: number;
  declare discountCents: CreationOptional<number>;
  declare settledAmountCents: number;
  declare paymentMethod: PaymentMethod;
  declare settledAt: Date;
  declare settledBy: number | 'system';
  declare notes: string | null;
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
}

Settlement.init(
  {
    id: {type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true},
    saleId: {type: DataTypes.INTEGER, allowNull: false, unique: true},
    tenantId: {type: DataTypes.INTEGER, allowNull: false},
    originalRemainingCents: {type: DataTypes.INTEGER, allowNull: false},
    discountCents: {type: DataTypes.INTEGER, allowNull: false, defaultValue: 0},
    settledAmountCents: {type: DataTypes.INTEGER, allowNull: false},
    paymentMethod: {type: DataTypes.STRING(30), allowNull: false},
    settledAt: {type: DataTypes.DATE, allowNull: false},
    settledBy: {type: DataTypes.STRING(20), allowNull: false},
    notes: {type: DataTypes.TEXT, allowNull: true},
  },
  {
    sequelize,
    tableName: 'settlements',
    timestamps: true,
    indexes: [
      {fields: ['tenantId']},
      {fields: ['saleId'], unique: true},
    ],
  },
);

export default Settlement;
