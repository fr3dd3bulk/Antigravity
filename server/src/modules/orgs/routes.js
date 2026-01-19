import express from 'express';
import { getOrganization, updateOrganization, getMembers } from './controller.js';
import { authenticate, authorize } from '../auth/middleware.js';

const router = express.Router();

router.get('/', authenticate, getOrganization);
router.put('/', authenticate, authorize('org_admin'), updateOrganization);
router.get('/members', authenticate, getMembers);

export default router;
