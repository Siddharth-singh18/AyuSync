import { Router } from 'express';
import { updateReferralStatus, createReferral } from './referral.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', createReferral);
router.put('/:id/status', updateReferralStatus);

export default router;
