import express from 'express';
import {
  createCredential,
  getCredentials,
  getCredential,
  deleteCredential
} from '../controllers/credentialController.js';
import { authenticate } from '../middleware/auth.js';
import { requireOrgAccess, requirePermission } from '../middleware/rbac.js';

const router = express.Router({ mergeParams: true });

router.use(authenticate);

router.post('/', requirePermission('credential', 'create'), createCredential);
router.get('/', requireOrgAccess, getCredentials);
router.get('/:credentialId', requireOrgAccess, getCredential);
router.delete('/:credentialId', requirePermission('credential', 'delete'), deleteCredential);

export default router;
