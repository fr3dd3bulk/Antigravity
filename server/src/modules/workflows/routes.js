import express from 'express';
import {
  listWorkflows,
  getWorkflow,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow,
  executeWorkflow,
  getWorkflowExecutions,
} from './controller.js';
import { authenticate } from '../auth/middleware.js';

const router = express.Router();

router.get('/', authenticate, listWorkflows);
router.post('/', authenticate, createWorkflow);
router.get('/:id', authenticate, getWorkflow);
router.put('/:id', authenticate, updateWorkflow);
router.delete('/:id', authenticate, deleteWorkflow);
router.post('/:id/execute', authenticate, executeWorkflow);
router.get('/:id/executions', authenticate, getWorkflowExecutions);

export default router;
