import bcrypt from 'bcryptjs';
import { prisma } from '../../config/database';
import { generateToken } from '../../utils/jwt';
import { generateAccountNumber } from '../../utils/helpers';
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
      phone: body.phone || null,
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
    },
  });

  return {
    accountNumber: user.accountNumber,
    username: user.username,
    fullName: user.fullName,
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