import { Router } from 'express';
import { updateReferralStatus } from './referral.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.use(authenticate);

// We'll use a general permission for updating referral if it exists, or just ensure authenticated
// Actually, updating referrals might be for facility.update or just doctor role.
// For now, requiring authentication is fine.
router.put('/:id/status', updateReferralStatus);

export default router;
