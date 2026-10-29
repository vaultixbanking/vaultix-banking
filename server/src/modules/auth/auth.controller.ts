import { Request, Response, NextFunction } from 'express';
import {
  signupService,
  loginService,
  verifyPinService,
  verifyEmailService,
  resendVerificationService,
  forgotPasswordService,
  resetPasswordService,
} from './auth.service';
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
      message: 'Account created successfully. Please check your email to verify your account.',
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

export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token } = req.params;
    const result = await verifyEmailService(token);

    // Redirect to frontend login with success indicator
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const redirectUrl = result.alreadyVerified
      ? `${clientUrl}/login?verified=already`
      : `${clientUrl}/login?verified=true`;

    res.redirect(redirectUrl);
  } catch (err) {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const message = err instanceof Error ? err.message : 'Verification failed';
    res.redirect(`${clientUrl}/login?verified=error&message=${encodeURIComponent(message)}`);
  }
};

// Called by the website's /verify-email page (JSON). The GET redirect above stays for older links.
export const confirmEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token } = req.body;
    if (!token || typeof token !== 'string') {
      res.status(400).json({ success: false, message: 'Invalid verification link.' });
      return;
    }
    const result = await verifyEmailService(token);
    res.status(200).json({ success: true, message: 'Email verified.', data: result });
  } catch (err) {
    next(err);
  }
};

export const resendVerification = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ success: false, message: 'Email is required.' });
      return;
    }
    const result = await resendVerificationService(email);
    res.status(200).json({ success: true, message: result.message });
  } catch (err) {
    next(err);
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      res.status(400).json({ success: false, message: 'Email is required.' });
      return;
    }
    await forgotPasswordService(email);
    res.status(200).json({
      success: true,
      message: 'If an account exists for that email, we have sent a password reset link. It expires in 1 hour.',
    });
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token, password } = req.body;
    if (!token || typeof token !== 'string' || !password || typeof password !== 'string') {
      res.status(400).json({ success: false, message: 'Reset token and new password are required.' });
      return;
    }
    const result = await resetPasswordService(token, password);
    res.status(200).json({ success: true, message: result.message });
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