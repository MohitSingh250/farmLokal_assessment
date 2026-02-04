import { Router } from 'express';
import { MetricsController } from '../controllers/metrics.controller';

const router = Router();

router.get('/', MetricsController.getMetrics);

export default router;
