import { Request, Response, NextFunction } from 'express';
import {
  adminLoginService,
  getAllDepositMethodsService,
  upsertDepositMethodService,
  getDepositMethodByCryptoService,
  getAllUsersService,
  getUserByAccountService,
  creditUserAccountService,
  getUserFundingHistoryService,
  getAdminStatsService,
  getAllTransactionsService,
  getAllDepositRequestsService,
  updateDepositRequestStatusService,
  updateFundingTransactionStatusService,
} from './admin.service';
import { isValidDepositStatus, DepositStatus } from '../../constants/depositStatus';
import { isValidFundingStatus, FundingStatus } from '../../constants/fundingStatus';

/**
 * Admin login
 * POST /api/admin/login
 */
export const adminLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { username, password } = req.body;
    const data = await adminLoginService(username, password);
    res.status(200).json({ success: true, message: 'Admin login successful.', data });
  } catch (err) {
    next(err);
  }
};

export const getDepositMethods = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await getAllDepositMethodsService();
    res.status(200).json({ success: true, message: 'Deposit methods fetched.', data });
  } catch (err) {
    next(err);
  }
};

// Updated: now passes network from request body
export const upsertDepositMethod = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { method, details, network } = req.body;
    const data = await upsertDepositMethodService(method, details, network);
    res.status(200).json({ success: true, message: `${method} deposit method saved.`, data });
  } catch (err) {
    next(err);
  }
};

export const getDepositByCrypto = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await getDepositMethodByCryptoService(req.params.cryptoType);
    res.status(200).json({ success: true, message: 'Deposit address fetched.', data });
  } catch (err) {
    next(err);
  }
};

export const getAllUsers = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await getAllUsersService();
    res.status(200).json({ success: true, message: 'Users fetched.', data });
  } catch (err) {
    next(err);
  }
};

export const getUserByAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await getUserByAccountService(req.params.accountNumber);
    res.status(200).json({ success: true, message: 'User fetched.', data });
  } catch (err) {
    next(err);
  }
};

export const creditUserAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { amount, description, adminNote, status } = req.body;
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      res.status(400).json({ success: false, message: 'A valid positive amount is required.' });
      return;
    }
    if (status && !isValidFundingStatus(status)) {
      res.status(400).json({ success: false, message: 'Status must be PENDING, SUCCESSFUL, or FAILED.' });
      return;
    }
    const data = await creditUserAccountService(
      req.params.accountNumber,
      parseFloat(amount),
      description,
      adminNote,
      (status as FundingStatus) || undefined
    );
    res.status(200).json({ success: true, message: 'Funding transaction created.', data });
  } catch (err) {
    next(err);
  }
};

export const getUserFundingHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await getUserFundingHistoryService(req.params.accountNumber);
    res.status(200).json({ success: true, message: 'Funding history fetched.', data });
  } catch (err) {
    next(err);
  }
};

export const getAdminStats = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await getAdminStatsService();
    res.status(200).json({ success: true, message: 'Admin stats fetched.', data });
  } catch (err) {
    next(err);
  }
};

export const getAllTransactions = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await getAllTransactionsService();
    res.status(200).json({ success: true, message: 'Transactions fetched.', data });
  } catch (err) {
    next(err);
  }
};

// ─── Deposit Requests (admin view) ───────────────────────────────────────────

export const getAllDepositRequests = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await getAllDepositRequestsService();
    res.status(200).json({ success: true, message: 'Deposit requests fetched.', data });
  } catch (err) {
    next(err);
  }
};

/**
 * Update deposit request status (approve/reject)
 * PATCH /api/admin/deposit-requests/:requestId/status
 */
export const updateDepositRequestStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status, adminNote } = req.body;
    
    if (!isValidDepositStatus(status) || status === 'PENDING') {
      res.status(400).json({ 
        success: false, 
        message: 'Status must be either APPROVED or REJECTED.' 
      });
      return;
    }
    
    const data = await updateDepositRequestStatusService(
      req.params.requestId,
      status as DepositStatus,
      adminNote
    );
    
    res.status(200).json({ 
      success: true, 
      message: `Deposit request ${status.toLowerCase()}.`, 
      data 
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update funding transaction status (PENDING → SUCCESSFUL / FAILED)
 * PATCH /api/admin/funding-transactions/:transactionId/status
 */
export const updateFundingTransactionStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status, adminNote } = req.body;

    if (!status || !isValidFundingStatus(status)) {
      res.status(400).json({
        success: false,
        message: 'Status must be PENDING, SUCCESSFUL, or FAILED.',
      });
      return;
    }

    const data = await updateFundingTransactionStatusService(
      req.params.transactionId,
      status as FundingStatus,
      adminNote
    );

    res.status(200).json({
      success: true,
      message: `Funding transaction updated to ${status}.`,
      data,
    });
  } catch (err) {
    next(err);
  }
};