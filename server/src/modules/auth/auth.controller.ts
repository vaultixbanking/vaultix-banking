import { Request, Response, NextFunction } from 'express';
import { signupService, loginService, verifyPinService } from './auth.service';
import { AuthRequest } from '../../types';

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const photoIDPath = req.file ? `uploads/${req.file.filename}` : null;

    if (!photoIDPath) {
      res.status(400).json({ success: false, message: 'Photo ID is required for verification.' });
      return;
    }

    const result = await signupService(req.body, photoIDPath);

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await loginService(req.body);
    res.status(200).json({ success: true, message: 'Login successful.', data: result });
  } catch (err) {
    next(err);
  }
};

export const verifyPin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { pin } = req.body;

    if (!pin) {
      res.status(400).json({ success: false, message: 'PIN is required.' });
      return;
    }

    const result = await verifyPinService(userId, pin);
    res.status(200).json({ success: true, message: 'PIN verified successfully.', data: result });
  } catch (err) {
    next(err);
  }
};