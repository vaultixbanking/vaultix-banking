import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '../../config/database';
import {
  generateToken,
  generatePasswordResetToken,
  readPasswordResetUserId,
  verifyPasswordResetToken,
} from '../../utils/jwt';
import { generateAccountNumber, buildVerificationLink } from '../../utils/helpers';
import { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail } from '../../utils/email';
import { SignupBody, LoginBody } from '../../types';

export const signupService = async (
  body: SignupBody,
  photoIDPath: string | null
) => {
  // Trim: mobile keyboards often append a trailing space, which made logins fail with "User not found"
  const emailAddress = body.email.trim().toLowerCase();
  const username = body.username.trim().toLowerCase();

  const existing = await prisma.user.findFirst({
    where: {
      OR: [
        { emailAddress },
        { username },
      ],
    },
  });

  if (existing) {
    const field = existing.emailAddress === emailAddress ? 'Email' : 'Username';
    throw Object.assign(new Error(`${field} is already taken.`), { statusCode: 409 });
  }

  const [hashedPassword, hashedPin] = await Promise.all([
    bcrypt.hash(body.password, 10),
    bcrypt.hash(body.pin, 10),
  ]);

  // Generate email verification token (URL-safe random string)
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  const user = await prisma.user.create({
    data: {
      fullName: body.fullName,
      dateOfBirth: body.dateOfBirth || null,
      gender: body.gender || null,
      nationality: body.nationality || null,
      country: body.country || null,
      city: body.city || null,
      state: body.state || null,
      zipCode: body.zipCode || null,
      residentialAddress: body.residentialAddress || null,
      phone: body.phone,
      alternatePhone: body.alternatePhone || null,
      employmentStatus: body.employmentStatus || null,
      occupation: body.occupation || null,
      incomeRange: body.incomeRange || null,
      sourceOfFunds: body.sourceOfFunds || null,
      username,
      emailAddress,
      password: hashedPassword,
      pin: hashedPin,
      accountType: body.accountType || 'Savings',
      currencyType: body.currencyType || 'USD',
      idType: body.idType || null,
      idNumber: body.idNumber || null,
      idExpiryDate: body.idExpiryDate || null,
      photoID: photoIDPath,
      accountNumber: generateAccountNumber(),
      emailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpiry: verificationExpiry,
    },
  });

  // Send verification email. A failed send must not fail signup (the account already
  // exists), but the client needs to know so it doesn't promise an email that never arrives.
  const verificationLink = buildVerificationLink(verificationToken);

  let verificationEmailSent = true;
  try {
    await sendVerificationEmail(emailAddress, user.fullName, verificationLink);
  } catch (err) {
    verificationEmailSent = false;
    console.error('[SIGNUP] Failed to send verification email:', err);
  }

  return {
    accountNumber: user.accountNumber,
    username: user.username,
    fullName: user.fullName,
    verificationEmailSent,
    message: verificationEmailSent
      ? 'Please check your email to verify your account.'
      : 'We could not send your verification email right now. Please request a new one from the sign-in page.',
  };
};

export const loginService = async (body: LoginBody) => {
  const { usernameOrEmail, password } = body;

  if (!usernameOrEmail || !password) {
    throw Object.assign(new Error('Please enter your username or email and your password.'), { statusCode: 400 });
  }

  // Match the trimmed value, and also the raw value so accounts created before
  // signup started trimming input can still sign in.
  const raw = usernameOrEmail.toLowerCase();
  const candidates = Array.from(new Set([raw.trim(), raw]));

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { username: { in: candidates } },
        { emailAddress: { in: candidates } },
      ],
    },
  });

  if (!user) {
    throw Object.assign(new Error('No account found with that username or email. Please check for typos or create an account.'), { statusCode: 401 });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw Object.assign(new Error('Incorrect password. Please try again or reset your password.'), { statusCode: 401 });
  }

  // Checked after the password so only the account owner learns the verification status
  if (!user.emailVerified) {
    throw Object.assign(new Error('Please verify your email address before logging in. Check your inbox for the verification link.'), { statusCode: 403 });
  }

  const token = generateToken({
    userId: user.id,
    username: user.username,
    email: user.emailAddress,
  });

  return {
    token,
    user: {
      fullName: user.fullName,
      username: user.username,
      email: user.emailAddress,
      accountNumber: user.accountNumber,
      accountType: user.accountType,
      currencyType: user.currencyType,
      totalBalance: user.totalBalance,
    },
  };
};

export const verifyEmailService = async (token: string) => {
  const user = await prisma.user.findUnique({
    where: { emailVerificationToken: token },
  });

  if (!user) {
    throw Object.assign(new Error('Invalid verification link.'), { statusCode: 400 });
  }

  if (user.emailVerified) {
    return { alreadyVerified: true };
  }

  if (user.emailVerificationExpiry && user.emailVerificationExpiry < new Date()) {
    throw Object.assign(new Error('Verification link has expired. Please request a new one.'), { statusCode: 400 });
  }

  // The token is kept (it can only ever verify this address) so clicking the link
  // a second time shows "already verified" instead of "invalid link"
  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true },
  });

  // Send welcome email (non-blocking)
  console.log(`[VERIFY] Email verified for ${user.emailAddress}. Triggering welcome email...`);
  sendWelcomeEmail(user.emailAddress, user.fullName, user.accountNumber).catch((err) => {
    console.error('[VERIFY] Failed to send welcome email:', err);
  });

  return { alreadyVerified: false };
};

export const resendVerificationService = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { emailAddress: email.trim().toLowerCase() },
  });

  if (!user) {
    throw Object.assign(new Error('No account found with that email.'), { statusCode: 404 });
  }

  if (user.emailVerified) {
    throw Object.assign(new Error('Email is already verified.'), { statusCode: 400 });
  }

  const verificationToken = crypto.randomBytes(32).toString('hex');
  const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerificationToken: verificationToken,
      emailVerificationExpiry: verificationExpiry,
    },
  });

  await sendVerificationEmail(user.emailAddress, user.fullName, buildVerificationLink(verificationToken));

  return { message: 'Verification email sent.' };
};

// ─── Password Reset ───────────────────────────────────────────────────────────

// Per-user cooldown so the endpoint can't be used to flood someone's inbox
const RESET_EMAIL_COOLDOWN_MS = 60 * 1000;
const lastResetEmailAt = new Map<string, number>();

export const forgotPasswordService = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { emailAddress: email.trim().toLowerCase() },
  });

  // Respond identically whether or not the account exists, so this can't be used to probe for emails
  if (!user) return;

  const now = Date.now();
  const lastSent = lastResetEmailAt.get(user.id);
  if (lastSent && now - lastSent < RESET_EMAIL_COOLDOWN_MS) return;
  lastResetEmailAt.set(user.id, now);

  const token = generatePasswordResetToken(user.id, user.password);
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const resetLink = `${clientUrl}/reset-password?token=${encodeURIComponent(token)}`;

  // Not awaited, so response time doesn't reveal whether the account exists
  sendPasswordResetEmail(user.emailAddress, user.fullName, resetLink).catch((err) => {
    lastResetEmailAt.delete(user.id);
    console.error('[FORGOT-PASSWORD] Failed to send reset email:', err);
  });
};

export const resetPasswordService = async (token: string, password: string) => {
  if (password.length < 8) {
    throw Object.assign(new Error('Password must be at least 8 characters.'), { statusCode: 400 });
  }

  const invalidLink = () =>
    Object.assign(new Error('This password reset link is invalid or has expired. Please request a new one.'), { statusCode: 400 });

  const userId = readPasswordResetUserId(token);
  if (!userId) throw invalidLink();

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !verifyPasswordResetToken(token, user.password)) throw invalidLink();

  const hashedPassword = await bcrypt.hash(password, 10);

  // Matching on the old hash makes the token single-use even if two requests race.
  // Following the emailed link proves the user owns the address, so this also verifies the email.
  const { count } = await prisma.user.updateMany({
    where: { id: user.id, password: user.password },
    data: {
      password: hashedPassword,
      emailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpiry: null,
    },
  });
  if (count === 0) throw invalidLink();

  lastResetEmailAt.delete(user.id);

  return { message: 'Your password has been reset. You can now sign in with your new password.' };
};

export const verifyPinService = async (userId: string, pin: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw Object.assign(new Error('User not found.'), { statusCode: 404 });
  }

  const isPinValid = await bcrypt.compare(pin, user.pin);

  if (!isPinValid) {
    throw Object.assign(new Error('Invalid PIN.'), { statusCode: 400 });
  }

  return { success: true };
};