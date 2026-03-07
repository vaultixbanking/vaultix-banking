import { Router } from 'express';
import {
  getDashboard,
  getUserInfo,
  getUserByAccount,
  updateUserBalance,
} from './user.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

// GET /api/users/dashboard  (protected)
router.get('/dashboard', authenticate, getDashboard);

// GET /api/users/info  (protected)
router.get('/info', authenticate, getUserInfo);

// GET /api/users/:accountNumber  (public - for transfers/lookups)
router.get('/:accountNumber', getUserByAccount);

// PATCH /api/users/:accountNumber/balance  (admin only in practice)
router.patch('/:accountNumber/balance', updateUserBalance);

export default router;