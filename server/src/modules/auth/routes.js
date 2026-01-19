import express from 'express';
import { register, login, getCurrentUser } from './controller.js';
import { authenticate } from './middleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getCurrentUser);

export default router;
