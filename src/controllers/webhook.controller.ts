import { Request, Response } from 'express';
import { redis } from '../config/redis';


export const WebhookController = {
  handleUpdate: async (req: Request, res: Response) => {
    try {
      const { event_id, status, data } = req.body;
      const processedKey = `webhook:processed:${event_id}`;
      const isProcessed = await redis.get(processedKey);

      if (isProcessed) {
        
        res.status(200).json({ status: 'ignored', message: 'Already processed' });
        return;
      }

      await redis.set(processedKey, 'true', 'EX', 60 * 60 * 24);

      res.status(200).json({ status: 'success' });
    } catch (error) {
      
      res.status(500).json({ status: 'error' });
    }
  }
};
