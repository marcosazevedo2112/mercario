import app from './app';
import {sequelize} from './database';
import env from './config/env';

async function bootstrap() {
  try {
    await sequelize.authenticate();
    //await sequelize.sync();

    console.log('Database connected');

    app.listen(env.PORT, () => {
      console.log(`Server running on port ${env.PORT}`);
    });
  } catch (error) {
    console.error('Failed to start application');
    console.error(error);

    process.exit(1);
  }
}

void (async () => {
  await bootstrap();
})();
