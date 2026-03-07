import { Router } from 'express';
import { withdraw, getWithdrawalHistory } from './transactions.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

// POST /api/transactions/withdraw  (protected)
router.post('/withdraw', authenticate, withdraw);

// GET /api/transactions/history  (protected)
router.get('/history', authenticate, getWithdrawalHistory);

export default router;