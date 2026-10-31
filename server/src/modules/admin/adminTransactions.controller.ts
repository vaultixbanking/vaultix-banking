import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types';
import {
  getAdminTransactionsService,
  approveTransferService,
  declineTransferService,
  reverseTransactionService,
  setTransferReviewService,
  isHubTab,
  isHubSource,
} from './adminTransactions.service';

const MESSAGE_LIMIT = 500;

const text = (value: unknown): string | undefined =>
  typeof value === 'string' && value.trim() ? value.trim() : undefined;

/**
 * Read the shared action body. The customer message goes into the email and the
 * customer's history; the admin note never leaves the admin panel.
 */
const parseAction = (req: AuthRequest) => {
  const body = (req.body ?? {}) as Record<string, unknown>;
  const customerMessage = text(body.customerMessage);
  const adminNote = text(body.adminNote);

  if ((customerMessage?.length ?? 0) > MESSAGE_LIMIT || (adminNote?.length ?? 0) > MESSAGE_LIMIT) {
    return `Messages and notes must be ${MESSAGE_LIMIT} characters or fewer.`;
  }

  return {
    adminId: req.user?.userId,
    customerMessage,
    adminNote,
    // Emails go out unless the admin explicitly unticked "Email the customer"
    notifyCustomer: body.notifyCustomer !== false,
  };
};

/**
 * List transactions across customer transfers, funding credits and admin wires
 * GET /api/admin/transactions?tab=&source=&search=
 */
export const getAdminTransactions = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tab = typeof req.query.tab === 'string' && isHubTab(req.query.tab) ? req.query.tab : undefined;
    const source = typeof req.query.source === 'string' && isHubSource(req.query.source) ? req.query.source : undefined;
    const search = text(req.query.search);

    const data = await getAdminTransactionsService({ tab, source, search });
    res.status(200).json({ success: true, message: 'Transactions fetched.', data });
  } catch (err) {
    next(err);
  }
};

/**
 * Complete a pending customer transfer
 * PATCH /api/admin/transactions/:transactionId/approve
 */
export const approveTransfer = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const input = parseAction(req);
    if (typeof input === 'string') {
      res.status(400).json({ success: false, message: input });
      return;
    }
    const data = await approveTransferService(req.params.transactionId, input);
    res.status(200).json({ success: true, message: 'Transfer completed.', data });
  } catch (err) {
    next(err);
  }
};

/**
 * Decline a pending customer transfer and return the funds
 * PATCH /api/admin/transactions/:transactionId/decline
 */
export const declineTransfer = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const input = parseAction(req);
    if (typeof input === 'string') {
      res.status(400).json({ success: false, message: input });
      return;
    }
    const data = await declineTransferService(req.params.transactionId, input);
    res.status(200).json({ success: true, message: 'Transfer declined and funds returned.', data });
  } catch (err) {
    next(err);
  }
};

/**
 * Reverse a completed transaction in full
 * POST /api/admin/transactions/:transactionId/reverse
 */
export const reverseTransaction = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const input = parseAction(req);
    if (typeof input === 'string') {
      res.status(400).json({ success: false, message: input });
      return;
    }
    const data = await reverseTransactionService(req.params.transactionId, input);
    res.status(200).json({ success: true, message: 'Transaction reversed.', data });
  } catch (err) {
    next(err);
  }
};

/**
 * Switch transfer review on or off for one customer
 * PATCH /api/admin/users/:accountNumber/transfer-review
 */
export const setTransferReview = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { required } = (req.body ?? {}) as { required?: unknown };
    if (typeof required !== 'boolean') {
      res.status(400).json({ success: false, message: '"required" must be true or false.' });
      return;
    }
    const data = await setTransferReviewService(req.params.accountNumber, required);
    res.status(200).json({
      success: true,
      message: required ? 'Transfer review switched on.' : 'Transfer review switched off.',
      data,
    });
  } catch (err) {
    next(err);
  }
};
