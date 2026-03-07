import { Response, NextFunction } from 'express';
import { withdrawService, getWithdrawalHistoryService } from './transactions.service';
import { AuthRequest } from '../../types';

export const withdraw = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await withdrawService(req.user!.userId, req.body);
    res.status(200).json({ success: true, message: 'Withdrawal successful.', data });
  } catch (err) {
    next(err);
  }
};

export const getWithdrawalHistory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await getWithdrawalHistoryService(req.user!.userId);
    res.status(200).json({ success: true, message: 'Withdrawal history fetched.', data });
  } catch (err) {
    next(err);
  }
};