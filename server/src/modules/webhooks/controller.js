import Workflow from '../../models/Workflow.js';
import { addWorkflowJob } from '../../engine/worker.js';

/**
 * @swagger
 * /hooks/{webhookId}:
 *   post:
 *     summary: Trigger workflow via webhook
 *     tags: [Webhooks]
 *     parameters:
 *       - in: path
 *         name: webhookId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Workflow triggered successfully
 */
export const triggerWebhook = async (req, res) => {
  try {
    const { webhookId } = req.params;

    // Find workflow with this webhook ID
    const workflow = await Workflow.findOne({
      webhookId,
      active: true,
      'trigger.type': 'webhook',
    });

    if (!workflow) {
      return res.status(404).json({ error: 'Webhook not found or workflow is inactive' });
    }

    // Trigger workflow with webhook data
    const triggerData = {
      method: req.method,
      headers: req.headers,
      query: req.query,
      body: req.body,
      timestamp: new Date().toISOString(),
    };

    const job = await addWorkflowJob(workflow._id.toString(), triggerData);

    res.json({
      message: 'Workflow triggered successfully',
      webhookId,
      jobId: job.id,
    });
  } catch (error) {
    console.error('Webhook trigger error:', error);
    res.status(500).json({ error: 'Failed to trigger workflow' });
  }
};

/**
 * @swagger
 * /hooks/{webhookId}:
 *   get:
 *     summary: Trigger workflow via webhook (GET)
 *     tags: [Webhooks]
 *     parameters:
 *       - in: path
 *         name: webhookId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Workflow triggered successfully
 */
export const triggerWebhookGet = triggerWebhook;
