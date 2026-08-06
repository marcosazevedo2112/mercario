// src/modules/users/user.model.ts

import {DataTypes, Model} from 'sequelize';
import sequelize from '../../database/connection';
import Tenant from '../tenants/tenant.model';

class User extends Model {
  declare id: number;
  declare tenantId: number;

  declare name: string;
  declare email: string;
  declare passwordHash: string;

  declare createdAt: Date;
  declare updatedAt: Date;
}

User.init(
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
      type: DataTypes.STRING(120),
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING(180),
      allowNull: false,
    },

    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['tenantId', 'email'],
      },
    ],
  },
);

User.belongsTo(Tenant, {
  foreignKey: 'tenantId',
  as: 'tenant',
});

export default User;
