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

export const creditUserAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { amount, description, adminNote } = req.body;
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      res.status(400).json({ success: false, message: 'A valid positive amount is required.' });
      return;
    }
    const data = await creditUserAccountService(
      req.params.accountNumber,
      parseFloat(amount),
      description,
      adminNote
    );
    res.status(200).json({ success: true, message: 'Account credited successfully.', data });
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