import { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle, CheckCircle2, XCircle, Undo2, Mail, Lock, MessageSquare } from 'lucide-react';
import { adminApi } from '../../lib/adminApi';
import { fmtMoney, reversalEffect, type HubRow } from './transactionHub';

export type ActionKind = 'approve' | 'decline' | 'reverse' | 'complete' | 'fail';

interface Props {
  kind: ActionKind;
  row: HubRow;
  onClose: () => void;
  onDone: (message: string) => void;
}

const MESSAGE_LIMIT = 500;

const inputClass =
  'w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm';

const COPY: Record<ActionKind, { title: string; confirm: string; tone: string; icon: typeof Undo2 }> = {
  approve: { title: 'Complete transfer', confirm: 'Complete transfer', tone: 'bg-green-600 hover:bg-green-700', icon: CheckCircle2 },
  decline: { title: 'Decline transfer', confirm: 'Decline and refund', tone: 'bg-red-600 hover:bg-red-700', icon: XCircle },
  reverse: { title: 'Reverse transaction', confirm: 'Reverse full amount', tone: 'bg-slate-900 hover:bg-slate-800', icon: Undo2 },
  complete: { title: 'Mark as successful', confirm: 'Mark successful', tone: 'bg-green-600 hover:bg-green-700', icon: CheckCircle2 },
  fail: { title: 'Mark as failed', confirm: 'Mark failed', tone: 'bg-red-600 hover:bg-red-700', icon: XCircle },
};

/**
 * One dialog for every action in the Transactions hub. The amount is always the
 * full amount of the transaction: there is deliberately no amount field.
 */
const TransactionActionModal = ({ kind, row, onClose, onDone }: Props) => {
  const [customerMessage, setCustomerMessage] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [notifyCustomer, setNotifyCustomer] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !submitting && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, submitting]);

  const copy = COPY[kind];
  const Icon = copy.icon;
  const money = (n: number) => fmtMoney(n, row.currency);
  const amount = money(row.amount);
  const customer = row.customer;
  const name = customer?.name ?? row.to.name;
  const balance = customer?.balance ?? 0;
  const effect = reversalEffect(row);

  // Emails and messages only exist for the hub's own endpoints
  const hubAction = kind === 'approve' || kind === 'decline' || kind === 'reverse';
  const takesMessage = kind === 'decline' || kind === 'reverse';
  const emailLabel = row.source === 'WIRE' ? 'Email the sender and recipient' : 'Email the customer';

  const tooLow = kind === 'reverse' && effect === 'DEBIT' && balance < row.amount;

  const effectText = (() => {
    switch (kind) {
      case 'approve':
        return `The transfer is marked Completed. The ${amount} already left ${name}'s balance when it was submitted, so the balance does not change.`;
      case 'decline':
        return `${amount} goes back to ${name}'s balance (${money(balance)} → ${money(balance + row.amount)}). The customer sees this transfer as Declined.`;
      case 'reverse':
        if (effect === 'CREDIT') {
          return `${amount} goes back to ${name}'s balance (${money(balance)} → ${money(balance + row.amount)}). The original shows as Reversed, and a matching reversal entry appears in their history.`;
        }
        if (effect === 'DEBIT') {
          return balance < row.amount
            ? `Reversing takes the full ${amount} back from ${name}'s balance.`
            : `${amount} is taken back from ${name}'s balance (${money(balance)} → ${money(balance - row.amount)}). The original shows as Reversed, and a matching reversal entry appears in their history.`;
        }
        return 'No Vaultix balance changes. The wire is marked Reversed.';
      case 'complete':
        return customer
          ? `${amount} is credited to ${name}'s balance (${money(balance)} → ${money(balance + row.amount)}).`
          : 'The wire is marked Successful. No Vaultix balance changes.';
      case 'fail':
        return 'The transaction is marked Failed. No balance changes.';
    }
  })();

  const submit = async () => {
    setSubmitting(true);
    setError('');
    const id = encodeURIComponent(row.transactionId);
    const note = adminNote.trim() || undefined;
    try {
      if (hubAction) {
        const body = {
          adminNote: note,
          notifyCustomer,
          ...(takesMessage ? { customerMessage: customerMessage.trim() || undefined } : {}),
        };
        if (kind === 'reverse') {
          await adminApi(`/api/admin/transactions/${id}/reverse`, { method: 'POST', body });
        } else {
          await adminApi(`/api/admin/transactions/${id}/${kind}`, { method: 'PATCH', body });
        }
      } else {
        // Pending funding credits and wires keep their existing status endpoints
        const base = row.source === 'FUNDING' ? 'funding-transactions' : 'wire-transfers';
        await adminApi(`/api/admin/${base}/${id}/status`, {
          method: 'PATCH',
          body: { status: kind === 'complete' ? 'SUCCESSFUL' : 'FAILED', adminNote: note },
        });
      }

      const done: Record<ActionKind, string> = {
        approve: `${row.transactionId} completed.`,
        decline: `${row.transactionId} declined. ${amount} returned to ${name}.`,
        reverse: `${row.transactionId} reversed in full (${amount}).`,
        complete: `${row.transactionId} marked successful.`,
        fail: `${row.transactionId} marked failed.`,
      };
      onDone(`${done[kind]}${hubAction && !notifyCustomer ? ' No email was sent.' : ''}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-slate-900/50" onClick={() => !submitting && onClose()} />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="txn-action-title"
        className="relative w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[92vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
              <Icon className="w-5 h-5 text-slate-700" />
            </div>
            <h3 id="txn-action-title" className="font-semibold text-slate-900">{copy.title}</h3>
          </div>
          <button onClick={onClose} disabled={submitting} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Fixed full amount */}
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs text-slate-500">{row.kind}</p>
                <p className="font-mono text-xs text-slate-700 mt-0.5 break-all">{row.transactionId}</p>
                <p className="text-sm font-medium text-slate-900 mt-2 truncate">{name}</p>
                {customer && <p className="text-xs text-slate-400 font-mono">{customer.accountNumber}</p>}
              </div>
              <div className="text-right shrink-0">
                <p className="text-[11px] uppercase tracking-wide text-slate-400">{kind === 'reverse' ? 'Full amount' : 'Amount'}</p>
                <p className="text-2xl font-bold text-slate-900 tabular-nums">{amount}</p>
              </div>
            </div>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed">{effectText}</p>

          {tooLow && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm text-red-700">
                {name}'s balance is {money(balance)}, which is less than the {amount} being reversed. The reversal can't go through until the balance covers the full amount.
              </p>
            </div>
          )}

          {takesMessage && (
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1.5">
                <MessageSquare className="w-4 h-4 text-slate-400" />
                Message to customer <span className="text-xs font-normal text-slate-400">(optional)</span>
              </label>
              <textarea
                value={customerMessage}
                onChange={e => setCustomerMessage(e.target.value.slice(0, MESSAGE_LIMIT))}
                rows={3}
                placeholder={kind === 'decline' ? 'e.g. The beneficiary account details could not be verified.' : 'e.g. Reversed at your request.'}
                className={`${inputClass} resize-none`}
              />
              <p className="text-xs text-slate-400 mt-1">
                Shown to the customer as a “Message from Vaultix” in their history{notifyCustomer ? ' and in the email' : ''}.
              </p>
            </div>
          )}

          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1.5">
              <Lock className="w-4 h-4 text-slate-400" />
              Internal note <span className="text-xs font-normal text-slate-400">(optional)</span>
            </label>
            <input
              type="text"
              value={adminNote}
              onChange={e => setAdminNote(e.target.value.slice(0, MESSAGE_LIMIT))}
              placeholder="Only visible to admins"
              className={inputClass}
            />
          </div>

          {hubAction ? (
            <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
              <input
                type="checkbox"
                checked={notifyCustomer}
                onChange={e => setNotifyCustomer(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              />
              <span>
                <span className="flex items-center gap-1.5 text-sm font-medium text-slate-800">
                  <Mail className="w-4 h-4 text-slate-400" /> {emailLabel}
                </span>
                <span className="block text-xs text-slate-500 mt-0.5">
                  {notifyCustomer
                    ? 'The email comes from Vaultix and never mentions staff or a review.'
                    : 'No email is sent. The change still appears in the customer’s transaction history.'}
                </span>
              </span>
            </label>
          ) : (
            <p className="text-xs text-slate-400">Emails follow the existing rules for this {row.source === 'FUNDING' ? 'funding transaction' : 'wire'}.</p>
          )}

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
          <button
            onClick={onClose}
            disabled={submitting}
            className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={submitting || tooLow}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${copy.tone}`}
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {copy.confirm}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionActionModal;
