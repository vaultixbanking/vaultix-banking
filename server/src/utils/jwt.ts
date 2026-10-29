import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types';

const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set.');
}

export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
};

// ─── Password reset tokens ────────────────────────────────────────────────────
// Signed with JWT_SECRET + the user's current password hash, so a token stops
// working as soon as the password changes (single-use) — no DB column needed.

const PASSWORD_RESET_PURPOSE = 'password-reset';

export const generatePasswordResetToken = (userId: string, passwordHash: string): string => {
  return jwt.sign({ userId, purpose: PASSWORD_RESET_PURPOSE }, JWT_SECRET + passwordHash, { expiresIn: '1h' });
};

/** Reads the userId from a reset token WITHOUT verifying it — always call verifyPasswordResetToken next. */
export const readPasswordResetUserId = (token: string): string | null => {
  const decoded = jwt.decode(token);
  if (!decoded || typeof decoded !== 'object' || decoded.purpose !== PASSWORD_RESET_PURPOSE) return null;
  return typeof decoded.userId === 'string' ? decoded.userId : null;
};

export const verifyPasswordResetToken = (token: string, passwordHash: string): boolean => {
  try {
    const payload = jwt.verify(token, JWT_SECRET + passwordHash);
    return typeof payload === 'object' && payload.purpose === PASSWORD_RESET_PURPOSE;
  } catch {
    return false;
  }
};