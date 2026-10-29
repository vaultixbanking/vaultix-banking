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
 * Email verification link. Points at the website (always up), not the API: the API host
 * sleeps when idle, and opening it directly showed customers the host's "waking up" page.
 * The website's /verify-email page wakes the API in the background and confirms the token.
 */
export const buildVerificationLink = (token: string): string => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  return `${clientUrl}/verify-email?token=${token}`;
};

/**
 * Generates a unique transaction ID with a prefix
 */
export const generateTransactionId = (prefix: string = 'TXN'): string => {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
};

/**
 * Shows only the last 4 digits of an account number, e.g. ••••4521
 */
export const maskAccount = (accountNumber: string): string =>
  accountNumber.length > 4 ? `••••${accountNumber.slice(-4)}` : accountNumber;
