import Redis from 'ioredis';
import { env } from './env';


export const redis = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  lazyConnect: true,
});

redis.on('connect', () => {
  console.log('Redis Connected');
});

redis.on('error', (err) => {
  console.error('Redis Error:', err);
});
