import { Request, Response, NextFunction } from 'express';
import {
  adminLoginService,
  getAllDepositMethodsService,
  upsertDepositMethodService,
  getDepositMethodByCryptoService,
  getAllUsersService,
  getUserByAccountService,
  updateUserBLCService,
  getAdminStatsService,
  getAllTransactionsService,
} from './admin.service';

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

export const upsertDepositMethod = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { method, details } = req.body;
    const data = await upsertDepositMethodService(method, details);
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

export const updateUserBLC = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await updateUserBLCService(req.params.accountNumber, req.body);
    res.status(200).json({ success: true, message: 'BLC updated successfully.', data });
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