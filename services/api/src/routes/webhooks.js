import express from 'express';
import { handleWebhook } from '../controllers/webhookController.js';
import { webhookLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

router.all('/:webhookPath', webhookLimiter, handleWebhook);

export default router;
