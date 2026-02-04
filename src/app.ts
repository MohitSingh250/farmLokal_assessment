import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import healthRouter from './routes/health.route';
import webhookRouter from './routes/webhook.route';
import productRouter from './routes/product.route';
import metricsRouter from './routes/metrics.route';
import { rateLimiterMiddleware } from './middlewares/rateLimiter';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(rateLimiterMiddleware);

app.use('/health', healthRouter);
app.use('/webhooks', webhookRouter);
app.use('/products', productRouter);
app.use('/metrics', metricsRouter);


app.use(errorHandler);

export default app;
