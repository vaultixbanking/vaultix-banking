import { Prisma } from '@prisma/client';
import { prisma } from '../../config/database';
import { generateTransactionId } from '../../utils/helpers';
import {
  sendDebitNotification,
  sendTransferDeclinedEmail,
  sendTransferReversedEmail,
  sendCreditReversedEmail,
} from '../../utils/email';
import {
  TRANSFER_STATUS,
  REVERSED_STATUS,
  REVERSAL_SOURCE,
  REVERSAL_DIRECTION,
  ReversalDirection,
} from '../../constants/transferStatus';
import { FUNDING_STATUS } from '../../constants/fundingStatus';
import { buildWireNotice, sendWireNoticeToParties } from './admin.service';

// ─── Admin Transactions hub ─────────────────────────────────────────────────
// One list over the three money tables: customer transfers (Withdrawal), Account
// Funding credits (FundingTransaction) and admin-recorded wires (WireTransfer).

export type HubSource = 'TRANSFER' | 'FUNDING' | 'WIRE';
export type HubTab = 'PENDING' | 'SUCCESSFUL' | 'UNSUCCESSFUL' | 'REVERSED';

const TAB_STATUSES: Record<HubTab, string[]> = {
  PENDING: ['PENDING'],
  SUCCESSFUL: ['SUCCESSFUL'],
  UNSUCCESSFUL: ['DECLINED', 'FAILED'],
  REVERSED: ['REVERSED'],
};

export const isHubTab = (value: string): value is HubTab => value in TAB_STATUSES;
export const isHubSource = (value: string): value is HubSource =>
  value === 'TRANSFER' || value === 'FUNDING' || value === 'WIRE';

const LIST_LIMIT = 200;

const httpError = (statusCode: number, message: string) => Object.assign(new Error(message), { statusCode });

const formatAmount = (amount: number, currency: string) => {
  const value = amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return currency === 'USD' ? `$${value}` : `${currency} ${value}`;
};

const str = (value: unknown) => (typeof value === 'string' && value.trim() ? value.trim() : '');

const customerSelect = {
  id: true,
  fullName: true,
  accountNumber: true,
  emailAddress: true,
  totalBalance: true,
  currencyType: true,
  transferReviewRequired: true,
} as const;

type CustomerRecord = Prisma.UserGetPayload<{ select: typeof customerSelect }>;

const toCustomer = (u: CustomerRecord | null) =>
  u
    ? {
        name: u.fullName,
        accountNumber: u.accountNumber,
        email: u.emailAddress,
        balance: u.totalBalance,
        currency: u.currencyType,
        reviewRequired: u.transferReviewRequired,
      }
    : null;

interface Party {
  name: string;
  lines: string[];
}

type ReversalRecord = Prisma.TransactionReversalGetPayload<object>;

const toReversal = (r: ReversalRecord | undefined) =>
  r
    ? {
        reversalId: r.reversalId,
        direction: r.direction,
        amount: r.amount,
        createdAt: r.createdAt,
        customerMessage: r.customerMessage,
        adminNote: r.adminNote,
        notifyCustomer: r.notifyCustomer,
        balanceBefore: r.balanceBefore,
        balanceAfter: r.balanceAfter,
      }
    : null;

export interface HubRow {
  source: HubSource;
  transactionId: string;
  kind: string;
  flow: 'IN' | 'OUT';          // effect of the original transaction on the customer's balance
  amount: number;
  currency: string;
  status: string;
  createdAt: Date;
  processedAt: Date | null;
  customer: ReturnType<typeof toCustomer>;
  from: Party;
  to: Party;
  description: string | null;
  adminNote: string | null;
  customerMessage: string | null;
  reversal: ReturnType<typeof toReversal>;
}

const withdrawalKind = (type: string, d: Record<string, unknown>) => {
  if (type === 'CRYPTO') return 'Crypto withdrawal';
  if (d.transferType === 'WIRE') return 'International wire';
  if (d.transferType === 'DOMESTIC') return 'Domestic transfer';
  return 'Bank withdrawal';
};

const withdrawalBeneficiary = (type: string, d: Record<string, unknown>): Party => {
  if (type === 'CRYPTO') {
    const asset = str(d.cryptoType);
    return {
      name: asset ? `${asset.charAt(0).toUpperCase()}${asset.slice(1)} wallet` : 'Crypto wallet',
      lines: [str(d.walletAddress), str(d.network) && `Network: ${str(d.network)}`].filter(Boolean),
    };
  }
  const place = [str(d.beneficiaryAddress), str(d.beneficiaryCity), str(d.beneficiaryCountry)].filter(Boolean).join(', ');
  return {
    name: str(d.beneficiaryName) || str(d.recipientName) || 'Beneficiary',
    lines: [
      str(d.bankName),
      str(d.accountNumber) && `Account ${str(d.accountNumber)}`,
      str(d.routingNumber) && `Routing ${str(d.routingNumber)}`,
      str(d.swiftCode) && `SWIFT ${str(d.swiftCode)}`,
      place,
    ].filter(Boolean),
  };
};

const vaultixParty = (u: CustomerRecord | null, fallback: string): Party => ({
  name: u?.fullName || fallback,
  lines: u ? ['Vaultix Bank', `Account ${u.accountNumber}`] : [],
});

/**
 * List transactions for the admin hub, newest first, with per-tab counts.
 */
export const getAdminTransactionsService = async (filters: { tab?: HubTab; source?: HubSource; search?: string }) => {
  const { tab, source, search } = filters;
  const want = (s: HubSource) => !source || source === s;

  const statusWhere = tab ? { status: { in: TAB_STATUSES[tab] } } : {};
  const contains = search ? { contains: search, mode: 'insensitive' as const } : undefined;
  const userMatch: Prisma.UserWhereInput | undefined = contains
    ? { OR: [{ fullName: contains }, { accountNumber: contains }, { emailAddress: contains }] }
    : undefined;

  const [withdrawals, fundings, wires] = await Promise.all([
    want('TRANSFER')
      ? prisma.withdrawal.findMany({
          where: { ...statusWhere, ...(contains && { OR: [{ transactionId: contains }, { user: userMatch }] }) },
          include: { user: { select: customerSelect } },
          orderBy: { createdAt: 'desc' },
          take: LIST_LIMIT,
        })
      : [],
    want('FUNDING')
      ? prisma.fundingTransaction.findMany({
          where: { ...statusWhere, ...(contains && { OR: [{ transactionId: contains }, { user: userMatch }] }) },
          include: { user: { select: customerSelect } },
          orderBy: { createdAt: 'desc' },
          take: LIST_LIMIT,
        })
      : [],
    want('WIRE')
      ? prisma.wireTransfer.findMany({
          where: {
            ...statusWhere,
            ...(contains && {
              OR: [
                { transactionId: contains },
                { senderName: contains },
                { recipientName: contains },
                { recipientAccountNumber: contains },
                { senderEmail: contains },
                { recipientEmail: contains },
              ],
            }),
          },
          include: { recipientUser: { select: customerSelect } },
          orderBy: { createdAt: 'desc' },
          take: LIST_LIMIT,
        })
      : [],
  ]);

  const reversedIds = [
    ...withdrawals.filter((w) => w.status === REVERSED_STATUS).map((w) => w.transactionId),
    ...fundings.filter((f) => f.status === REVERSED_STATUS).map((f) => f.transactionId),
    ...wires.filter((w) => w.status === REVERSED_STATUS).map((w) => w.transactionId),
  ];
  const reversals = reversedIds.length
    ? await prisma.transactionReversal.findMany({ where: { sourceTransactionId: { in: reversedIds } } })
    : [];
  const reversalFor = new Map(reversals.map((r) => [r.sourceTransactionId, r]));

  const rows: HubRow[] = [
    ...withdrawals.map((w): HubRow => {
      const d = (w.details as Record<string, unknown> | null) ?? {};
      return {
        source: 'TRANSFER',
        transactionId: w.transactionId,
        kind: withdrawalKind(w.withdrawalType, d),
        flow: 'OUT',
        amount: w.amount,
        currency: w.user.currencyType,
        status: w.status,
        createdAt: w.createdAt,
        processedAt: w.processedAt,
        customer: toCustomer(w.user),
        from: vaultixParty(w.user, 'Customer'),
        to: withdrawalBeneficiary(w.withdrawalType, d),
        description: str(d.narration) || null,
        adminNote: w.adminNote,
        customerMessage: w.customerMessage,
        reversal: toReversal(reversalFor.get(w.transactionId)),
      };
    }),
    ...fundings.map((f): HubRow => ({
      source: 'FUNDING',
      transactionId: f.transactionId,
      kind: 'Account funding',
      flow: 'IN',
      amount: f.amount,
      currency: f.currency,
      status: f.status,
      createdAt: f.createdAt,
      processedAt: f.status === FUNDING_STATUS.PENDING ? null : f.updatedAt,
      customer: toCustomer(f.user),
      from: { name: 'Account funding', lines: ['Vaultix Bank'] },
      to: vaultixParty(f.user, 'Customer'),
      description: f.description,
      adminNote: f.adminNote,
      customerMessage: null,
      reversal: toReversal(reversalFor.get(f.transactionId)),
    })),
    ...wires.map((w): HubRow => ({
      source: 'WIRE',
      transactionId: w.transactionId,
      kind: w.recipientType === 'VAULTIX' ? 'Admin wire (Vaultix)' : 'Admin wire (external)',
      flow: 'IN',
      amount: w.amount,
      currency: w.currency,
      status: w.status,
      createdAt: w.createdAt,
      processedAt: w.status === FUNDING_STATUS.PENDING ? null : w.updatedAt,
      customer: toCustomer(w.recipientUser),
      from: {
        name: w.senderName,
        lines: [w.senderBankName, w.senderAccountNumber && `Account ${w.senderAccountNumber}`, w.senderEmail].filter(
          (x): x is string => !!x
        ),
      },
      to: {
        name: w.recipientName,
        lines: [
          w.recipientBankName,
          `Account ${w.recipientAccountNumber}`,
          w.recipientSwiftCode && `SWIFT ${w.recipientSwiftCode}`,
          w.recipientEmail,
        ].filter((x): x is string => !!x),
      },
      description: w.reason,
      adminNote: w.adminNote,
      customerMessage: null,
      reversal: toReversal(reversalFor.get(w.transactionId)),
    })),
  ]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, LIST_LIMIT);

  // Tab counts follow the source filter but ignore the tab and search
  const groups = await Promise.all([
    want('TRANSFER') ? prisma.withdrawal.groupBy({ by: ['status'], _count: { _all: true } }) : [],
    want('FUNDING') ? prisma.fundingTransaction.groupBy({ by: ['status'], _count: { _all: true } }) : [],
    want('WIRE') ? prisma.wireTransfer.groupBy({ by: ['status'], _count: { _all: true } }) : [],
  ]);
  const counts: Record<HubTab | 'ALL', number> = { ALL: 0, PENDING: 0, SUCCESSFUL: 0, UNSUCCESSFUL: 0, REVERSED: 0 };
  for (const group of groups.flat()) {
    counts.ALL += group._count._all;
    for (const t of Object.keys(TAB_STATUSES) as HubTab[]) {
      if (TAB_STATUSES[t].includes(group.status)) counts[t] += group._count._all;
    }
  }

  return { rows, counts };
};

// ─── Approve / decline a pending customer transfer ──────────────────────────

interface ActionInput {
  adminId?: string;
  adminNote?: string;
  customerMessage?: string;
  notifyCustomer: boolean;
}

const findPendingTransfer = async (transactionId: string) => {
  const withdrawal = await prisma.withdrawal.findUnique({ where: { transactionId }, include: { user: true } });
  if (!withdrawal) throw httpError(404, 'Transaction not found.');
  if (withdrawal.status !== TRANSFER_STATUS.PENDING) {
    throw httpError(409, 'This transaction has already been processed.');
  }
  return withdrawal;
};

export const approveTransferService = async (transactionId: string, input: ActionInput) => {
  const withdrawal = await findPendingTransfer(transactionId);

  // Conditional on PENDING so two admins acting at once can't both process it
  const { count } = await prisma.withdrawal.updateMany({
    where: { transactionId, status: TRANSFER_STATUS.PENDING },
    data: {
      status: TRANSFER_STATUS.SUCCESSFUL,
      processedAt: new Date(),
      processedByAdminId: input.adminId,
      ...(input.adminNote && { adminNote: input.adminNote }),
    },
  });
  if (count === 0) throw httpError(409, 'This transaction has already been processed.');

  const { user } = withdrawal;
  if (input.notifyCustomer) {
    sendDebitNotification(
      user.emailAddress,
      user.fullName,
      withdrawal.amount,
      user.currencyType,
      user.totalBalance,
      withdrawal.withdrawalType,
      transactionId,
      withdrawal.details as Record<string, unknown> | undefined,
      'COMPLETED'
    ).catch((err) => console.error('[ADMIN] Failed to send transfer completed email:', err));
  }

  return prisma.withdrawal.findUniqueOrThrow({ where: { transactionId } });
};

export const declineTransferService = async (transactionId: string, input: ActionInput) => {
  const withdrawal = await findPendingTransfer(transactionId);

  const newBalance = await prisma.$transaction(async (tx) => {
    const { count } = await tx.withdrawal.updateMany({
      where: { transactionId, status: TRANSFER_STATUS.PENDING },
      data: {
        status: TRANSFER_STATUS.DECLINED,
        processedAt: new Date(),
        processedByAdminId: input.adminId,
        customerMessage: input.customerMessage ?? null,
        ...(input.adminNote && { adminNote: input.adminNote }),
      },
    });
    if (count === 0) throw httpError(409, 'This transaction has already been processed.');

    // The amount was deducted at submit, so a decline returns it in full
    const user = await tx.user.update({
      where: { id: withdrawal.userId },
      data: { totalBalance: { increment: withdrawal.amount } },
      select: { totalBalance: true },
    });
    return user.totalBalance;
  });

  const { user } = withdrawal;
  if (input.notifyCustomer) {
    sendTransferDeclinedEmail(user.emailAddress, {
      username: user.fullName,
      amount: withdrawal.amount,
      currency: user.currencyType,
      newBalance,
      transactionId,
      transactionType: withdrawal.withdrawalType,
      details: withdrawal.details as Record<string, unknown> | undefined,
      customerMessage: input.customerMessage,
    }).catch((err) => console.error('[ADMIN] Failed to send transfer declined email:', err));
  }

  return prisma.withdrawal.findUniqueOrThrow({ where: { transactionId } });
};

// ─── Full-amount reversal ───────────────────────────────────────────────────

type Tx = Prisma.TransactionClient;

/** Take the full amount back from a customer, refusing if their balance is too low */
const debitInFull = async (tx: Tx, userId: string, amount: number, currency: string) => {
  const { count } = await tx.user.updateMany({
    where: { id: userId, totalBalance: { gte: amount } },
    data: { totalBalance: { decrement: amount } },
  });
  if (count === 0) {
    const user = await tx.user.findUniqueOrThrow({ where: { id: userId }, select: { fullName: true, totalBalance: true } });
    throw httpError(
      400,
      `${user.fullName}'s balance is ${formatAmount(user.totalBalance, currency)}, which is less than the ${formatAmount(amount, currency)} being reversed. Nothing was changed.`
    );
  }
  const { totalBalance } = await tx.user.findUniqueOrThrow({ where: { id: userId }, select: { totalBalance: true } });
  return totalBalance;
};

const notCompleted = (status: string) =>
  status === TRANSFER_STATUS.PENDING
    ? httpError(400, 'This transaction is still pending. Decline it instead of reversing it.')
    : status === REVERSED_STATUS
      ? httpError(409, 'This transaction has already been reversed.')
      : httpError(400, 'Only completed transactions can be reversed.');

const alreadyProcessed = () => httpError(409, 'This transaction has already been reversed or changed. Refresh and try again.');

/**
 * Reverse a completed transaction in full. Customer transfers are returned to the
 * customer; funding credits and wires into a Vaultix account are taken back.
 */
export const reverseTransactionService = async (transactionId: string, input: ActionInput) => {
  const [withdrawal, funding, wire, existing] = await Promise.all([
    prisma.withdrawal.findUnique({ where: { transactionId }, include: { user: true } }),
    prisma.fundingTransaction.findUnique({ where: { transactionId }, include: { user: true } }),
    prisma.wireTransfer.findUnique({ where: { transactionId }, include: { recipientUser: true } }),
    prisma.transactionReversal.findUnique({ where: { sourceTransactionId: transactionId } }),
  ]);

  if (existing) throw httpError(409, 'This transaction has already been reversed.');

  const reversalId = generateTransactionId('REV');
  const record = (
    tx: Tx,
    data: {
      sourceType: string;
      userId: string | null;
      direction: ReversalDirection;
      amount: number;
      currency: string;
      balanceBefore: number | null;
      balanceAfter: number | null;
    }
  ) =>
    tx.transactionReversal.create({
      data: {
        reversalId,
        sourceTransactionId: transactionId,
        ...data,
        customerMessage: input.customerMessage ?? null,
        adminNote: input.adminNote ?? null,
        notifyCustomer: input.notifyCustomer,
        createdByAdminId: input.adminId,
      },
    });

  // ── Customer transfer / withdrawal: money goes back to the customer ──
  if (withdrawal) {
    if (withdrawal.status !== TRANSFER_STATUS.SUCCESSFUL) throw notCompleted(withdrawal.status);
    const { user, amount } = withdrawal;

    const reversal = await prisma.$transaction(async (tx) => {
      const { count } = await tx.withdrawal.updateMany({
        where: { transactionId, status: TRANSFER_STATUS.SUCCESSFUL },
        data: { status: REVERSED_STATUS },
      });
      if (count === 0) throw alreadyProcessed();

      const updated = await tx.user.update({
        where: { id: user.id },
        data: { totalBalance: { increment: amount } },
        select: { totalBalance: true },
      });
      return record(tx, {
        sourceType: REVERSAL_SOURCE.WITHDRAWAL,
        userId: user.id,
        direction: REVERSAL_DIRECTION.CREDIT,
        amount,
        currency: user.currencyType,
        balanceBefore: updated.totalBalance - amount,
        balanceAfter: updated.totalBalance,
      });
    });

    if (input.notifyCustomer) {
      sendTransferReversedEmail(user.emailAddress, {
        username: user.fullName,
        amount,
        currency: user.currencyType,
        newBalance: reversal.balanceAfter ?? user.totalBalance + amount,
        transactionId,
        transactionType: withdrawal.withdrawalType,
        details: withdrawal.details as Record<string, unknown> | undefined,
        customerMessage: input.customerMessage,
        reversalId,
      }).catch((err) => console.error('[ADMIN] Failed to send transfer reversed email:', err));
    }
    return reversal;
  }

  // ── Account funding credit: money is taken back from the customer ──
  if (funding) {
    if (funding.status !== FUNDING_STATUS.SUCCESSFUL) throw notCompleted(funding.status);
    const { user, amount, currency } = funding;

    const reversal = await prisma.$transaction(async (tx) => {
      const { count } = await tx.fundingTransaction.updateMany({
        where: { transactionId, status: FUNDING_STATUS.SUCCESSFUL },
        data: { status: REVERSED_STATUS },
      });
      if (count === 0) throw alreadyProcessed();

      const balanceAfter = await debitInFull(tx, user.id, amount, currency);
      return record(tx, {
        sourceType: REVERSAL_SOURCE.FUNDING,
        userId: user.id,
        direction: REVERSAL_DIRECTION.DEBIT,
        amount,
        currency,
        balanceBefore: balanceAfter + amount,
        balanceAfter,
      });
    });

    if (input.notifyCustomer) {
      sendCreditReversedEmail(user.emailAddress, {
        username: user.fullName,
        amount,
        currency,
        newBalance: reversal.balanceAfter ?? 0,
        transactionId,
        reversalId,
        description: funding.description || 'Account Funding',
        customerMessage: input.customerMessage,
      }).catch((err) => console.error('[ADMIN] Failed to send credit reversed email:', err));
    }
    return reversal;
  }

  // ── Admin wire: taken back from a Vaultix recipient; nothing to move for external ──
  if (wire) {
    if (wire.status !== FUNDING_STATUS.SUCCESSFUL) throw notCompleted(wire.status);
    const recipientId = wire.recipientUserId;

    const reversal = await prisma.$transaction(async (tx) => {
      const { count } = await tx.wireTransfer.updateMany({
        where: { transactionId, status: FUNDING_STATUS.SUCCESSFUL },
        data: { status: REVERSED_STATUS },
      });
      if (count === 0) throw alreadyProcessed();

      if (!recipientId) {
        return record(tx, {
          sourceType: REVERSAL_SOURCE.WIRE,
          userId: null,
          direction: REVERSAL_DIRECTION.NONE,
          amount: wire.amount,
          currency: wire.currency,
          balanceBefore: null,
          balanceAfter: null,
        });
      }

      const balanceAfter = await debitInFull(tx, recipientId, wire.amount, wire.currency);
      return record(tx, {
        sourceType: REVERSAL_SOURCE.WIRE,
        userId: recipientId,
        direction: REVERSAL_DIRECTION.DEBIT,
        amount: wire.amount,
        currency: wire.currency,
        balanceBefore: balanceAfter + wire.amount,
        balanceAfter,
      });
    });

    if (input.notifyCustomer) {
      const updated = await prisma.wireTransfer.findUniqueOrThrow({ where: { transactionId } });
      sendWireNoticeToParties(updated, {
        ...buildWireNotice(updated, reversal.balanceAfter),
        reversalId,
        message: input.customerMessage,
      });
    }
    return reversal;
  }

  throw httpError(404, 'Transaction not found.');
};

// ─── Per-customer transfer review ───────────────────────────────────────────

export const setTransferReviewService = async (accountNumber: string, required: boolean) => {
  const user = await prisma.user.findUnique({ where: { accountNumber }, select: { id: true } });
  if (!user) throw httpError(404, 'User not found.');

  return prisma.user.update({
    where: { accountNumber },
    data: { transferReviewRequired: required },
    select: { accountNumber: true, fullName: true, transferReviewRequired: true },
  });
};
