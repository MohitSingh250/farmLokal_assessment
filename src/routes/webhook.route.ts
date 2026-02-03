import { Router } from 'express';
import { WebhookController } from '../controllers/webhook.controller';

const router = Router();

router.post('/update', WebhookController.handleUpdate);

export default router;
