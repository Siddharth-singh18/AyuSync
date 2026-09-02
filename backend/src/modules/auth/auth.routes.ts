import { Router } from 'express';
import { login, getDoctors } from './auth.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.post('/login', login);
router.get('/doctors', authenticate, getDoctors);

export default router;
