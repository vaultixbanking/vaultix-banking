/**
 * Customer transfer (Withdrawal) status constants.
 *
 * PENDING    — submitted; funds already deducted; waiting to be completed or declined
 * SUCCESSFUL — completed
 * DECLINED   — not completed; funds returned to the customer
 * REVERSED   — was completed, then reversed in full (see TransactionReversal)
 */
export const TRANSFER_STATUS = {
  PENDING: 'PENDING',
  SUCCESSFUL: 'SUCCESSFUL',
  DECLINED: 'DECLINED',
  REVERSED: 'REVERSED',
} as const;

export type TransferStatus = (typeof TRANSFER_STATUS)[keyof typeof TRANSFER_STATUS];

/** Status every reversible transaction (withdrawal, funding credit, wire) ends in */
export const REVERSED_STATUS = 'REVERSED';

/** Which table a reversed transaction came from */
export const REVERSAL_SOURCE = {
  WITHDRAWAL: 'WITHDRAWAL',
  FUNDING: 'FUNDING',
  WIRE: 'WIRE',
} as const;

export type ReversalSource = (typeof REVERSAL_SOURCE)[keyof typeof REVERSAL_SOURCE];

/** Effect of a reversal on the customer's balance */
export const REVERSAL_DIRECTION = {
  CREDIT: 'CREDIT', // money returned to the customer
  DEBIT: 'DEBIT',   // money taken back from the customer
  NONE: 'NONE',     // no Vaultix balance involved (wire to an external account)
} as const;

export type ReversalDirection = (typeof REVERSAL_DIRECTION)[keyof typeof REVERSAL_DIRECTION];
