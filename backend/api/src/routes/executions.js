import express from 'express';
import {
  executeWorkflow,
  getExecutions,
  getExecution,
  cancelExecution,
  deleteExecution
} from '../controllers/executionController.js';
import { authenticate } from '../middleware/auth.js';
import { requireOrgAccess, requirePermission } from '../middleware/rbac.js';

const router = express.Router({ mergeParams: true });

router.use(authenticate);

router.post('/workflows/:workflowId/execute', requirePermission('workflow', 'execute'), executeWorkflow);
router.get('/', requireOrgAccess, getExecutions);
router.get('/:executionId', requireOrgAccess, getExecution);
router.post('/:executionId/cancel', requireOrgAccess, cancelExecution);
router.delete('/:executionId', requirePermission('execution', 'delete'), deleteExecution);

export default router;
