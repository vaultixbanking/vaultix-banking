/**
 * Generates a unique Vaultix bank account number — USA-standard 10-digit numeric format
 * Always starts with "888" (Vaultix identifier) followed by 7 random digits
 * Example: 8881234567
 */
export const generateAccountNumber = (): string => {
  // Vaultix accounts always start with 888, followed by 7 random digits
  const rest = Array.from({ length: 7 }, () => Math.floor(Math.random() * 10)).join('');
  return `888${rest}`;
};

/**
 * Generates a unique transaction ID with a prefix
 */
export const generateTransactionId = (prefix: string = 'TXN'): string => {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
};