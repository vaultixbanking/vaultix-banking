import { Response, NextFunction } from 'express';
import {
  getUserDashboardService,
  getUserInfoService,
  getUserByAccountNumberService,
  updateUserBalanceService,
} from './user.service';
import { AuthRequest } from '../../types';
import { Request } from 'express';

export const getDashboard = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await getUserDashboardService(req.user!.userId);
    res.status(200).json({ success: true, message: 'Dashboard data fetched.', data });
  } catch (err) {
    next(err);
  }
};

export const getUserInfo = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await getUserInfoService(req.user!.userId);
    res.status(200).json({ success: true, message: 'User info fetched.', data });
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
    const data = await getUserByAccountNumberService(req.params.accountNumber);
    res.status(200).json({ success: true, message: 'User fetched.', data });
  } catch (err) {
    next(err);
  }
};

export const updateUserBalance = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await updateUserBalanceService(req.params.accountNumber, req.body);
    res.status(200).json({ success: true, message: 'Balance updated successfully.', data });
  } catch (err) {
    next(err);
  }
};