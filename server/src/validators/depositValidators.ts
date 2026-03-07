/**
 * Deposit Request Validation Utilities
 */

export interface DepositValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate deposit amount
 */
export const validateDepositAmount = (amount: unknown): DepositValidationResult => {
  if (!amount || isNaN(Number(amount))) {
    return { isValid: false, error: 'A valid deposit amount is required.' };
  }
  
  const numAmount = Number(amount);
  if (numAmount <= 0) {
    return { isValid: false, error: 'Deposit amount must be greater than zero.' };
  }
  
  return { isValid: true };
};

/**
 * Validate crypto type
 */
export const validateCryptoType = (cryptoType: unknown): DepositValidationResult => {
  if (!cryptoType || typeof cryptoType !== 'string' || !cryptoType.trim()) {
    return { isValid: false, error: 'Crypto type is required.' };
  }
  
  return { isValid: true };
};

/**
 * Validate wallet address
 */
export const validateWalletAddress = (walletAddress: unknown): DepositValidationResult => {
  if (!walletAddress || typeof walletAddress !== 'string' || !walletAddress.trim()) {
    return { isValid: false, error: 'Wallet address is required.' };
  }
  
  return { isValid: true };
};

/**
 * Validate complete deposit request data
 */
export const validateDepositRequest = (data: {
  amount?: unknown;
  cryptoType?: unknown;
  walletAddress?: unknown;
}): DepositValidationResult => {
  const amountCheck = validateDepositAmount(data.amount);
  if (!amountCheck.isValid) return amountCheck;
  
  const cryptoCheck = validateCryptoType(data.cryptoType);
  if (!cryptoCheck.isValid) return cryptoCheck;
  
  const addressCheck = validateWalletAddress(data.walletAddress);
  if (!addressCheck.isValid) return addressCheck;
  
  return { isValid: true };
};
