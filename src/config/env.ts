import {config} from 'dotenv-safe';
config();

function getEnv(key: string): string {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }

  return value;
}

export default {
  NODE_ENV: process.env.NODE_ENV || 'development',

  PORT: Number(process.env.PORT || 3000),

  DB_HOST: getEnv('DB_HOST'),
  DB_PORT: Number(process.env.DB_PORT || 5432),
  DB_NAME: getEnv('DB_NAME'),
  DB_USER: getEnv('DB_USER'),
  DB_PASSWORD: getEnv('DB_PASSWORD'),

  SESSION_SECRET: getEnv('SESSION_SECRET'),
};
