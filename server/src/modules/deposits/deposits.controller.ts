import { Response, NextFunction } from 'express';
import {
  submitDepositRequestService,
  getUserDepositRequestsService,
} from './deposits.service';
import { AuthRequest } from '../../types';
import { validateDepositRequest } from '../../validators/depositValidators';

/**
 * Submit a new deposit request
 * POST /api/deposits
 */
export const submitDeposit = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { amount, cryptoType, network, walletAddress } = req.body;

    // Validate request data
    const validation = validateDepositRequest({ amount, cryptoType, walletAddress });
    if (!validation.isValid) {
      res.status(400).json({ success: false, message: validation.error });
      return;
    }

    // Receipt path from multer — store relative path so the frontend can build the URL
    const receiptPath = req.file ? `uploads/${req.file.filename}` : undefined;

    const data = await submitDepositRequestService(req.user!.userId, {
      amount: parseFloat(amount),
      cryptoType,
      network: network || '',
      walletAddress,
      receiptPath,
    });

    res.status(201).json({
      success: true,
      message: 'Deposit request submitted. Our team will review and credit your account shortly.',
      data,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get logged-in user's deposit request history
 * GET /api/deposits/history
 */
export const getMyDeposits = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await getUserDepositRequestsService(req.user!.userId);
    res.status(200).json({ success: true, message: 'Deposit history fetched.', data });
  } catch (err) {
    next(err);
  }
};