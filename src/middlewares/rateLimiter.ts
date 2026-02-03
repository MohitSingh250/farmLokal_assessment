import { RateLimiterRedis } from 'rate-limiter-flexible';
import { redis } from '../config/redis';
import { Request, Response, NextFunction } from 'express';

const rateLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'mid_rl',
  points: 10,
  duration: 1,
});

export const rateLimiterMiddleware = (req: Request, res: Response, next: NextFunction) => {
  rateLimiter.consume(req.ip as string)
    .then(() => {
      next();
    })
    .catch(() => {
      res.status(429).json({ status: 'error', message: 'Too Many Requests' });
    });
};
