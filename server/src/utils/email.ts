import { Resend } from 'resend';

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

const maskAccount = (accountNumber: string) =>
  accountNumber.length > 4 ? `••••${accountNumber.slice(-4)}` : accountNumber;

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

const buildDebitContent = (
  username: string,
  amount: number,
  currency: string,
  newBalance: number,
  transactionId: string,
  transactionDate: string,
  title: string,
  detailRows: DetailRow[]
) => {
  const cur = escapeHtml(currency);
  return `
    ${heading(title, `Hi ${escapeHtml(username)}, a transaction has been processed on your account.`)}
    ${amountPanel('Amount Debited', `-${cur} ${formatMoney(amount)}`)}
    ${detailTable([
      ['Transaction ID', escapeHtml(transactionId), { mono: true }],
      ['Date &amp; Time', escapeHtml(transactionDate)],
      ...detailRows,
      ['Remaining Balance', `${cur} ${formatMoney(newBalance)}`],
    ])}
    ${note('If you didn’t make this transaction, contact our support team immediately.')}
    ${button(`${SITE_URL}/login`, 'View Transaction')}
    ${helpLine('Questions about this transaction?')}
  `;
};

const debitPreview = (kind: string, amount: number, currency: string) =>
  `${kind} of ${escapeHtml(currency)} ${formatMoney(amount)} processed`;

export const buildWireTransferEmail = (
  username: string, amount: number, currency: string, newBalance: number,
  transactionId: string, transactionDate: string,
  beneficiaryName: string, bankName: string, swiftCode: string
) => {
  const content = buildDebitContent(username, amount, currency, newBalance, transactionId, transactionDate, 'Wire Transfer Sent', [
    ['Beneficiary', escapeHtml(beneficiaryName)],
    ['Bank', escapeHtml(bankName)],
    ['SWIFT / BIC', escapeHtml(swiftCode), { mono: true }],
  ]);
  return wrapEmail(content, debitPreview('Wire transfer', amount, currency));
};

export const buildDomesticTransferEmail = (
  username: string, amount: number, currency: string, newBalance: number,
  transactionId: string, transactionDate: string,
  recipientName: string, bankName: string, accountNumber: string
) => {
  const content = buildDebitContent(username, amount, currency, newBalance, transactionId, transactionDate, 'Domestic Transfer Sent', [
    ['Recipient', escapeHtml(recipientName)],
    ['Bank', escapeHtml(bankName)],
    ['Account', escapeHtml(maskAccount(accountNumber)), { mono: true }],
  ]);
  return wrapEmail(content, debitPreview('Domestic transfer', amount, currency));
};

export const buildBankWithdrawalEmail = (
  username: string, amount: number, currency: string, newBalance: number,
  transactionId: string, transactionDate: string,
  bankName: string, accountNumber: string
) => {
  const content = buildDebitContent(username, amount, currency, newBalance, transactionId, transactionDate, 'Bank Withdrawal', [
    ['Withdrawal To', escapeHtml(bankName)],
    ['Account', escapeHtml(maskAccount(accountNumber)), { mono: true }],
  ]);
  return wrapEmail(content, debitPreview('Bank withdrawal', amount, currency));
};

export const buildCryptoWithdrawalEmail = (
  username: string, amount: number, currency: string, newBalance: number,
  transactionId: string, transactionDate: string,
  cryptoType: string, walletAddress: string, network: string
) => {
  const shortAddr = walletAddress.length > 12 ? `${walletAddress.slice(0, 6)}••••${walletAddress.slice(-6)}` : walletAddress;
  const crypto = cryptoType.charAt(0).toUpperCase() + cryptoType.slice(1);
  const content = buildDebitContent(username, amount, currency, newBalance, transactionId, transactionDate, 'Crypto Withdrawal', [
    ['Crypto', escapeHtml(crypto)],
    ['Wallet', escapeHtml(shortAddr), { mono: true, size: 11 }],
    ...(network ? [['Network', escapeHtml(network)] as DetailRow] : []),
  ]);
  return wrapEmail(content, debitPreview('Crypto withdrawal', amount, currency));
};

// Generic debit (fallback)
export const buildDebitNotificationEmail = (
  username: string, amount: number, currency: string, newBalance: number,
  transactionType: string, transactionId: string, transactionDate: string
) => {
  const content = buildDebitContent(username, amount, currency, newBalance, transactionId, transactionDate, 'Money Sent', [
    ['Type', escapeHtml(transactionType)],
  ]);
  return wrapEmail(content, `Debit of ${escapeHtml(currency)} ${formatMoney(amount)} from your Vaultix account`);
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

export const sendDebitNotification = async (
  to: string,
  username: string,
  amount: number,
  currency: string,
  newBalance: number,
  transactionType: string,
  transactionId: string,
  details?: Record<string, unknown>
) => {
  try {
    const transactionDate = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
    let html: string;
    let subject: string;

    if (transactionType === 'BANK' && details?.transferType === 'WIRE') {
      html = buildWireTransferEmail(
        username, amount, currency, newBalance, transactionId, transactionDate,
        (details.beneficiaryName as string) || 'N/A',
        (details.bankName as string) || 'N/A',
        (details.swiftCode as string) || 'N/A'
      );
      subject = 'Vaultix — Wire Transfer Confirmation';
    } else if (transactionType === 'BANK' && details?.transferType === 'DOMESTIC') {
      html = buildDomesticTransferEmail(
        username, amount, currency, newBalance, transactionId, transactionDate,
        (details.recipientName as string) || (details.beneficiaryName as string) || 'N/A',
        (details.bankName as string) || 'N/A',
        (details.accountNumber as string) || 'N/A'
      );
      subject = 'Vaultix — Transfer Confirmation';
    } else if (transactionType === 'BANK') {
      html = buildBankWithdrawalEmail(
        username, amount, currency, newBalance, transactionId, transactionDate,
        (details?.bankName as string) || 'External Bank',
        (details?.accountNumber as string) || 'N/A'
      );
      subject = 'Vaultix — Withdrawal Confirmation';
    } else if (transactionType === 'CRYPTO') {
      html = buildCryptoWithdrawalEmail(
        username, amount, currency, newBalance, transactionId, transactionDate,
        (details?.cryptoType as string) || 'Crypto',
        (details?.walletAddress as string) || 'N/A',
        (details?.network as string) || ''
      );
      subject = 'Vaultix — Withdrawal Confirmation';
    } else {
      html = buildDebitNotificationEmail(username, amount, currency, newBalance, transactionType, transactionId, transactionDate);
      subject = 'Vaultix — Transaction Confirmation';
    }

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      replyTo: REPLY_TO,
      to,
      subject,
      html,
      headers: emailHeaders,
    });
    if (error) {
      console.error('[EMAIL] Debit notification failed:', JSON.stringify(error));
    } else {
      console.log(`[EMAIL] Debit notification (${transactionType}) sent to ${to}`);
    }
  } catch (err) {
    console.error('[EMAIL] Debit notification error:', err);
  }
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
export type WireNoticeStatus = 'PENDING' | 'SUCCESSFUL' | 'FAILED';

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
}

const WIRE_STATUS_LABEL: Record<WireNoticeStatus, string> = {
  PENDING: 'Processing',
  SUCCESSFUL: 'Completed',
  FAILED: 'Not completed',
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
  const showBalance = n.audience === 'RECIPIENT' && n.isVaultixRecipient && n.status === 'SUCCESSFUL' && n.newBalance != null;
  const showDashboard = n.audience === 'RECIPIENT' && n.isVaultixRecipient;

  const rows: DetailRow[] = [
    ['Reference', escapeHtml(n.transactionId), { mono: true }],
    ['Date &amp; Time', date],
    ['Status', WIRE_STATUS_LABEL[n.status]],
    ['Purpose', escapeHtml(n.reason)],
  ];
  if (n.recipientSwiftCode) rows.push(['SWIFT / BIC', escapeHtml(n.recipientSwiftCode), { mono: true, size: 13 }]);
  else if (n.recipientRoutingNumber) rows.push(['Routing Number', escapeHtml(n.recipientRoutingNumber), { mono: true, size: 13 }]);
  if (showBalance) rows.push(['New Balance', `${currency} ${formatMoney(n.newBalance as number)}`, { accent: true }]);

  const finalStep = n.status === 'FAILED' ? 'Not completed' : 'Completed';

  const content = `
    ${heading(copy.title, copy.intro)}
    ${amountPanel('Transfer Amount', `${currency} ${fmtAmt}`)}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;border-spacing:0;border:1px solid ${COLOR.soft};border-radius:10px;background:#ffffff;">
      ${wirePartyRow('From', n.senderName, n.senderBankName, n.senderAccountNumber)}
      <tr><td colspan="2" style="padding:0 16px;"><div style="border-top:1px dashed ${COLOR.border};font-size:0;line-height:0;">&nbsp;</div></td></tr>
      ${wirePartyRow('To', n.recipientName, n.recipientBankName, n.recipientAccountNumber)}
    </table>
    ${progressSteps([['Initiated', true], ['Processing', true], [finalStep, n.status === 'SUCCESSFUL']])}
    ${detailTable(rows)}
    ${note(copy.note)}
    ${showDashboard ? button(`${SITE_URL}/login`, 'View in Dashboard') : ''}
    ${helpLine('Questions about this transfer?')}
  `;

  const previewStatus = { PENDING: 'is being processed', SUCCESSFUL: 'has been completed', FAILED: 'could not be completed' }[n.status];
  return wrapEmail(content, `Wire transfer of ${currency} ${fmtAmt} ${previewStatus}`);
};

const WIRE_SUBJECTS: Record<WireNoticeAudience, Record<WireNoticeStatus, string>> = {
  RECIPIENT: {
    PENDING: 'Vaultix — Incoming Wire Transfer',
    SUCCESSFUL: 'Vaultix — Wire Transfer Received',
    FAILED: 'Vaultix — Wire Transfer Update',
  },
  SENDER: {
    PENDING: 'Vaultix — Wire Transfer Initiated',
    SUCCESSFUL: 'Vaultix — Wire Transfer Completed',
    FAILED: 'Vaultix — Wire Transfer Update',
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
