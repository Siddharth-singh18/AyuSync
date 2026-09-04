import { Router } from 'express';
import { processSyncBatch } from './sync.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.post('/', authenticate, processSyncBatch);

export default router;
