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
  getAllDepositRequestsService,
  updateDepositRequestStatusService,
  updateFundingTransactionStatusService,
  createWireTransferService,
  getAllWireTransfersService,
  updateWireTransferStatusService,
} from './admin.service';
import { AuthRequest, CreateWireTransferBody } from '../../types';
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

// ─── Wire Transfers ──────────────────────────────────────────────────────────

const SWIFT_REGEX = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/;
const ROUTING_REGEX = /^\d{9}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CURRENCY_REGEX = /^[A-Z]{3}$/;

// Trimmed string, or undefined when missing/blank
const text = (value: unknown): string | undefined =>
  typeof value === 'string' && value.trim() ? value.trim() : undefined;

/**
 * Validate and normalise a create-wire request. Returns an error message or the clean body.
 */
const parseWireTransferBody = (body: Record<string, unknown>): string | CreateWireTransferBody => {
  const amount = Number(body.amount);
  if (!body.amount || isNaN(amount) || amount <= 0) return 'A valid positive amount is required.';

  const status = text(body.status) ?? 'PENDING';
  if (status !== 'PENDING' && status !== 'SUCCESSFUL') return 'Status must be PENDING or SUCCESSFUL.';

  const recipientType = text(body.recipientType);
  if (recipientType !== 'VAULTIX' && recipientType !== 'EXTERNAL') {
    return 'Recipient type must be VAULTIX or EXTERNAL.';
  }

  const parsed: CreateWireTransferBody = {
    amount: Math.round(amount * 100) / 100,
    currency: (text(body.currency) ?? 'USD').toUpperCase(),
    reason: text(body.reason) ?? '',
    status,
    notifyByEmail: body.notifyByEmail !== false,
    adminNote: text(body.adminNote),
    senderName: text(body.senderName) ?? '',
    senderAddress: text(body.senderAddress),
    senderBankName: text(body.senderBankName),
    senderAccountNumber: text(body.senderAccountNumber),
    senderEmail: text(body.senderEmail)?.toLowerCase(),
    recipientType,
    recipientAccountNumber: text(body.recipientAccountNumber) ?? '',
    recipientName: text(body.recipientName),
    recipientBankName: text(body.recipientBankName),
    recipientSwiftCode: text(body.recipientSwiftCode)?.toUpperCase(),
    recipientRoutingNumber: text(body.recipientRoutingNumber),
    recipientAddress: text(body.recipientAddress),
    recipientCity: text(body.recipientCity),
    recipientCountry: text(body.recipientCountry),
    recipientEmail: text(body.recipientEmail)?.toLowerCase(),
  };

  const tooLong = Object.entries(parsed).find(
    ([key, value]) => typeof value === 'string' && value.length > (key === 'reason' || key === 'adminNote' ? 500 : 200)
  );
  if (tooLong) {
    const label = tooLong[0].replace(/([A-Z])/g, ' $1').toLowerCase();
    return `${label.charAt(0).toUpperCase()}${label.slice(1)} is too long.`;
  }

  if (!parsed.reason) return 'A reason for the transfer is required.';
  if (!parsed.senderName) return 'Sender name is required.';
  if (!parsed.recipientAccountNumber) return 'Recipient account number is required.';
  if (parsed.senderEmail && !EMAIL_REGEX.test(parsed.senderEmail)) return 'Sender email is not valid.';

  if (recipientType === 'EXTERNAL') {
    if (!parsed.recipientName) return 'Recipient name is required.';
    if (!parsed.recipientBankName) return 'Recipient bank name is required.';
    if (!parsed.recipientSwiftCode && !parsed.recipientRoutingNumber) {
      return 'Enter a SWIFT/BIC code or a routing number for the recipient bank.';
    }
    if (parsed.recipientSwiftCode && !SWIFT_REGEX.test(parsed.recipientSwiftCode)) {
      return 'SWIFT/BIC must be 8 or 11 characters (e.g. CHASUS33).';
    }
    if (parsed.recipientRoutingNumber && !ROUTING_REGEX.test(parsed.recipientRoutingNumber)) {
      return 'Routing number must be exactly 9 digits.';
    }
    if (parsed.recipientEmail && !EMAIL_REGEX.test(parsed.recipientEmail)) return 'Recipient email is not valid.';
    if (!CURRENCY_REGEX.test(parsed.currency)) return 'Currency must be a 3-letter code (e.g. USD).';
  }

  return parsed;
};

/**
 * Create a wire transfer
 * POST /api/admin/wire-transfers
 */
export const createWireTransfer = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parsed = parseWireTransferBody(req.body ?? {});
    if (typeof parsed === 'string') {
      res.status(400).json({ success: false, message: parsed });
      return;
    }

    const data = await createWireTransferService(parsed, req.user?.userId);
    res.status(201).json({ success: true, message: 'Wire transfer created.', data });
  } catch (err) {
    next(err);
  }
};

/**
 * List wire transfers
 * GET /api/admin/wire-transfers?status=&search=
 */
export const getAllWireTransfers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const status = typeof req.query.status === 'string'
      && (isValidFundingStatus(req.query.status) || req.query.status === 'REVERSED')
      ? req.query.status
      : undefined;
    const search = typeof req.query.search === 'string' ? text(req.query.search) : undefined;

    const data = await getAllWireTransfersService(status, search);
    res.status(200).json({ success: true, message: 'Wire transfers fetched.', data });
  } catch (err) {
    next(err);
  }
};

/**
 * Update wire transfer status (PENDING → SUCCESSFUL / FAILED)
 * PATCH /api/admin/wire-transfers/:transactionId/status
 */
export const updateWireTransferStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status, adminNote } = req.body;

    if (status !== 'SUCCESSFUL' && status !== 'FAILED') {
      res.status(400).json({ success: false, message: 'Status must be SUCCESSFUL or FAILED.' });
      return;
    }

    const data = await updateWireTransferStatusService(
      req.params.transactionId,
      status as FundingStatus,
      text(adminNote)
    );

    res.status(200).json({ success: true, message: `Wire transfer updated to ${status}.`, data });
  } catch (err) {
    next(err);
  }
};
