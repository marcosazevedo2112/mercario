import userModel from '../user/user.model';
import tenantModel from '../tenants/tenant.model';
import bcrypt from 'bcrypt';
import {AccountDTO} from './schemas/account.register.schema';
import sequelize from '../../database/connection';
import {AppError} from '../../errors/appError';
import generateSlug from '../shared/utils/generateSlug';
import {LoginDTO} from './schemas/account.login.schema';

const AuthService = {
  createAccount: async (userData: AccountDTO) => {
    const existingUser = await userModel.findOne({
      where: {email: userData.email},
    });

    if (existingUser) {
      throw new AppError('User already exists', 409);
    }

    return sequelize.transaction(async transaction => {
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      const tenant = await tenantModel.create(
        {
          name: userData.tenantName,
          slug: generateSlug(userData.tenantName),
        },
        {transaction, logging: console.log},
      );

      const user = await userModel.create(
        {
          name: userData.name,
          email: userData.email,
          passwordHash: hashedPassword,
          tenantId: tenant.id,
        },
        {transaction, logging: console.log},
      );

      return {user, tenant};
    });
  },
  login: async (loginData: LoginDTO) => {
    loginData.email = loginData.email.toLowerCase();
    const user = await userModel.findOne({
      where: {email: loginData.email},
    });

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isMatch = await bcrypt.compare(loginData.password, user.passwordHash);

    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    return user;
  },
};

export default AuthService;
