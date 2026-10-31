// Shared types and formatting for the admin Transactions hub

export type HubSource = 'TRANSFER' | 'FUNDING' | 'WIRE';
export type HubTab = 'PENDING' | 'ALL' | 'SUCCESSFUL' | 'UNSUCCESSFUL' | 'REVERSED';

export interface HubCustomer {
  name: string;
  accountNumber: string;
  email: string;
  balance: number;
  currency: string;
  reviewRequired: boolean;
}

export interface HubParty {
  name: string;
  lines: string[];
}

export interface HubReversal {
  reversalId: string;
  direction: 'CREDIT' | 'DEBIT' | 'NONE';
  amount: number;
  createdAt: string;
  customerMessage: string | null;
  adminNote: string | null;
  notifyCustomer: boolean;
  balanceBefore: number | null;
  balanceAfter: number | null;
}

export interface HubRow {
  source: HubSource;
  transactionId: string;
  kind: string;
  flow: 'IN' | 'OUT';
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  processedAt: string | null;
  customer: HubCustomer | null;
  from: HubParty;
  to: HubParty;
  description: string | null;
  adminNote: string | null;
  customerMessage: string | null;
  reversal: HubReversal | null;
}

export type HubCounts = Record<'ALL' | 'PENDING' | 'SUCCESSFUL' | 'UNSUCCESSFUL' | 'REVERSED', number>;

export const fmtMoney = (amount: number, currency = 'USD') => {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
};

export const fmtDateTime = (value: string) =>
  new Date(value).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });

// Admin-facing status names ("Pending review" here; customers see "Processing")
export const STATUS_META: Record<string, { label: string; cls: string; dot: string }> = {
  PENDING: { label: 'Pending review', cls: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-400' },
  SUCCESSFUL: { label: 'Completed', cls: 'bg-green-50 text-green-700 border-green-200', dot: 'bg-green-500' },
  DECLINED: { label: 'Declined', cls: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500' },
  FAILED: { label: 'Failed', cls: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500' },
  REVERSED: { label: 'Reversed', cls: 'bg-slate-100 text-slate-700 border-slate-200', dot: 'bg-slate-500' },
};

export const statusMeta = (status: string) =>
  STATUS_META[status] ?? { label: status, cls: 'bg-slate-50 text-slate-600 border-slate-200', dot: 'bg-slate-400' };

export const SOURCE_LABEL: Record<HubSource, string> = {
  TRANSFER: 'Customer transfer',
  FUNDING: 'Account funding',
  WIRE: 'Admin wire',
};

/** What reversing this row does to a Vaultix balance */
export const reversalEffect = (row: HubRow): 'CREDIT' | 'DEBIT' | 'NONE' =>
  row.source === 'TRANSFER' ? 'CREDIT' : row.customer ? 'DEBIT' : 'NONE';

export const canReverse = (row: HubRow) => row.status === 'SUCCESSFUL';
export const isPending = (row: HubRow) => row.status === 'PENDING';
