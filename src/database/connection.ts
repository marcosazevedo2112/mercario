import {Sequelize} from 'sequelize';
import env from '../config/env';

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_NAME,
  username: env.DB_USER,
  password: env.DB_PASSWORD,
  logging: console.log,
});

export default sequelize;
