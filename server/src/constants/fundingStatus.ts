/**
 * Funding Transaction Status Constants
 */
export const FUNDING_STATUS = {
  PENDING: 'PENDING',
  SUCCESSFUL: 'SUCCESSFUL',
  FAILED: 'FAILED',
} as const;

export type FundingStatus = (typeof FUNDING_STATUS)[keyof typeof FUNDING_STATUS];

/**
 * Check if a status value is a valid funding status
 */
export const isValidFundingStatus = (status: string): status is FundingStatus => {
  return Object.values(FUNDING_STATUS).includes(status as FundingStatus);
};

/**
 * Valid transitions: only allow moving from PENDING to SUCCESSFUL or FAILED
 */
export const isValidStatusTransition = (from: string, to: string): boolean => {
  if (from === FUNDING_STATUS.PENDING) {
    return to === FUNDING_STATUS.SUCCESSFUL || to === FUNDING_STATUS.FAILED;
  }
  return false;
};
