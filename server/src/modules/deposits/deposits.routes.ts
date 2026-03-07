import { Router } from 'express';
import { submitDeposit, getMyDeposits } from './deposits.controller';
import { authenticate } from '../../middleware/auth';
import { upload } from '../../middleware/upload';

const router = Router();

// POST /api/deposits         — submit a deposit request with optional receipt
router.post('/', authenticate, upload.single('receipt'), submitDeposit);

// GET  /api/deposits/history — get logged-in user's deposit history
router.get('/history', authenticate, getMyDeposits);

export default router;