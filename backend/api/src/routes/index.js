import express from 'express';
import authRoutes from './auth.js';
import userRoutes from './users.js';
import organizationRoutes from './organizations.js';
import workflowRoutes from './workflows.js';
import executionRoutes from './executions.js';
import nodeRoutes from './nodes.js';
import credentialRoutes from './credentials.js';
import adminRoutes from './admin.js';
import subscriptionRoutes from './subscriptions.js';
import webhookRoutes from './webhooks.js';
import workflowActionRoutes from './workflowActions.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/organizations', organizationRoutes);
router.use('/organizations/:organizationId/workflows', workflowRoutes);
router.use('/organizations/:organizationId/executions', executionRoutes);
router.use('/organizations/:organizationId/credentials', credentialRoutes);
router.use('/organizations/:organizationId/subscriptions', subscriptionRoutes);
router.use('/nodes', nodeRoutes);
router.use('/admin', adminRoutes);
router.use('/admin/workflow-actions', workflowActionRoutes);
router.use('/webhooks', webhookRoutes);

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
