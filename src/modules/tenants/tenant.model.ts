import {DataTypes, Model, Optional} from 'sequelize';

import sequelize from '../../database/connection';

interface TenantAttributes {
  id: number;
  name: string;
  slug: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface TenantCreationAttributes extends Optional<TenantAttributes, 'id'> {}

class Tenant
  extends Model<TenantAttributes, TenantCreationAttributes>
  implements TenantAttributes
{
  declare id: number;
  declare name: string;
  declare slug: string;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Tenant.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },

    slug: {
      type: DataTypes.STRING(80),
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize,
    tableName: 'tenants',
    timestamps: true,
  },
);

export default Tenant;
