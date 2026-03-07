import { prisma } from '../../config/database';
import { DepositRequestInput, DepositRequestResponse } from '../../types/deposit.types';

/**
 * Submit a new deposit request
 */
export const submitDepositRequestService = async (
  userId: string,
  data: DepositRequestInput
): Promise<DepositRequestResponse> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, fullName: true, accountNumber: true },
  });

  if (!user) {
    throw Object.assign(new Error('User not found.'), { statusCode: 404 });
  }

  const requestId = `DEP-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

  const depositRequest = await prisma.depositRequest.create({
    data: {
      requestId,
      userId: user.id,
      amount: data.amount,
      cryptoType: data.cryptoType,
      network: data.network,
      walletAddress: data.walletAddress,
      receiptPath: data.receiptPath || null,
      status: 'PENDING',
    },
  });

  return {
    requestId: depositRequest.requestId,
    amount: depositRequest.amount,
    cryptoType: depositRequest.cryptoType,
    network: depositRequest.network,
    status: depositRequest.status,
    createdAt: depositRequest.createdAt,
  };
};

/**
 * Get user's deposit request history
 */
export const getUserDepositRequestsService = async (userId: string) => {
  return prisma.depositRequest.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: {
      requestId: true,
      amount: true,
      cryptoType: true,
      network: true,
      walletAddress: true,
      status: true,
      adminNote: true,
      createdAt: true,
    },
  });
};