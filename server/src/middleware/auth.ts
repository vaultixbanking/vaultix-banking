import { Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { prisma } from '../config/database';
import { AuthRequest } from '../types';

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) {
    res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    return;
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    res.status(403).json({ success: false, message: 'Invalid or expired token.' });
  }
};

/**
 * Must run after `authenticate`. Customer and admin tokens share the same secret and
 * payload shape, so a valid token alone is not enough — the id must belong to an Admin.
 */
export const requireAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const admin = req.user
      ? await prisma.admin.findUnique({ where: { id: req.user.userId }, select: { id: true } })
      : null;

    if (!admin) {
      res.status(403).json({ success: false, message: 'Admin access required.' });
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
};
