import express from 'express';
import {
  createPlan,
  getPlans,
  updatePlan,
  getSystemStats
} from '../controllers/adminController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.post('/plans', createPlan);
router.get('/plans', getPlans);
router.put('/plans/:planId', updatePlan);
router.get('/stats', getSystemStats);

export default router;
