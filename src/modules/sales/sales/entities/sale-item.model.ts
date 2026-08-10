import {DataTypes, Model} from 'sequelize';
import sequelize from '../../../../database/connection';

class SaleItem extends Model {
  declare id: number;

  declare saleId: number;
  declare tenantId: number;

  declare productId: number;

  declare productName: string;

  declare quantity: number;
  declare unitPriceCents: number;
  declare subtotalCents: number;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

SaleItem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    saleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    productName: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },

    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    unitPriceCents: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    subtotalCents: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'sale_items',
    timestamps: true,

    indexes: [
      {
        fields: ['saleId'],
      },
      {
        fields: ['tenantId'],
      },
      {
        fields: ['productId'],
      },
    ],
  },
);

export default SaleItem;
