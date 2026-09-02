import { Router } from 'express';
import { bookAppointment } from './appointment.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();
router.use(authenticate);

router.post('/', bookAppointment);

export default router;
