import { Request } from 'express';

// ─── JWT ──────────────────────────────────────────────────────────────────────
export interface JwtPayload {
  userId: string;
  username: string;
  email: string;
}

// ─── Express helpers ──────────────────────────────────────────────────────────
export interface AuthRequest extends Request {
  user?: JwtPayload;
}

// ─── Auth DTOs ────────────────────────────────────────────────────────────────
export interface SignupBody {
  // Step 1 — Personal
  fullName: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  country?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  residentialAddress?: string;
  email: string;          // mapped to emailAddress in DB
  phone?: string;
  alternatePhone?: string;

  // Step 2 — Employment & Financial
  employmentStatus?: string;
  occupation?: string;
  incomeRange?: string;
  sourceOfFunds?: string;

  // Step 3 — Security & Verification
  username: string;
  password: string;
  pin: string;
  accountType?: string;
  currencyType?: string;
  idType?: string;
  idNumber?: string;
  idExpiryDate?: string;
}

export interface LoginBody {
  usernameOrEmail: string;
  password: string;
}

// ─── Transaction DTOs ─────────────────────────────────────────────────────────
export interface WithdrawBody {
  pin: string;
  amount: number;
  withdrawalType: string;
  details?: Record<string, unknown>;
}
