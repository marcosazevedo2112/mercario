import {CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model} from 'sequelize';
import sequelize from '../../../../database/connection';
import {ChargeChannel} from '../enums/charge-channel';
import {ChargeTrigger} from '../enums/charge-trigger';

class Charge extends Model<InferAttributes<Charge>, InferCreationAttributes<Charge>> {
  declare id: CreationOptional<number>;
  declare installmentId: number;
  declare tenantId: number;
  declare sentBy: number | 'system';
  declare triggeredBy: ChargeTrigger;
  declare channel: ChargeChannel;
  declare message: string;
  declare readonly createdAt: CreationOptional<Date>;
}

Charge.init(
  {
    id: {type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true},
    installmentId: {type: DataTypes.INTEGER, allowNull: false},
    tenantId: {type: DataTypes.INTEGER, allowNull: false},
    sentBy: {type: DataTypes.STRING(20), allowNull: false},
    triggeredBy: {type: DataTypes.ENUM(...Object.values(ChargeTrigger)), allowNull: false},
    channel: {type: DataTypes.ENUM(...Object.values(ChargeChannel)), allowNull: false},
    message: {type: DataTypes.TEXT, allowNull: false},
  },
  {
    sequelize,
    tableName: 'charges',
    timestamps: true,
    updatedAt: false,
    indexes: [{fields: ['installmentId']}, {fields: ['tenantId']}],
  },
);

export default Charge;
