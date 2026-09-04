import { Router } from 'express';
import { enqueuePatient, getQueueForDoctor, updateQueueStatus, getAllQueue } from './queue.controller';
import { requirePermission } from '../../middleware/rbac';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.use(authenticate);

// Ideally require queue-specific permission if schema defines it, else fallback
router.post('/', requirePermission('encounter.create'), enqueuePatient);
router.get('/', getAllQueue);
router.get('/doctor/:doctorId', getQueueForDoctor);
router.put('/:id/status', updateQueueStatus);

export default router;
