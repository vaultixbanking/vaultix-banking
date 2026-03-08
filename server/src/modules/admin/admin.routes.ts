import { Router } from 'express';
import {
  adminLogin,
  getDepositMethods,
  upsertDepositMethod,
  getDepositByCrypto,
  getAllUsers,
  getUserByAccount,
  creditUserAccount,
  getUserFundingHistory,
  getAdminStats,
  getAllTransactions,
  getAllDepositRequests,
  updateDepositRequestStatus,
  updateFundingTransactionStatus,
} from './admin.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

// ─── Auth ─────────────────────────────────────────────────────────────────────
router.post('/login', adminLogin);

// ─── Dashboard Stats (protected) ─────────────────────────────────────────────
router.get('/stats', authenticate, getAdminStats);

// ─── Users Management (protected) ────────────────────────────────────────────
router.get('/users', authenticate, getAllUsers);
router.get('/users/:accountNumber', authenticate, getUserByAccount);
router.post('/users/:accountNumber/credit', authenticate, creditUserAccount);
router.get('/users/:accountNumber/funding-history', authenticate, getUserFundingHistory);

// ─── Deposit Methods (protected) ─────────────────────────────────────────────
router.get('/deposit-methods', authenticate, getDepositMethods);
router.post('/deposit-methods', authenticate, upsertDepositMethod);

// ─── Deposit Address by Crypto Type (public — used by user deposit page) ─────
router.get('/deposit/:cryptoType', getDepositByCrypto);

// ─── Deposit Requests (admin review) ─────────────────────────────────────────
router.get('/deposit-requests', authenticate, getAllDepositRequests);
router.patch('/deposit-requests/:requestId/status', authenticate, updateDepositRequestStatus);

// ─── Funding Transaction Status (admin update) ──────────────────────────────
router.patch('/funding-transactions/:transactionId/status', authenticate, updateFundingTransactionStatus);

// ─── Transactions (protected) ─────────────────────────────────────────────────
router.get('/transactions', authenticate, getAllTransactions);

export default router;