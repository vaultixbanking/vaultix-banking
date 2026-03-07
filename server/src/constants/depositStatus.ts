/**
 * Deposit Request Status Constants
 */
export const DEPOSIT_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;

export type DepositStatus = (typeof DEPOSIT_STATUS)[keyof typeof DEPOSIT_STATUS];

/**
 * Check if a status value is valid
 */
export const isValidDepositStatus = (status: string): status is DepositStatus => {
  return Object.values(DEPOSIT_STATUS).includes(status as DepositStatus);
};
