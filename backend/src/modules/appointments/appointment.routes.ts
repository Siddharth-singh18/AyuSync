import { Router } from 'express';
import { bookAppointment, getAllAppointments } from './appointment.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();
router.use(authenticate);

router.post('/', bookAppointment);
router.get('/', getAllAppointments);

export default router;
