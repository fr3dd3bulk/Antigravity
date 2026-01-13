import express from 'express';
import {
  getAllWorkflowActions,
  getWorkflowAction,
  upsertWorkflowAction,
  disableWorkflowAction,
  enableWorkflowAction,
  getWorkflowActionStats,
  syncWorkflowActions
} from '../controllers/workflowActionController.js';
import { protect } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = express.Router();

// All routes require authentication and super admin role
router.use(protect);
router.use(requireRole('super_admin'));

// Get all workflow actions
router.get('/', getAllWorkflowActions);

// Get workflow action statistics
router.get('/stats', getWorkflowActionStats);

// Sync workflow actions from node definitions
router.post('/sync', syncWorkflowActions);

// Get a specific workflow action
router.get('/:actionId', getWorkflowAction);

// Create or update a workflow action
router.put('/:actionId', upsertWorkflowAction);

// Disable a workflow action
router.post('/:actionId/disable', disableWorkflowAction);

// Enable a workflow action
router.post('/:actionId/enable', enableWorkflowAction);

export default router;
