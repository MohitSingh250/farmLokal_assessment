import app from './app';
import { env } from './config/env';
import { checkDbConnection } from './config/mysql';
import { redis } from './config/redis';


const startServer = async () => {
  await checkDbConnection();
  await redis.ping();

  app.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT}`);
  });
};

startServer();
