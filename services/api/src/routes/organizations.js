import express from 'express';
import {
  createOrganization,
  getOrganizations,
  getOrganization,
  updateOrganization
} from '../controllers/organizationController.js';
import { authenticate } from '../middleware/auth.js';
import { requireOrgAccess } from '../middleware/rbac.js';

const router = express.Router();

router.use(authenticate);

router.post('/', createOrganization);
router.get('/', getOrganizations);
router.get('/:organizationId', requireOrgAccess, getOrganization);
router.put('/:organizationId', requireOrgAccess, updateOrganization);

export default router;
