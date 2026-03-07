import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '../../config/database';
import { generateToken } from '../../utils/jwt';
import { generateAccountNumber } from '../../utils/helpers';
import { sendVerificationEmail, sendWelcomeEmail } from '../../utils/email';
import { SignupBody, LoginBody } from '../../types';

export const signupService = async (
  body: SignupBody,
  photoIDPath: string | null
) => {
  const emailAddress = body.email.toLowerCase();
  const username = body.username.toLowerCase();

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

  // Send verification email (non-blocking — don't fail signup if email fails)
  const apiUrl = process.env.API_URL || `http://localhost:${process.env.PORT || 5000}`;
  const verificationLink = `${apiUrl}/api/auth/verify-email/${verificationToken}`;

  sendVerificationEmail(emailAddress, user.fullName, verificationLink).catch((err) => {
    console.error('[SIGNUP] Failed to send verification email:', err);
  });

  return {
    accountNumber: user.accountNumber,
    username: user.username,
    fullName: user.fullName,
    message: 'Please check your email to verify your account.',
  };
};

export const loginService = async (body: LoginBody) => {
  const { usernameOrEmail, password } = body;

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { username: usernameOrEmail.toLowerCase() },
        { emailAddress: usernameOrEmail.toLowerCase() },
      ],
    },
  });

  if (!user) {
    throw Object.assign(new Error('Invalid credentials. User not found.'), { statusCode: 401 });
  }

  if (!user.emailVerified) {
    throw Object.assign(new Error('Please verify your email address before logging in. Check your inbox for the verification link.'), { statusCode: 403 });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw Object.assign(new Error('Invalid credentials. Incorrect password.'), { statusCode: 401 });
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

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpiry: null,
    },
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
    where: { emailAddress: email.toLowerCase() },
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

  const apiUrl = process.env.API_URL || `http://localhost:${process.env.PORT || 5000}`;
  const verificationLink = `${apiUrl}/api/auth/verify-email/${verificationToken}`;
  await sendVerificationEmail(user.emailAddress, user.fullName, verificationLink);

  return { message: 'Verification email sent.' };
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