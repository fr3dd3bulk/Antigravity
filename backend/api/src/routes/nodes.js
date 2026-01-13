import express from 'express';
import {
  getNodeDefinitions,
  getNodeDefinition,
  createNodeDefinition,
  updateNodeDefinition
} from '../controllers/nodeController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getNodeDefinitions);
router.get('/:nodeType', getNodeDefinition);
router.post('/', createNodeDefinition);
router.put('/:nodeType', updateNodeDefinition);

export default router;
