import { Resend } from 'resend';
import { maskAccount } from './helpers';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = 'Vaultix Bank <no-reply@vaultixbank.org>';
const REPLY_TO = 'support@vaultixbank.org';

// Common headers to improve deliverability
const emailHeaders = {
  'X-Entity-Ref-ID': `vaultix-${Date.now()}`,
  'List-Unsubscribe': '<mailto:unsubscribe@vaultixbank.org>',
};

// ─── Brand & Layout ─────────────────────────────────────────────────────────
// Every style is inline: some Gmail clients drop <style> blocks, so classes can't be relied on.

const SITE_URL = 'https://vaultixbank.org';
// Images load from the www host directly: the apex domain redirects to it
const ASSET_URL = 'https://www.vaultixbank.org/brand';

const COLOR = {
  blue: '#2563eb',
  blueDark: '#1e40af',
  tint: '#eff6ff',
  border: '#bfdbfe',
  soft: '#dbeafe',
  ink: '#0f172a',
  muted: '#64748b',
  faint: '#94a3b8',
  line: '#e2e8f0',
  page: '#f1f5f9',
};

const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif";
const MONO = "'SF Mono',Monaco,'Cascadia Code',Consolas,monospace";

// Names, descriptions and bank details are typed in by customers or admins, so they
// must be escaped before going into HTML
const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const formatMoney = (amount: number) =>
  amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const heading = (title: string, intro: string) => `
  <h1 style="margin:0 0 8px;color:${COLOR.ink};font-family:${FONT};font-size:22px;font-weight:700;line-height:1.3;text-align:center;">${title}</h1>
  <p style="margin:0 0 24px;color:${COLOR.muted};font-family:${FONT};font-size:15px;line-height:1.6;text-align:center;">${intro}</p>`;

const amountPanel = (label: string, value: string, mono = false) => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;background:${COLOR.tint};border:1px solid ${COLOR.border};border-radius:10px;border-collapse:separate;">
    <tr>
      <td style="padding:20px;text-align:center;">
        <p style="margin:0 0 6px;color:${COLOR.blueDark};font-family:${FONT};font-size:11px;font-weight:600;letter-spacing:0.8px;text-transform:uppercase;">${label}</p>
        <p style="margin:0;color:${COLOR.blue};font-family:${mono ? MONO : FONT};font-size:${mono ? 26 : 28}px;font-weight:700;line-height:1.2;">${value}</p>
      </td>
    </tr>
  </table>`;

type DetailRow = [label: string, value: string, style?: { mono?: boolean; accent?: boolean; size?: number }];

const detailTable = (rows: DetailRow[]) => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0;border-collapse:collapse;">
    ${rows
      .map(([label, value, style], i) => {
        const divider = i < rows.length - 1 ? `border-bottom:1px solid ${COLOR.page};` : '';
        const size = style?.size ?? (style?.mono ? 12 : 14);
        return `
    <tr>
      <td style="padding:12px 0;${divider}color:${COLOR.muted};font-family:${FONT};font-size:14px;font-weight:500;vertical-align:top;">${label}</td>
      <td style="padding:12px 0 12px 16px;${divider}color:${style?.accent ? COLOR.blue : COLOR.ink};font-family:${style?.mono ? MONO : FONT};font-size:${size}px;font-weight:600;text-align:right;vertical-align:top;word-break:break-word;">${value}</td>
    </tr>`;
      })
      .join('')}
  </table>`;

const note = (html: string) => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0;background:${COLOR.tint};border:1px solid ${COLOR.border};border-radius:8px;border-collapse:separate;">
    <tr>
      <td style="padding:14px 18px;color:${COLOR.blueDark};font-family:${FONT};font-size:13px;line-height:1.5;">${html}</td>
    </tr>
  </table>`;

const button = (href: string, label: string) => `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:24px auto;">
    <tr>
      <td style="border-radius:8px;background:${COLOR.blue};">
        <a href="${href}" style="display:inline-block;padding:12px 28px;color:#ffffff;font-family:${FONT};font-size:14px;font-weight:600;line-height:1.2;text-decoration:none;border-radius:8px;">${label}</a>
      </td>
    </tr>
  </table>`;

const progressSteps = (steps: [label: string, reached: boolean][]) => {
  const cells = steps
    .map(
      ([label, reached]) => `
      <td style="width:${Math.floor(100 / steps.length)}%;padding:0 3px;vertical-align:top;">
        <div style="height:4px;border-radius:2px;background:${reached ? COLOR.blue : COLOR.soft};font-size:0;line-height:0;">&nbsp;</div>
        <p style="margin:6px 0 0;color:${reached ? COLOR.blue : COLOR.faint};font-family:${FONT};font-size:11px;font-weight:600;text-align:center;">${label}</p>
      </td>`
    )
    .join('');
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0 4px;border-collapse:collapse;"><tr>${cells}</tr></table>`;
};

const numberedSteps = (items: [title: string, description: string][]) => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
    ${items
      .map(
        ([title, description], i) => `
    <tr>
      <td style="width:24px;padding:0 0 14px;vertical-align:top;">
        <div style="width:24px;height:24px;border-radius:12px;background:${COLOR.blue};color:#ffffff;font-family:${FONT};font-size:12px;font-weight:700;line-height:24px;text-align:center;">${i + 1}</div>
      </td>
      <td style="padding:0 0 14px 12px;vertical-align:top;">
        <p style="margin:0;color:${COLOR.ink};font-family:${FONT};font-size:14px;font-weight:600;line-height:1.4;">${title}</p>
        <p style="margin:2px 0 0;color:${COLOR.muted};font-family:${FONT};font-size:13px;line-height:1.5;">${description}</p>
      </td>
    </tr>`
      )
      .join('')}
  </table>`;

const featureRow = (items: [title: string, description: string][]) => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 8px;border-collapse:separate;border-spacing:8px 0;">
    <tr>
      ${items
        .map(
          ([title, description]) => `
      <td style="width:${Math.floor(100 / items.length)}%;padding:14px 8px;background:${COLOR.tint};border:1px solid ${COLOR.border};border-radius:8px;text-align:center;vertical-align:top;">
        <p style="margin:0 0 2px;color:${COLOR.ink};font-family:${FONT};font-size:12px;font-weight:600;">${title}</p>
        <p style="margin:0;color:${COLOR.muted};font-family:${FONT};font-size:11px;">${description}</p>
      </td>`
        )
        .join('')}
    </tr>
  </table>`;

const smallPrint = (text: string) =>
  `<p style="margin:0 0 8px;color:${COLOR.muted};font-family:${FONT};font-size:13px;line-height:1.6;text-align:center;">${text}</p>`;

const divider = `<hr style="border:none;border-top:1px solid ${COLOR.line};margin:24px 0;" />`;

const linkFallback = (url: string) => `
  ${divider}
  <p style="margin:0 0 4px;color:${COLOR.muted};font-family:${FONT};font-size:12px;line-height:1.6;text-align:center;">Button not working? Copy this link into your browser:</p>
  <p style="margin:0;font-family:${MONO};font-size:11px;line-height:1.5;text-align:center;word-break:break-all;"><a href="${url}" style="color:${COLOR.blue};">${url}</a></p>`;

const helpLine = (question: string, linkLabel = 'Contact support') => `
  ${divider}
  <p style="margin:0;color:${COLOR.faint};font-family:${FONT};font-size:12px;line-height:1.6;text-align:center;">
    ${question} <a href="${SITE_URL}/support" style="color:${COLOR.blue};font-weight:600;">${linkLabel}</a>
  </p>`;

const footerLink = (path: string, label: string) =>
  `<a href="${SITE_URL}/${path}" style="color:${COLOR.blue};font-weight:600;text-decoration:none;">${label}</a>`;

// Built per email so the year is never stale on a long-running server
const footerHtml = () => `
  <img src="${ASSET_URL}/vaultix-mark.png" width="28" height="28" alt="" style="display:block;width:28px;height:28px;margin:0 auto 10px;border:0;outline:none;" />
  <p style="margin:0 0 4px;color:${COLOR.ink};font-family:${FONT};font-size:13px;font-weight:600;">Vaultix Bank</p>
  <p style="margin:0 0 12px;color:${COLOR.muted};font-family:${FONT};font-size:12px;line-height:1.6;">Vaultix will never ask for your password, PIN or verification code by email.</p>
  <p style="margin:0 0 12px;font-family:${FONT};font-size:12px;line-height:1.6;">
    ${footerLink('support', 'Support')}
    <span style="color:${COLOR.faint};">&nbsp;&middot;&nbsp;</span>
    ${footerLink('privacy', 'Privacy')}
    <span style="color:${COLOR.faint};">&nbsp;&middot;&nbsp;</span>
    ${footerLink('terms', 'Terms')}
  </p>
  <p style="margin:0;color:${COLOR.faint};font-family:${FONT};font-size:11px;">&copy; ${new Date().getFullYear()} Vaultix Bank. All rights reserved.</p>`;

const wrapEmail = (content: string, previewText: string) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>Vaultix Bank</title>
  <style>
    @media (max-width: 480px) { .vx-pad { padding-left: 20px !important; padding-right: 20px !important; } }
  </style>
</head>
<body style="margin:0;padding:0;background:${COLOR.page};-webkit-font-smoothing:antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${previewText}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${COLOR.page};">
    <tr>
      <td align="center" style="padding:32px 12px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#ffffff;border:1px solid ${COLOR.line};border-radius:12px;border-collapse:separate;">
          <tr>
            <td style="background:${COLOR.blue};padding:26px 32px;text-align:center;border-radius:11px 11px 0 0;">
              <a href="${SITE_URL}" style="text-decoration:none;">
                <img src="${ASSET_URL}/vaultix-logo-white.png" width="116" height="36" alt="Vaultix" style="display:inline-block;width:116px;height:36px;border:0;outline:none;color:#ffffff;font-family:${FONT};font-size:22px;font-weight:700;" />
              </a>
            </td>
          </tr>
          <tr>
            <td class="vx-pad" style="padding:32px;">${content}</td>
          </tr>
          <tr>
            <td class="vx-pad" style="padding:24px 32px 28px;border-top:1px solid ${COLOR.line};text-align:center;">${footerHtml()}</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// ─── Email Templates ────────────────────────────────────────────────────────

export const buildVerificationEmail = (username: string, verificationLink: string) => {
  const link = escapeHtml(verificationLink);
  const content = `
    ${heading('Verify Your Email', `Hi ${escapeHtml(username)}, thanks for signing up with Vaultix. Please verify your email address to activate your account.`)}
    ${button(link, 'Verify Email Address')}
    ${smallPrint('This link expires in 24 hours. If you didn’t create a Vaultix account, you can safely ignore this email.')}
    ${linkFallback(link)}
  `;
  return wrapEmail(content, 'Verify your Vaultix account email address');
};

/**
 * Sent once to users whose verification email never arrived because of an email outage.
 * Apologises, gives them a fresh verification link, and reminds them of their username.
 */
export const buildVerificationReminderEmail = (
  fullName: string,
  username: string,
  verificationLink: string,
  loginUrl: string
) => {
  const link = escapeHtml(verificationLink);
  const login = escapeHtml(loginUrl);
  const content = `
    ${heading(
      'Activate Your Vaultix Account',
      `Hi ${escapeHtml(fullName)}, we’re sorry. A temporary problem with our email service meant your verification email never reached you, so you couldn’t sign in. The problem is fixed, and your account and details are safe.`
    )}
    ${button(link, 'Verify Email &amp; Activate Account')}
    ${detailTable([
      ['Your username', escapeHtml(username)],
      ['Sign in at', `<a href="${login}" style="color:${COLOR.blue};text-decoration:none;">${login.replace(/^https?:\/\//, '')}</a>`],
    ])}
    ${smallPrint('You don’t need to sign up again or reset your password. This link expires in 7 days. If you’ve already verified your email, you can ignore this message.')}
    ${linkFallback(link)}
  `;
  return wrapEmail(content, 'Sorry for the delay. Here is your link to activate your Vaultix account.');
};

export const buildPasswordResetEmail = (username: string, resetLink: string) => {
  const link = escapeHtml(resetLink);
  const content = `
    ${heading('Reset Your Password', `Hi ${escapeHtml(username)}, we received a request to reset the password for your Vaultix account. Use the button below to choose a new one.`)}
    ${button(link, 'Reset Password')}
    ${smallPrint('This link expires in 1 hour and can only be used once. If you didn’t request a password reset, you can safely ignore this email. Your password will not change.')}
    ${linkFallback(link)}
  `;
  return wrapEmail(content, 'Reset your Vaultix account password');
};

export const buildWelcomeEmail = (username: string, accountNumber: string) => {
  const name = escapeHtml(username);
  const content = `
    ${heading(`Welcome to Vaultix, ${name}`, 'Your email has been verified and your account is now active.')}
    ${amountPanel('Your Account Number', escapeHtml(accountNumber), true)}
    ${featureRow([
      ['Secure Banking', '256-bit encryption'],
      ['24/7 Access', 'Bank anytime'],
      ['FDIC Insured', 'Up to $250,000'],
    ])}
    ${button(`${SITE_URL}/login`, 'Go to Dashboard')}
    ${divider}
    <p style="margin:0 0 16px;color:${COLOR.ink};font-family:${FONT};font-size:15px;font-weight:600;">Getting started</p>
    ${numberedSteps([
      ['Complete your profile', 'Add your preferences and security settings.'],
      ['Fund your account', 'Make your first deposit and start banking.'],
      ['Send and receive money', 'Make fast, secure transfers at home and abroad.'],
    ])}
    ${helpLine('Need help with your new account?')}
  `;
  return wrapEmail(content, `Welcome to Vaultix, ${name}! Your account is ready.`);
};

export const buildCreditNotificationEmail = (
  username: string,
  amount: number,
  currency: string,
  newBalance: number,
  description: string,
  transactionDate: string
) => {
  const cur = escapeHtml(currency);
  const content = `
    ${heading('Money Received', `Hi ${escapeHtml(username)}, your Vaultix account has been credited.`)}
    ${amountPanel('Amount Credited', `+${cur} ${formatMoney(amount)}`)}
    ${detailTable([
      ['Description', escapeHtml(description)],
      ['Date &amp; Time', escapeHtml(transactionDate)],
      ['New Balance', `${cur} ${formatMoney(newBalance)}`, { accent: true }],
    ])}
    ${note('The funds are available in your account now.')}
    ${button(`${SITE_URL}/login`, 'View Account')}
    ${helpLine('Didn’t expect this?')}
  `;
  return wrapEmail(content, `You received ${cur} ${formatMoney(amount)} in your Vaultix account`);
};

// ─── Withdrawal / Debit Email Templates ─────────────────────────────────────
// Customer-facing wording rule: speak as "we" / Vaultix. Never mention staff, review,
// approval or automation.

type Details = Record<string, unknown> | undefined;

const str = (value: unknown, fallback: string) =>
  typeof value === 'string' && value.trim() ? value.trim() : fallback;

interface DebitKind {
  label: string;          // Title-case noun used in headings, e.g. "Wire Transfer"
  kind: string;           // Lower-case noun used in sentences, e.g. "wire transfer"
  completedTitle: string; // Heading of the completed confirmation
  completedSubject: string;
  processingSubject: string;
  recipient?: string;     // Who the money went to, if known
  rows: DetailRow[];
  settlement: string;
}

/**
 * One description per transfer type, shared by the completed, processing, declined
 * and reversed emails so they always show the same details.
 */
const describeDebit = (transactionType: string, details: Details): DebitKind => {
  const d = details ?? {};

  if (transactionType === 'BANK' && d.transferType === 'WIRE') {
    const recipient = str(d.beneficiaryName, 'N/A');
    return {
      label: 'Wire Transfer',
      kind: 'wire transfer',
      completedTitle: 'Wire Transfer Sent',
      completedSubject: 'Vaultix — Wire Transfer Confirmation',
      processingSubject: 'Vaultix — Transfer Received',
      recipient,
      rows: [
        ['Beneficiary', escapeHtml(recipient)],
        ['Bank', escapeHtml(str(d.bankName, 'N/A'))],
        ['SWIFT / BIC', escapeHtml(str(d.swiftCode, 'N/A')), { mono: true }],
      ],
      settlement: 'International wire transfers typically settle within 3–5 business days.',
    };
  }

  if (transactionType === 'BANK' && d.transferType === 'DOMESTIC') {
    const recipient = str(d.recipientName, str(d.beneficiaryName, 'N/A'));
    return {
      label: 'Transfer',
      kind: 'transfer',
      completedTitle: 'Domestic Transfer Sent',
      completedSubject: 'Vaultix — Transfer Confirmation',
      processingSubject: 'Vaultix — Transfer Received',
      recipient,
      rows: [
        ['Recipient', escapeHtml(recipient)],
        ['Bank', escapeHtml(str(d.bankName, 'N/A'))],
        ['Account', escapeHtml(maskAccount(str(d.accountNumber, 'N/A'))), { mono: true }],
      ],
      settlement: 'Domestic transfers typically settle within 1–2 business days.',
    };
  }

  if (transactionType === 'BANK') {
    return {
      label: 'Withdrawal',
      kind: 'withdrawal',
      completedTitle: 'Bank Withdrawal',
      completedSubject: 'Vaultix — Withdrawal Confirmation',
      processingSubject: 'Vaultix — Withdrawal Received',
      rows: [
        ['Withdrawal To', escapeHtml(str(d.bankName, 'External Bank'))],
        ['Account', escapeHtml(maskAccount(str(d.accountNumber, 'N/A'))), { mono: true }],
      ],
      settlement: 'Bank withdrawals typically process within 1–3 business days.',
    };
  }

  if (transactionType === 'CRYPTO') {
    const walletAddress = str(d.walletAddress, 'N/A');
    const shortAddr = walletAddress.length > 12 ? `${walletAddress.slice(0, 6)}••••${walletAddress.slice(-6)}` : walletAddress;
    const cryptoType = str(d.cryptoType, 'Crypto');
    const network = str(d.network, '');
    return {
      label: 'Withdrawal',
      kind: 'crypto withdrawal',
      completedTitle: 'Crypto Withdrawal',
      completedSubject: 'Vaultix — Withdrawal Confirmation',
      processingSubject: 'Vaultix — Withdrawal Received',
      rows: [
        ['Crypto', escapeHtml(cryptoType.charAt(0).toUpperCase() + cryptoType.slice(1))],
        ['Wallet', escapeHtml(shortAddr), { mono: true, size: 11 }],
        ...(network ? [['Network', escapeHtml(network)] as DetailRow] : []),
      ],
      settlement: 'Crypto withdrawals are sent on-chain once processing is complete.',
    };
  }

  return {
    label: 'Transaction',
    kind: 'transaction',
    completedTitle: 'Money Sent',
    completedSubject: 'Vaultix — Transaction Confirmation',
    processingSubject: 'Vaultix — Transaction Received',
    rows: [['Type', escapeHtml(transactionType)]],
    settlement: 'Most transactions complete within 1–3 business days.',
  };
};

// Optional customer-facing message typed by Vaultix staff (decline / reversal)
const messagePanel = (message?: string | null) => {
  const text = message?.trim();
  if (!text) return '';
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0;background:#ffffff;border:1px solid ${COLOR.border};border-radius:8px;border-collapse:separate;">
    <tr>
      <td style="padding:14px 18px;">
        <p style="margin:0 0 6px;color:${COLOR.blueDark};font-family:${FONT};font-size:11px;font-weight:600;letter-spacing:0.8px;text-transform:uppercase;">Message from Vaultix</p>
        <p style="margin:0;color:${COLOR.ink};font-family:${FONT};font-size:14px;line-height:1.6;white-space:pre-line;">${escapeHtml(text)}</p>
      </td>
    </tr>
  </table>`;
};

const toRecipient = (d: DebitKind) => (d.recipient && d.recipient !== 'N/A' ? ` to <strong>${escapeHtml(d.recipient)}</strong>` : '');

const nowLabel = () => new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

export type DebitStage = 'COMPLETED' | 'PROCESSING';

const buildDebitEmail = (
  stage: DebitStage,
  username: string,
  amount: number,
  currency: string,
  newBalance: number,
  transactionId: string,
  transactionDate: string,
  d: DebitKind
) => {
  const cur = escapeHtml(currency);
  const baseRows: DetailRow[] = [
    ['Transaction ID', escapeHtml(transactionId), { mono: true }],
    ['Date &amp; Time', escapeHtml(transactionDate)],
    ...d.rows,
  ];

  if (stage === 'PROCESSING') {
    const content = `
    ${heading(`${d.label} Processing`, `Hi ${escapeHtml(username)}, we’ve received your ${d.kind}${toRecipient(d)} and it’s now being processed.`)}
    ${amountPanel('Amount', `-${cur} ${formatMoney(amount)}`)}
    ${progressSteps([['Submitted', true], ['Processing', true], ['Completed', false]])}
    ${detailTable([...baseRows, ['Status', 'Processing'], ['Available Balance', `${cur} ${formatMoney(newBalance)}`]])}
    ${note(`${d.settlement} We’ll email you again as soon as it’s completed.`)}
    ${button(`${SITE_URL}/login`, 'View Transaction')}
    ${helpLine('Didn’t make this transaction?')}
  `;
    return wrapEmail(content, `Your ${d.kind} of ${cur} ${formatMoney(amount)} is being processed`);
  }

  const content = `
    ${heading(d.completedTitle, `Hi ${escapeHtml(username)}, a transaction has been processed on your account.`)}
    ${amountPanel('Amount Debited', `-${cur} ${formatMoney(amount)}`)}
    ${detailTable([...baseRows, ['Remaining Balance', `${cur} ${formatMoney(newBalance)}`]])}
    ${note('If you didn’t make this transaction, contact our support team immediately.')}
    ${button(`${SITE_URL}/login`, 'View Transaction')}
    ${helpLine('Questions about this transaction?')}
  `;
  return wrapEmail(content, `${d.label} of ${cur} ${formatMoney(amount)} processed`);
};

/** HTML of the debit email for a transfer, e.g. for previews */
export const buildDebitNotificationHtml = (
  stage: DebitStage,
  username: string,
  amount: number,
  currency: string,
  newBalance: number,
  transactionType: string,
  transactionId: string,
  details?: Record<string, unknown>
) => buildDebitEmail(stage, username, amount, currency, newBalance, transactionId, nowLabel(), describeDebit(transactionType, details));

// ─── Transfer Outcome Templates (declined / reversed) ───────────────────────

export interface TransferOutcomeNotice {
  username: string;
  amount: number;
  currency: string;
  newBalance: number;
  transactionId: string;        // the customer's original transfer
  transactionType: string;      // BANK | CRYPTO
  details?: Record<string, unknown>;
  customerMessage?: string | null;
  reversalId?: string;          // set for reversals
}

export const buildTransferDeclinedEmail = (n: TransferOutcomeNotice) => {
  const d = describeDebit(n.transactionType, n.details);
  const cur = escapeHtml(n.currency);
  const content = `
    ${heading(`${d.label} Declined`, `Hi ${escapeHtml(n.username)}, we couldn’t complete your ${d.kind}${toRecipient(d)}. The full amount has been returned to your Vaultix balance.`)}
    ${amountPanel('Amount Returned', `+${cur} ${formatMoney(n.amount)}`)}
    ${progressSteps([['Submitted', true], ['Processing', true], ['Declined', false]])}
    ${detailTable([
      ['Reference', escapeHtml(n.transactionId), { mono: true }],
      ['Date &amp; Time', escapeHtml(nowLabel())],
      ...d.rows,
      ['Status', 'Declined'],
      ['New Balance', `${cur} ${formatMoney(n.newBalance)}`, { accent: true }],
    ])}
    ${messagePanel(n.customerMessage)}
    ${note('The returned funds are available in your account now.')}
    ${button(`${SITE_URL}/login`, 'View Account')}
    ${helpLine('Questions about this transaction?')}
  `;
  return wrapEmail(content, `Your ${d.kind} of ${cur} ${formatMoney(n.amount)} was declined and the funds were returned`);
};

export const buildTransferReversedEmail = (n: TransferOutcomeNotice) => {
  const d = describeDebit(n.transactionType, n.details);
  const cur = escapeHtml(n.currency);
  const content = `
    ${heading(`${d.label} Reversed`, `Hi ${escapeHtml(n.username)}, your ${d.kind}${toRecipient(d)} has been reversed. The full amount has been returned to your Vaultix balance.`)}
    ${amountPanel('Amount Returned', `+${cur} ${formatMoney(n.amount)}`)}
    ${detailTable([
      ...(n.reversalId ? [['Reversal Reference', escapeHtml(n.reversalId), { mono: true }] as DetailRow] : []),
      ['Original Reference', escapeHtml(n.transactionId), { mono: true }],
      ['Date &amp; Time', escapeHtml(nowLabel())],
      ...d.rows,
      ['New Balance', `${cur} ${formatMoney(n.newBalance)}`, { accent: true }],
    ])}
    ${messagePanel(n.customerMessage)}
    ${note('The returned funds are available in your account now.')}
    ${button(`${SITE_URL}/login`, 'View Account')}
    ${helpLine('Questions about this reversal?')}
  `;
  return wrapEmail(content, `Your ${d.kind} of ${cur} ${formatMoney(n.amount)} was reversed and the funds were returned`);
};

export interface CreditReversalNotice {
  username: string;
  amount: number;
  currency: string;
  newBalance: number;
  transactionId: string;   // the original credit
  reversalId: string;
  description: string;
  customerMessage?: string | null;
}

export const buildCreditReversedEmail = (n: CreditReversalNotice) => {
  const cur = escapeHtml(n.currency);
  const content = `
    ${heading('Credit Reversed', `Hi ${escapeHtml(n.username)}, a credit of ${cur} ${formatMoney(n.amount)} to your Vaultix account has been reversed, and the amount has been deducted from your balance.`)}
    ${amountPanel('Amount Debited', `-${cur} ${formatMoney(n.amount)}`)}
    ${detailTable([
      ['Reversal Reference', escapeHtml(n.reversalId), { mono: true }],
      ['Original Reference', escapeHtml(n.transactionId), { mono: true }],
      ['Description', escapeHtml(n.description)],
      ['Date &amp; Time', escapeHtml(nowLabel())],
      ['Remaining Balance', `${cur} ${formatMoney(n.newBalance)}`],
    ])}
    ${messagePanel(n.customerMessage)}
    ${note('If you have questions about this change, contact our support team and quote the reference above.')}
    ${button(`${SITE_URL}/login`, 'View Account')}
    ${helpLine('Questions about this reversal?')}
  `;
  return wrapEmail(content, `A credit of ${cur} ${formatMoney(n.amount)} on your Vaultix account was reversed`);
};

// ─── Send Functions ─────────────────────────────────────────────────────────

export const sendVerificationEmail = async (to: string, username: string, verificationLink: string) => {
  try {
    const html = buildVerificationEmail(username, verificationLink);
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      replyTo: REPLY_TO,
      to,
      subject: 'Verify Your Vaultix Account',
      html,
      headers: emailHeaders,
    });
    if (error) {
      console.error('[EMAIL] Verification email failed:', JSON.stringify(error));
      throw new Error('Failed to send verification email.');
    }
    console.log(`[EMAIL] Verification email sent to ${to}`);
  } catch (err) {
    console.error('[EMAIL] Verification email error:', err);
    throw err;
  }
};

export const sendVerificationReminderEmail = async (
  to: string,
  fullName: string,
  username: string,
  verificationLink: string,
  loginUrl: string
) => {
  const html = buildVerificationReminderEmail(fullName, username, verificationLink, loginUrl);
  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    replyTo: REPLY_TO,
    to,
    subject: 'Activate Your Vaultix Account — Sorry for the Delay',
    html,
    headers: emailHeaders,
  });
  if (error) {
    throw new Error(`Failed to send verification reminder: ${JSON.stringify(error)}`);
  }
};

export const sendPasswordResetEmail = async (to: string, username: string, resetLink: string) => {
  try {
    const html = buildPasswordResetEmail(username, resetLink);
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      replyTo: REPLY_TO,
      to,
      subject: 'Reset Your Vaultix Password',
      html,
      headers: emailHeaders,
    });
    if (error) {
      console.error('[EMAIL] Password reset email failed:', JSON.stringify(error));
      throw new Error('Failed to send password reset email.');
    }
    console.log(`[EMAIL] Password reset email sent to ${to}`);
  } catch (err) {
    console.error('[EMAIL] Password reset email error:', err);
    throw err;
  }
};

export const sendWelcomeEmail = async (to: string, username: string, accountNumber: string) => {
  try {
    const html = buildWelcomeEmail(username, accountNumber);
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      replyTo: REPLY_TO,
      to,
      subject: 'Welcome to Vaultix — Your Account is Ready',
      html,
      headers: emailHeaders,
    });
    if (error) {
      console.error('[EMAIL] Welcome email failed:', JSON.stringify(error));
      throw new Error('Failed to send welcome email.');
    }
    console.log(`[EMAIL] Welcome email sent to ${to}`);
  } catch (err) {
    console.error('[EMAIL] Welcome email error:', err);
    throw err;
  }
};

export const sendCreditNotification = async (
  to: string,
  username: string,
  amount: number,
  currency: string,
  newBalance: number,
  description: string
) => {
  try {
    const transactionDate = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
    const html = buildCreditNotificationEmail(username, amount, currency, newBalance, description, transactionDate);
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      replyTo: REPLY_TO,
      to,
      subject: `Vaultix — You've Received a Deposit`,
      html,
      headers: emailHeaders,
    });
    if (error) {
      console.error('[EMAIL] Credit notification failed:', JSON.stringify(error));
    } else {
      console.log(`[EMAIL] Credit notification sent to ${to}`);
    }
  } catch (err) {
    console.error('[EMAIL] Credit notification error:', err);
  }
};

const sendEmail = async (to: string, subject: string, html: string, label: string) => {
  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      replyTo: REPLY_TO,
      to,
      subject,
      html,
      headers: emailHeaders,
    });
    if (error) {
      console.error(`[EMAIL] ${label} failed:`, JSON.stringify(error));
    } else {
      console.log(`[EMAIL] ${label} sent to ${to}`);
    }
  } catch (err) {
    console.error(`[EMAIL] ${label} error:`, err);
  }
};

/**
 * Debit email for a customer transfer or withdrawal. COMPLETED is the confirmation;
 * PROCESSING is sent when the transfer was accepted but has not completed yet.
 */
export const sendDebitNotification = async (
  to: string,
  username: string,
  amount: number,
  currency: string,
  newBalance: number,
  transactionType: string,
  transactionId: string,
  details?: Record<string, unknown>,
  stage: DebitStage = 'COMPLETED'
) => {
  const d = describeDebit(transactionType, details);
  const html = buildDebitNotificationHtml(stage, username, amount, currency, newBalance, transactionType, transactionId, details);
  const subject = stage === 'PROCESSING' ? d.processingSubject : d.completedSubject;
  await sendEmail(to, subject, html, `Debit notification (${transactionType}/${stage})`);
};

export const sendTransferDeclinedEmail = async (to: string, notice: TransferOutcomeNotice) => {
  const d = describeDebit(notice.transactionType, notice.details);
  await sendEmail(to, `Vaultix — ${d.label} Declined`, buildTransferDeclinedEmail(notice), 'Transfer declined email');
};

export const sendTransferReversedEmail = async (to: string, notice: TransferOutcomeNotice) => {
  const d = describeDebit(notice.transactionType, notice.details);
  await sendEmail(to, `Vaultix — ${d.label} Reversed`, buildTransferReversedEmail(notice), 'Transfer reversed email');
};

export const sendCreditReversedEmail = async (to: string, notice: CreditReversalNotice) => {
  await sendEmail(to, 'Vaultix — Credit Reversed', buildCreditReversedEmail(notice), 'Credit reversed email');
};

// ─── Funding Status Email Templates ─────────────────────────────────────────

export const buildPendingDepositEmail = (
  username: string,
  amount: number,
  currency: string,
  description: string,
  transactionId: string,
  transactionDate: string
) => {
  const cur = escapeHtml(currency);
  const content = `
    ${heading('Incoming Deposit', `Hi ${escapeHtml(username)}, you have a pending deposit being processed on your Vaultix account.`)}
    ${amountPanel('Pending Amount', `+${cur} ${formatMoney(amount)}`)}
    ${progressSteps([['Received', true], ['Processing', true], ['Credited', false]])}
    ${detailTable([
      ['Transaction ID', escapeHtml(transactionId), { mono: true }],
      ['Description', escapeHtml(description)],
      ['Date', escapeHtml(transactionDate)],
      ['Status', 'Processing'],
    ])}
    ${note('This deposit is being reviewed. Your balance will be updated once the deposit is confirmed.')}
    ${button(`${SITE_URL}/login`, 'View Account')}
    ${helpLine('Questions about this deposit?')}
  `;
  return wrapEmail(content, `Pending deposit of ${cur} ${formatMoney(amount)} on your Vaultix account`);
};

export const buildDepositSuccessEmail = (
  username: string,
  amount: number,
  currency: string,
  newBalance: number,
  description: string,
  transactionId: string,
  transactionDate: string
) => {
  const cur = escapeHtml(currency);
  const content = `
    ${heading('Deposit Confirmed', `Hi ${escapeHtml(username)}, your pending deposit has been confirmed and credited to your account.`)}
    ${amountPanel('Amount Credited', `+${cur} ${formatMoney(amount)}`)}
    ${progressSteps([['Received', true], ['Processing', true], ['Credited', true]])}
    ${detailTable([
      ['Transaction ID', escapeHtml(transactionId), { mono: true }],
      ['Description', escapeHtml(description)],
      ['Date', escapeHtml(transactionDate)],
      ['New Balance', `${cur} ${formatMoney(newBalance)}`, { accent: true }],
    ])}
    ${note('This deposit is now available in your account.')}
    ${button(`${SITE_URL}/login`, 'View Account')}
    ${helpLine('Didn’t expect this?')}
  `;
  return wrapEmail(content, `Deposit of ${cur} ${formatMoney(amount)} confirmed. Your balance is updated.`);
};

export const buildDepositFailedEmail = (
  username: string,
  amount: number,
  currency: string,
  description: string,
  transactionId: string,
  transactionDate: string
) => {
  const cur = escapeHtml(currency);
  const content = `
    ${heading('Deposit Unsuccessful', `Hi ${escapeHtml(username)}, unfortunately your pending deposit could not be processed.`)}
    ${amountPanel('Amount', `${cur} ${formatMoney(amount)}`)}
    ${progressSteps([['Received', true], ['Processing', true], ['Not credited', false]])}
    ${detailTable([
      ['Transaction ID', escapeHtml(transactionId), { mono: true }],
      ['Description', escapeHtml(description)],
      ['Date', escapeHtml(transactionDate)],
      ['Status', 'Not completed'],
    ])}
    ${note('This deposit was not applied to your account and no funds have been deducted. If you believe this is an error, please contact our support team.')}
    ${button(`${SITE_URL}/support`, 'Contact Support')}
    ${helpLine('Need help?', 'Reach out to our team')}
  `;
  return wrapEmail(content, `Deposit of ${cur} ${formatMoney(amount)} could not be processed`);
};

// ─── Send Funding Status Emails ─────────────────────────────────────────────

export const sendPendingDepositEmail = async (
  to: string,
  username: string,
  amount: number,
  currency: string,
  description: string,
  transactionId: string
) => {
  try {
    const transactionDate = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
    const html = buildPendingDepositEmail(username, amount, currency, description, transactionId, transactionDate);
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      replyTo: REPLY_TO,
      to,
      subject: 'Vaultix — Deposit Being Processed',
      html,
      headers: emailHeaders,
    });
    if (error) {
      console.error('[EMAIL] Pending deposit email failed:', JSON.stringify(error));
    } else {
      console.log(`[EMAIL] Pending deposit email sent to ${to}`);
    }
  } catch (err) {
    console.error('[EMAIL] Pending deposit email error:', err);
  }
};

export const sendDepositSuccessEmail = async (
  to: string,
  username: string,
  amount: number,
  currency: string,
  newBalance: number,
  description: string,
  transactionId: string
) => {
  try {
    const transactionDate = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
    const html = buildDepositSuccessEmail(username, amount, currency, newBalance, description, transactionId, transactionDate);
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      replyTo: REPLY_TO,
      to,
      subject: 'Vaultix — Deposit Confirmed',
      html,
      headers: emailHeaders,
    });
    if (error) {
      console.error('[EMAIL] Deposit success email failed:', JSON.stringify(error));
    } else {
      console.log(`[EMAIL] Deposit success email sent to ${to}`);
    }
  } catch (err) {
    console.error('[EMAIL] Deposit success email error:', err);
  }
};

export const sendDepositFailedEmail = async (
  to: string,
  username: string,
  amount: number,
  currency: string,
  description: string,
  transactionId: string
) => {
  try {
    const transactionDate = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
    const html = buildDepositFailedEmail(username, amount, currency, description, transactionId, transactionDate);
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      replyTo: REPLY_TO,
      to,
      subject: 'Vaultix — Deposit Update',
      html,
      headers: emailHeaders,
    });
    if (error) {
      console.error('[EMAIL] Deposit failed email failed:', JSON.stringify(error));
    } else {
      console.log(`[EMAIL] Deposit failed email sent to ${to}`);
    }
  } catch (err) {
    console.error('[EMAIL] Deposit failed email error:', err);
  }
};

// ─── Wire Transfer Notice (admin-recorded wires) ────────────────────────────

export type WireNoticeAudience = 'SENDER' | 'RECIPIENT';
export type WireNoticeStatus = 'PENDING' | 'SUCCESSFUL' | 'FAILED' | 'REVERSED';

export interface WireTransferNotice {
  audience: WireNoticeAudience;
  status: WireNoticeStatus;
  transactionId: string;
  amount: number;
  currency: string;
  reason: string;
  date: Date;
  senderName: string;
  senderBankName?: string | null;
  senderAccountNumber?: string | null;
  recipientName: string;
  recipientBankName: string;
  recipientAccountNumber: string;
  recipientSwiftCode?: string | null;
  recipientRoutingNumber?: string | null;
  isVaultixRecipient: boolean;
  newBalance?: number | null;
  reversalId?: string | null;      // set when status is REVERSED
  message?: string | null;         // optional customer-facing message
}

const WIRE_STATUS_LABEL: Record<WireNoticeStatus, string> = {
  PENDING: 'Processing',
  SUCCESSFUL: 'Completed',
  FAILED: 'Not completed',
  REVERSED: 'Reversed',
};

const wireCopy = (n: WireTransferNotice) => {
  const sender = escapeHtml(n.senderName);
  const recipient = escapeHtml(n.recipientName);

  if (n.audience === 'SENDER') {
    return {
      PENDING: {
        title: 'Wire Transfer Initiated',
        intro: `Hi ${sender}, your wire transfer to <strong>${recipient}</strong> has been initiated and is now being processed.`,
        note: 'We will email you again as soon as the transfer is completed.',
      },
      SUCCESSFUL: {
        title: 'Wire Transfer Completed',
        intro: `Hi ${sender}, your wire transfer to <strong>${recipient}</strong> has been completed successfully.`,
        note: 'Please keep the reference number above for your records.',
      },
      FAILED: {
        title: 'Wire Transfer Unsuccessful',
        intro: `Hi ${sender}, your wire transfer to <strong>${recipient}</strong> could not be completed.`,
        note: 'If you have any questions, contact our support team and quote the reference number above.',
      },
      REVERSED: {
        title: 'Wire Transfer Returned',
        intro: `Hi ${sender}, your wire transfer to <strong>${recipient}</strong> has been reversed and returned.`,
        note: 'If you have any questions, contact our support team and quote the reference number above.',
      },
    }[n.status];
  }

  return {
    PENDING: {
      title: 'Incoming Wire Transfer',
      intro: `Hi ${recipient}, a wire transfer from <strong>${sender}</strong> to your account is on its way.`,
      note: n.isVaultixRecipient
        ? 'Your Vaultix balance will be updated as soon as the transfer is completed.'
        : 'We will email you again as soon as the transfer is completed.',
    },
    SUCCESSFUL: {
      title: 'Wire Transfer Received',
      intro: n.isVaultixRecipient
        ? `Hi ${recipient}, a wire transfer from <strong>${sender}</strong> has been credited to your Vaultix account.`
        : `Hi ${recipient}, the wire transfer from <strong>${sender}</strong> to your account has been completed.`,
      note: n.isVaultixRecipient
        ? 'The funds are available in your account now.'
        : 'Funds will reflect in your account according to your bank’s processing times.',
    },
    FAILED: {
      title: 'Wire Transfer Unsuccessful',
      intro: `Hi ${recipient}, the wire transfer from <strong>${sender}</strong> to your account could not be completed.`,
      note: 'No funds were credited. If you have any questions, contact our support team and quote the reference number above.',
    },
    REVERSED: {
      title: 'Wire Transfer Reversed',
      intro: n.isVaultixRecipient
        ? `Hi ${recipient}, the wire transfer from <strong>${sender}</strong> that was credited to your Vaultix account has been reversed, and the amount has been deducted from your balance.`
        : `Hi ${recipient}, the wire transfer from <strong>${sender}</strong> to your account has been reversed.`,
      note: 'If you have any questions, contact our support team and quote the reference number above.',
    },
  }[n.status];
};

const wirePartyRow = (role: string, name: string, bank?: string | null, account?: string | null) => {
  const meta = [bank && escapeHtml(bank), account && escapeHtml(maskAccount(account))].filter(Boolean).join(' &middot; ');
  return `
    <tr>
      <td style="width:56px;padding:14px 0 14px 16px;vertical-align:top;">
        <span style="color:${COLOR.blue};font-family:${FONT};font-size:11px;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;">${role}</span>
      </td>
      <td style="padding:12px 16px 12px 8px;vertical-align:top;">
        <p style="margin:0;color:${COLOR.ink};font-family:${FONT};font-size:15px;font-weight:600;">${escapeHtml(name)}</p>
        ${meta ? `<p style="margin:2px 0 0;color:${COLOR.muted};font-family:${FONT};font-size:13px;">${meta}</p>` : ''}
      </td>
    </tr>`;
};

export const buildWireTransferNoticeEmail = (n: WireTransferNotice) => {
  const copy = wireCopy(n);
  const fmtAmt = formatMoney(n.amount);
  const currency = escapeHtml(n.currency);
  const date = `${n.date.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' })} UTC`;
  const showBalance = n.audience === 'RECIPIENT' && n.isVaultixRecipient
    && (n.status === 'SUCCESSFUL' || n.status === 'REVERSED') && n.newBalance != null;
  const showDashboard = n.audience === 'RECIPIENT' && n.isVaultixRecipient;

  const rows: DetailRow[] = [
    ...(n.reversalId ? [['Reversal Reference', escapeHtml(n.reversalId), { mono: true }] as DetailRow] : []),
    [n.reversalId ? 'Original Reference' : 'Reference', escapeHtml(n.transactionId), { mono: true }],
    ['Date &amp; Time', date],
    ['Status', WIRE_STATUS_LABEL[n.status]],
    ['Purpose', escapeHtml(n.reason)],
  ];
  if (n.recipientSwiftCode) rows.push(['SWIFT / BIC', escapeHtml(n.recipientSwiftCode), { mono: true, size: 13 }]);
  else if (n.recipientRoutingNumber) rows.push(['Routing Number', escapeHtml(n.recipientRoutingNumber), { mono: true, size: 13 }]);
  if (showBalance) rows.push(['New Balance', `${currency} ${formatMoney(n.newBalance as number)}`, { accent: true }]);

  const finalStep = n.status === 'FAILED' ? 'Not completed' : 'Completed';
  const steps: [string, boolean][] = n.status === 'REVERSED'
    ? [['Initiated', true], ['Completed', true], ['Reversed', true]]
    : [['Initiated', true], ['Processing', true], [finalStep, n.status === 'SUCCESSFUL']];

  const content = `
    ${heading(copy.title, copy.intro)}
    ${amountPanel('Transfer Amount', `${currency} ${fmtAmt}`)}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;border-spacing:0;border:1px solid ${COLOR.soft};border-radius:10px;background:#ffffff;">
      ${wirePartyRow('From', n.senderName, n.senderBankName, n.senderAccountNumber)}
      <tr><td colspan="2" style="padding:0 16px;"><div style="border-top:1px dashed ${COLOR.border};font-size:0;line-height:0;">&nbsp;</div></td></tr>
      ${wirePartyRow('To', n.recipientName, n.recipientBankName, n.recipientAccountNumber)}
    </table>
    ${progressSteps(steps)}
    ${detailTable(rows)}
    ${messagePanel(n.message)}
    ${note(copy.note)}
    ${showDashboard ? button(`${SITE_URL}/login`, 'View in Dashboard') : ''}
    ${helpLine('Questions about this transfer?')}
  `;

  const previewStatus = {
    PENDING: 'is being processed',
    SUCCESSFUL: 'has been completed',
    FAILED: 'could not be completed',
    REVERSED: 'has been reversed',
  }[n.status];
  return wrapEmail(content, `Wire transfer of ${currency} ${fmtAmt} ${previewStatus}`);
};

const WIRE_SUBJECTS: Record<WireNoticeAudience, Record<WireNoticeStatus, string>> = {
  RECIPIENT: {
    PENDING: 'Vaultix — Incoming Wire Transfer',
    SUCCESSFUL: 'Vaultix — Wire Transfer Received',
    FAILED: 'Vaultix — Wire Transfer Update',
    REVERSED: 'Vaultix — Wire Transfer Reversed',
  },
  SENDER: {
    PENDING: 'Vaultix — Wire Transfer Initiated',
    SUCCESSFUL: 'Vaultix — Wire Transfer Completed',
    FAILED: 'Vaultix — Wire Transfer Update',
    REVERSED: 'Vaultix — Wire Transfer Returned',
  },
};

export const sendWireTransferNotice = async (to: string, notice: WireTransferNotice) => {
  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      replyTo: REPLY_TO,
      to,
      subject: WIRE_SUBJECTS[notice.audience][notice.status],
      html: buildWireTransferNoticeEmail(notice),
      headers: emailHeaders,
    });
    if (error) {
      console.error('[EMAIL] Wire transfer notice failed:', JSON.stringify(error));
    } else {
      console.log(`[EMAIL] Wire transfer notice (${notice.audience}/${notice.status}) sent to ${to}`);
    }
  } catch (err) {
    console.error('[EMAIL] Wire transfer notice error:', err);
  }
};
