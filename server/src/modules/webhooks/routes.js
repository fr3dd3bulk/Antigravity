import express from 'express';
import { triggerWebhook, triggerWebhookGet } from './controller.js';

const router = express.Router();

// Public webhook endpoints (no auth required)
router.post('/:webhookId', triggerWebhook);
router.get('/:webhookId', triggerWebhookGet);

export default router;
