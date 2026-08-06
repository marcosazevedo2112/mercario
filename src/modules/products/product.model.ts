import {DataTypes, Model} from 'sequelize';
import sequelize from '../../database/connection';
import Tenant from '../tenants/tenant.model';

class Product extends Model {
  declare id: number;
  declare tenantId: number;

  declare name: string;
  declare description: string | null;

  declare priceCents: number;
  declare costPriceCents: number | null;

  declare active: boolean;
}

Product.init(
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

    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    priceCents: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    costPriceCents: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'products',
    timestamps: true,

    indexes: [
      {
        fields: ['tenantId'],
      },
    ],
  },
);

Product.belongsTo(Tenant, {
  foreignKey: 'tenantId',
  as: 'tenant',
});

export default Product;
