import express from 'express';
import {
  createWorkflow,
  getWorkflows,
  getWorkflow,
  updateWorkflow,
  deleteWorkflow,
  activateWorkflow,
  deactivateWorkflow
} from '../controllers/workflowController.js';
import { authenticate } from '../middleware/auth.js';
import { requireOrgAccess, requirePermission } from '../middleware/rbac.js';

const router = express.Router({ mergeParams: true });

router.use(authenticate);

router.post('/', requirePermission('workflow', 'create'), createWorkflow);
router.get('/', requireOrgAccess, getWorkflows);
router.get('/:workflowId', requireOrgAccess, getWorkflow);
router.put('/:workflowId', requirePermission('workflow', 'update'), updateWorkflow);
router.delete('/:workflowId', requirePermission('workflow', 'delete'), deleteWorkflow);
router.post('/:workflowId/activate', requirePermission('workflow', 'execute'), activateWorkflow);
router.post('/:workflowId/deactivate', requirePermission('workflow', 'execute'), deactivateWorkflow);

export default router;
