import { Router } from 'express';

const router = Router();

router.get('/', async (req, res) => {
  res.json({ status: 'ok' });
});

router.get('/metrics', async (req, res) => {
  const memoryUsage = process.memoryUsage();
  res.json({
    uptime: process.uptime(),
    memory: {
      rss: Math.round(memoryUsage.rss / 1024 / 1024) + 'MB',
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + 'MB',
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + 'MB',
    },
    load: process.cpuUsage(),
  });
});

export default router;
