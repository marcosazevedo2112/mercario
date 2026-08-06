import {DataTypes, Model} from 'sequelize';
import sequelize from '../../database/connection';
import Tenant from '../tenants/tenant.model';

class Customer extends Model {
  declare id: number;
  declare tenantId: number;

  declare name: string;
  declare nickname: string | null;
  declare phone: string | null;
  declare email: string | null;

  declare address: string | null;
  declare notes: string | null;

  declare active: boolean;
}

Customer.init(
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
    nickname: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },

    phone: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },

    email: {
      type: DataTypes.STRING(180),
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'customers',
    timestamps: true,

    indexes: [
      {
        fields: ['tenantId'],
      },
      {
        fields: ['tenantId', 'email'],
      },
      {
        fields: ['tenantId', 'phone'],
      },
    ],
  },
);

Customer.belongsTo(Tenant, {
  foreignKey: 'tenantId',
  as: 'tenant',
});

export default Customer;
