import express from 'express';
import { listActions, getAction, createAction, updateAction, deleteAction, getCategories } from './controller.js';
import { authenticate, authorize } from '../auth/middleware.js';

const router = express.Router();

// Public/User routes
router.get('/', authenticate, listActions);
router.get('/categories', authenticate, getCategories);
router.get('/:id', authenticate, getAction);

// Super Admin only routes
router.post('/', authenticate, authorize('super_admin'), createAction);
router.put('/:id', authenticate, authorize('super_admin'), updateAction);
router.delete('/:id', authenticate, authorize('super_admin'), deleteAction);

export default router;
