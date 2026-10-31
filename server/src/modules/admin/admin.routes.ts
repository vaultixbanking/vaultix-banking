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
  getAllDepositRequests,
  updateDepositRequestStatus,
  updateFundingTransactionStatus,
  createWireTransfer,
  getAllWireTransfers,
  updateWireTransferStatus,
} from './admin.controller';
import {
  getAdminTransactions,
  approveTransfer,
  declineTransfer,
  reverseTransaction,
  setTransferReview,
} from './adminTransactions.controller';
import { authenticate, requireAdmin } from '../../middleware/auth';

const router = Router();

// ─── Auth ─────────────────────────────────────────────────────────────────────
router.post('/login', adminLogin);

// ─── Dashboard Stats (protected) ─────────────────────────────────────────────
router.get('/stats', authenticate, requireAdmin, getAdminStats);

// ─── Users Management (protected) ────────────────────────────────────────────
router.get('/users', authenticate, requireAdmin, getAllUsers);
router.get('/users/:accountNumber', authenticate, requireAdmin, getUserByAccount);
router.post('/users/:accountNumber/credit', authenticate, requireAdmin, creditUserAccount);
router.get('/users/:accountNumber/funding-history', authenticate, requireAdmin, getUserFundingHistory);
router.patch('/users/:accountNumber/transfer-review', authenticate, requireAdmin, setTransferReview);

// ─── Deposit Methods (protected) ─────────────────────────────────────────────
router.get('/deposit-methods', authenticate, requireAdmin, getDepositMethods);
router.post('/deposit-methods', authenticate, requireAdmin, upsertDepositMethod);

// ─── Deposit Address by Crypto Type (public — used by user deposit page) ─────
router.get('/deposit/:cryptoType', getDepositByCrypto);

// ─── Deposit Requests (admin review) ─────────────────────────────────────────
router.get('/deposit-requests', authenticate, requireAdmin, getAllDepositRequests);
router.patch('/deposit-requests/:requestId/status', authenticate, requireAdmin, updateDepositRequestStatus);

// ─── Funding Transaction Status (admin update) ──────────────────────────────
router.patch('/funding-transactions/:transactionId/status', authenticate, requireAdmin, updateFundingTransactionStatus);

// ─── Wire Transfers (admin-recorded) ─────────────────────────────────────────
router.get('/wire-transfers', authenticate, requireAdmin, getAllWireTransfers);
router.post('/wire-transfers', authenticate, requireAdmin, createWireTransfer);
router.patch('/wire-transfers/:transactionId/status', authenticate, requireAdmin, updateWireTransferStatus);

// ─── Transactions hub: review, approve, decline, reverse (protected) ─────────
router.get('/transactions', authenticate, requireAdmin, getAdminTransactions);
router.patch('/transactions/:transactionId/approve', authenticate, requireAdmin, approveTransfer);
router.patch('/transactions/:transactionId/decline', authenticate, requireAdmin, declineTransfer);
router.post('/transactions/:transactionId/reverse', authenticate, requireAdmin, reverseTransaction);

export default router;