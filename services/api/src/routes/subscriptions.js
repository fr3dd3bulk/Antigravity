import express from 'express';
import {
  getSubscription,
  createSubscription
} from '../controllers/subscriptionController.js';
import { authenticate } from '../middleware/auth.js';
import { requireOrgAccess } from '../middleware/rbac.js';

const router = express.Router({ mergeParams: true });

router.use(authenticate);

router.get('/', requireOrgAccess, getSubscription);
router.post('/', requireOrgAccess, createSubscription);

export default router;
