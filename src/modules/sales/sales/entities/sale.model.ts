import {DataTypes, Model} from 'sequelize';
import sequelize from '../../../../database/connection';

import {SaleStatus} from '../enums/sale-status';

class Sale extends Model {
  declare id: number;
  declare tenantId: number;
  declare customerId: number;

  declare subtotalCents: number;
  declare discountCents: number;
  declare totalCents: number;

  declare paymentMethod: string;
  declare installments: number;
  declare initialDueDate: Date;
  declare modality: string;

  declare notes: string | null;

  declare status: SaleStatus;

  declare createdBy: number;

  declare confirmedAt: Date;
  declare canceledAt: Date | null;
  declare canceledBy: number | null;
  declare cancelReason: string | null;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Sale.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    customerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    subtotalCents: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    discountCents: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    totalCents: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    paymentMethod: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },

    installments: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    initialDueDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    modality: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },

    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM(...Object.values(SaleStatus)),
      allowNull: false,
    },

    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    confirmedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    canceledAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    canceledBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    cancelReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'sales',
    timestamps: true,

    indexes: [
      {
        fields: ['tenantId'],
      },
      {
        fields: ['customerId'],
      },
      {
        fields: ['tenantId', 'status'],
      },
    ],
  },
);

export default Sale;
