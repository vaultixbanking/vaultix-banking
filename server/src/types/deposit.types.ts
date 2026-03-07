/**
 * Deposit Request Types
 */

export interface DepositRequestInput {
  amount: number;
  cryptoType: string;
  network: string;
  walletAddress: string;
  receiptPath?: string;
}

export interface DepositRequestResponse {
  requestId: string;
  amount: number;
  cryptoType: string;
  network: string;
  status: string;
  createdAt: Date;
}

export interface DepositMethodInput {
  method: string;
  details: string;
  network?: string;
}

export interface DepositMethodResponse {
  address: string;
  network: string;
}
