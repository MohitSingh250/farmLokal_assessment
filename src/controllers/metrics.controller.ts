import { Request, Response } from 'express';
import { dbPool } from '../config/mysql';
import { redis } from '../config/redis';

export const MetricsController = {
  getMetrics: async (req: Request, res: Response) => {
    try {
      const dbStatus = await dbPool.query('SELECT 1').then(() => 'up').catch(() => 'down');
      const redisStatus = await redis.ping().then(() => 'up').catch(() => 'down');
      
      const memoryUsage = process.memoryUsage();
      
      const metrics = {
        status: 'UP',
        timestamp: new Date(),
        uptime: process.uptime(),
        dependencies: {
          database: dbStatus,
          redis: redisStatus,
        },
        memory: {
          rss: Math.round(memoryUsage.rss / 1024 / 1024) + 'MB',
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + 'MB',
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + 'MB',
        }
      };

      res.status(200).json(metrics);
    } catch (error) {
      res.status(500).json({ status: 'ERROR', error: 'Failed to collect metrics' });
    }
  }
};
