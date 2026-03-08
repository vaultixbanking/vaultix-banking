import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = 'Vaultix Bank <no-reply@vaultixbank.org>';

// ─── Shared Styles (inline-safe for email clients) ──────────────────────────

const baseStyles = `
  body { margin:0; padding:0; background-color:#f1f5f9; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif; -webkit-font-smoothing:antialiased; }
  .wrapper { width:100%; background-color:#f1f5f9; padding:40px 16px; }
  .card { max-width:560px; margin:0 auto; background:#ffffff; border-radius:12px; overflow:hidden; border:1px solid #e2e8f0; }
  .header { background:#0f172a; padding:28px 32px; text-align:center; }
  .header-brand { color:#ffffff; font-size:20px; font-weight:700; letter-spacing:-0.3px; margin:0; }
  .body-content { padding:32px; }
  .footer { padding:20px 32px; border-top:1px solid #e2e8f0; text-align:center; }
  .footer p { color:#94a3b8; font-size:11px; margin:2px 0; line-height:1.5; }
  .footer a { color:#94a3b8; text-decoration:underline; }
  h1 { color:#0f172a; font-size:22px; font-weight:700; margin:0 0 8px; line-height:1.3; }
  .subtitle { color:#64748b; font-size:15px; margin:0 0 24px; line-height:1.6; }
  .btn { display:inline-block; padding:12px 28px; color:#ffffff; text-decoration:none; border-radius:8px; font-weight:600; font-size:14px; text-align:center; }
  .btn-primary { background:#0f172a; }
  .btn-green { background:#16a34a; }
  .btn-red { background:#dc2626; }
  .info-box { border-radius:10px; padding:20px; text-align:center; margin:24px 0; }
  .info-label { font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.8px; margin:0 0 6px; }
  .info-value { font-size:26px; font-weight:700; font-family:'SF Mono',Monaco,'Cascadia Code',Consolas,monospace; margin:0; }
  .detail-table { width:100%; border-collapse:collapse; margin:20px 0; }
  .detail-table td { padding:12px 0; font-size:14px; vertical-align:top; }
  .detail-table tr { border-bottom:1px solid #f1f5f9; }
  .detail-table tr:last-child { border-bottom:none; }
  .detail-label { color:#64748b; font-weight:500; }
  .detail-value { color:#0f172a; font-weight:600; text-align:right; }
  .alert-box { border-radius:8px; padding:14px 18px; margin:20px 0; font-size:13px; line-height:1.5; }
  .divider { border:none; border-top:1px solid #e2e8f0; margin:24px 0; }
  .amount-credit { color:#16a34a; font-size:28px; font-weight:700; margin:0; }
  .amount-debit { color:#dc2626; font-size:28px; font-weight:700; margin:0; }
  .feature-grid { width:100%; border-spacing:8px; border-collapse:separate; }
  .feature-cell { background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:14px 10px; text-align:center; width:33%; vertical-align:top; }
  .feature-title { color:#0f172a; font-size:12px; font-weight:600; margin:6px 0 2px; }
  .feature-desc { color:#94a3b8; font-size:11px; margin:0; }
  .step-num { display:inline-block; width:24px; height:24px; background:#0f172a; color:#fff; border-radius:50%; text-align:center; line-height:24px; font-size:12px; font-weight:700; }
  .step-title { color:#0f172a; font-weight:600; font-size:14px; margin:0; }
  .step-desc { color:#64748b; font-size:13px; margin:2px 0 0; }
  .mono { font-family:'SF Mono',Monaco,'Cascadia Code',Consolas,monospace; }
`;

const headerHtml = `
  <div class="header">
    <p class="header-brand">VAULTIX</p>
  </div>
`;

const footerHtml = `
  <div class="footer">
    <p>&copy; ${new Date().getFullYear()} Vaultix Bank. All rights reserved.</p>
    <p style="margin-top:6px;">
      <a href="https://vaultixbank.org/privacy">Privacy</a> &middot;
      <a href="https://vaultixbank.org/terms">Terms</a> &middot;
      <a href="https://vaultixbank.org/support">Support</a>
    </p>
  </div>
`;

const wrapEmail = (content: string, previewText: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Vaultix Bank</title>
  <style>${baseStyles}</style>
</head>
<body>
  <div style="display:none;max-height:0;overflow:hidden;">${previewText}</div>
  <div class="wrapper">
    <div class="card">
      ${headerHtml}
      <div class="body-content">
        ${content}
      </div>
      ${footerHtml}
    </div>
  </div>
</body>
</html>
`;

// ─── Email Templates ────────────────────────────────────────────────────────

export const buildVerificationEmail = (username: string, verificationLink: string) => {
  const content = `
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-block;width:56px;height:56px;background:#eff6ff;border-radius:50%;line-height:56px;">
        <span style="font-size:24px;">✉️</span>
      </div>
    </div>
    <h1 style="text-align:center;">Verify Your Email</h1>
    <p class="subtitle" style="text-align:center;">
      Hi ${username}, thanks for signing up with Vaultix. Please verify your email address to activate your account.
    </p>
    <div style="text-align:center;margin:28px 0;">
      <a href="${verificationLink}" class="btn btn-primary">Verify Email Address</a>
    </div>
    <hr class="divider" />
    <p style="color:#94a3b8;font-size:12px;text-align:center;line-height:1.6;">
      This link expires in 24 hours. If you didn't create a Vaultix account, you can safely ignore this email.
    </p>
    <p style="color:#cbd5e1;font-size:11px;text-align:center;margin-top:12px;word-break:break-all;" class="mono">
      ${verificationLink}
    </p>
  `;
  return wrapEmail(content, 'Verify your Vaultix account email address');
};

export const buildWelcomeEmail = (username: string, accountNumber: string) => {
  const content = `
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-block;width:56px;height:56px;background:#f0fdf4;border-radius:50%;line-height:56px;">
        <span style="font-size:24px;">✅</span>
      </div>
    </div>
    <h1 style="text-align:center;">Welcome to Vaultix, ${username}!</h1>
    <p class="subtitle" style="text-align:center;">
      Your email has been verified and your secure banking account is now active.
    </p>

    <div class="info-box" style="background:#f8fafc;border:1px solid #e2e8f0;">
      <p class="info-label" style="color:#64748b;">Your Account Number</p>
      <p class="info-value" style="color:#0f172a;">${accountNumber}</p>
    </div>

    <table class="feature-grid" role="presentation">
      <tr>
        <td class="feature-cell">
          <div style="font-size:20px;margin-bottom:4px;">🔒</div>
          <p class="feature-title">Secure Banking</p>
          <p class="feature-desc">256-bit encryption</p>
        </td>
        <td class="feature-cell">
          <div style="font-size:20px;margin-bottom:4px;">🕐</div>
          <p class="feature-title">24/7 Access</p>
          <p class="feature-desc">Bank anytime</p>
        </td>
        <td class="feature-cell">
          <div style="font-size:20px;margin-bottom:4px;">🛡️</div>
          <p class="feature-title">FDIC Insured</p>
          <p class="feature-desc">Up to $250,000</p>
        </td>
      </tr>
    </table>

    <div style="text-align:center;margin:28px 0;">
      <a href="https://vaultixbank.org/login" class="btn btn-primary">Go to Dashboard</a>
    </div>

    <hr class="divider" />

    <p style="color:#0f172a;font-size:16px;font-weight:600;margin:0 0 16px;">Getting Started</p>

    <table role="presentation" style="width:100%;">
      <tr>
        <td style="width:32px;vertical-align:top;padding-bottom:14px;"><span class="step-num">1</span></td>
        <td style="padding-left:10px;padding-bottom:14px;">
          <p class="step-title">Complete your profile</p>
          <p class="step-desc">Add preferences and security settings</p>
        </td>
      </tr>
      <tr>
        <td style="width:32px;vertical-align:top;padding-bottom:14px;"><span class="step-num">2</span></td>
        <td style="padding-left:10px;padding-bottom:14px;">
          <p class="step-title">Fund your account</p>
          <p class="step-desc">Make your first deposit and start banking</p>
        </td>
      </tr>
      <tr>
        <td style="width:32px;vertical-align:top;"><span class="step-num">3</span></td>
        <td style="padding-left:10px;">
          <p class="step-title">Send &amp; receive money</p>
          <p class="step-desc">Enjoy fast, secure transfers worldwide</p>
        </td>
      </tr>
    </table>

    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px 18px;margin-top:24px;">
      <p style="color:#0f172a;font-weight:600;font-size:13px;margin:0 0 4px;">Need help?</p>
      <p style="color:#64748b;font-size:12px;margin:0;">
        Our support team is available 24/7 — <a href="https://vaultixbank.org/support" style="color:#0f172a;font-weight:600;text-decoration:none;">Contact Support &rarr;</a>
      </p>
    </div>
  `;
  return wrapEmail(content, `Welcome to Vaultix, ${username}! Your account is ready.`);
};

export const buildCreditNotificationEmail = (
  username: string,
  amount: number,
  currency: string,
  newBalance: number,
  description: string,
  transactionDate: string
) => {
  const fmtAmt = amount.toLocaleString('en-US', { minimumFractionDigits: 2 });
  const fmtBal = newBalance.toLocaleString('en-US', { minimumFractionDigits: 2 });
  const content = `
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-block;width:56px;height:56px;background:#f0fdf4;border-radius:50%;line-height:56px;">
        <span style="font-size:24px;">💰</span>
      </div>
    </div>
    <h1 style="text-align:center;">Money Received</h1>
    <p class="subtitle" style="text-align:center;">
      Hi ${username}, your Vaultix account has been credited.
    </p>

    <div class="info-box" style="background:#f0fdf4;border:1px solid #bbf7d0;">
      <p class="info-label" style="color:#166534;">Amount Credited</p>
      <p class="amount-credit">+${currency} ${fmtAmt}</p>
    </div>

    <table class="detail-table">
      <tr>
        <td class="detail-label">Description</td>
        <td class="detail-value">${description}</td>
      </tr>
      <tr>
        <td class="detail-label">Date &amp; Time</td>
        <td class="detail-value">${transactionDate}</td>
      </tr>
      <tr>
        <td class="detail-label">New Balance</td>
        <td class="detail-value" style="color:#16a34a;">${currency} ${fmtBal}</td>
      </tr>
    </table>

    <div class="alert-box" style="background:#f0fdf4;border:1px solid #bbf7d0;">
      <p style="color:#166534;margin:0;">✅ This credit is available in your account immediately.</p>
    </div>

    <div style="text-align:center;margin:24px 0;">
      <a href="https://vaultixbank.org/login" class="btn btn-green">View Account</a>
    </div>

    <hr class="divider" />
    <p style="color:#94a3b8;font-size:12px;text-align:center;">
      Didn't expect this? <a href="https://vaultixbank.org/support" style="color:#0f172a;font-weight:600;">Contact support</a>
    </p>
  `;
  return wrapEmail(content, `You received ${currency} ${fmtAmt} in your Vaultix account`);
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
  icon: string,
  detailRows: string
) => {
  const fmtAmt = amount.toLocaleString('en-US', { minimumFractionDigits: 2 });
  const fmtBal = newBalance.toLocaleString('en-US', { minimumFractionDigits: 2 });
  return `
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-block;width:56px;height:56px;background:#fef2f2;border-radius:50%;line-height:56px;">
        <span style="font-size:24px;">${icon}</span>
      </div>
    </div>
    <h1 style="text-align:center;">${title}</h1>
    <p class="subtitle" style="text-align:center;">
      Hi ${username}, a transaction has been processed on your account.
    </p>

    <div class="info-box" style="background:#fef2f2;border:1px solid #fecaca;">
      <p class="info-label" style="color:#991b1b;">Amount Debited</p>
      <p class="amount-debit">-${currency} ${fmtAmt}</p>
    </div>

    <table class="detail-table">
      <tr>
        <td class="detail-label">Transaction ID</td>
        <td class="detail-value mono" style="font-size:12px;">${transactionId}</td>
      </tr>
      <tr>
        <td class="detail-label">Date &amp; Time</td>
        <td class="detail-value">${transactionDate}</td>
      </tr>
      ${detailRows}
      <tr>
        <td class="detail-label">Remaining Balance</td>
        <td class="detail-value">${currency} ${fmtBal}</td>
      </tr>
    </table>

    <div class="alert-box" style="background:#fef2f2;border:1px solid #fecaca;">
      <p style="color:#991b1b;margin:0;">🔔 This debit has been processed from your account.</p>
    </div>

    <div style="text-align:center;margin:24px 0;">
      <a href="https://vaultixbank.org/login" class="btn btn-red">View Transaction</a>
    </div>

    <hr class="divider" />
    <p style="color:#94a3b8;font-size:12px;text-align:center;">
      Didn't authorize this? <a href="https://vaultixbank.org/support" style="color:#dc2626;font-weight:600;">Contact support immediately</a>
    </p>
  `;
};

export const buildWireTransferEmail = (
  username: string, amount: number, currency: string, newBalance: number,
  transactionId: string, transactionDate: string,
  beneficiaryName: string, bankName: string, swiftCode: string
) => {
  const details = `
    <tr><td class="detail-label">Beneficiary</td><td class="detail-value">${beneficiaryName}</td></tr>
    <tr><td class="detail-label">Bank</td><td class="detail-value">${bankName}</td></tr>
    <tr><td class="detail-label">SWIFT / BIC</td><td class="detail-value mono" style="font-size:12px;">${swiftCode}</td></tr>
  `;
  const content = buildDebitContent(username, amount, currency, newBalance, transactionId, transactionDate, 'Wire Transfer Sent', '🌐', details);
  return wrapEmail(content, `Wire transfer of ${currency} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} processed`);
};

export const buildDomesticTransferEmail = (
  username: string, amount: number, currency: string, newBalance: number,
  transactionId: string, transactionDate: string,
  recipientName: string, bankName: string, accountNumber: string
) => {
  const details = `
    <tr><td class="detail-label">Recipient</td><td class="detail-value">${recipientName}</td></tr>
    <tr><td class="detail-label">Bank</td><td class="detail-value">${bankName}</td></tr>
    <tr><td class="detail-label">Account</td><td class="detail-value mono" style="font-size:12px;">${accountNumber}</td></tr>
  `;
  const content = buildDebitContent(username, amount, currency, newBalance, transactionId, transactionDate, 'Domestic Transfer Sent', '🏦', details);
  return wrapEmail(content, `Domestic transfer of ${currency} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} processed`);
};

export const buildBankWithdrawalEmail = (
  username: string, amount: number, currency: string, newBalance: number,
  transactionId: string, transactionDate: string,
  bankName: string, accountNumber: string
) => {
  const maskedAccount = accountNumber.length > 4 ? '••••' + accountNumber.slice(-4) : accountNumber;
  const details = `
    <tr><td class="detail-label">Withdrawal To</td><td class="detail-value">${bankName}</td></tr>
    <tr><td class="detail-label">Account</td><td class="detail-value mono" style="font-size:12px;">${maskedAccount}</td></tr>
  `;
  const content = buildDebitContent(username, amount, currency, newBalance, transactionId, transactionDate, 'Bank Withdrawal', '🏧', details);
  return wrapEmail(content, `Bank withdrawal of ${currency} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} processed`);
};

export const buildCryptoWithdrawalEmail = (
  username: string, amount: number, currency: string, newBalance: number,
  transactionId: string, transactionDate: string,
  cryptoType: string, walletAddress: string, network: string
) => {
  const shortAddr = walletAddress.length > 12 ? walletAddress.slice(0, 6) + '••••' + walletAddress.slice(-6) : walletAddress;
  const details = `
    <tr><td class="detail-label">Crypto</td><td class="detail-value" style="text-transform:capitalize;">${cryptoType}</td></tr>
    <tr><td class="detail-label">Wallet</td><td class="detail-value mono" style="font-size:11px;">${shortAddr}</td></tr>
    ${network ? `<tr><td class="detail-label">Network</td><td class="detail-value">${network}</td></tr>` : ''}
  `;
  const content = buildDebitContent(username, amount, currency, newBalance, transactionId, transactionDate, 'Crypto Withdrawal', '₿', details);
  return wrapEmail(content, `Crypto withdrawal of ${currency} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} processed`);
};

// Generic debit (fallback)
export const buildDebitNotificationEmail = (
  username: string, amount: number, currency: string, newBalance: number,
  transactionType: string, transactionId: string, transactionDate: string
) => {
  const details = `
    <tr><td class="detail-label">Type</td><td class="detail-value">${transactionType}</td></tr>
  `;
  const content = buildDebitContent(username, amount, currency, newBalance, transactionId, transactionDate, 'Money Sent', '💸', details);
  return wrapEmail(content, `Debit of ${currency} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} from your Vaultix account`);
};

// ─── Send Functions ─────────────────────────────────────────────────────────

export const sendVerificationEmail = async (to: string, username: string, verificationLink: string) => {
  try {
    const html = buildVerificationEmail(username, verificationLink);
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Verify Your Vaultix Account',
      html,
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

export const sendWelcomeEmail = async (to: string, username: string, accountNumber: string) => {
  try {
    const html = buildWelcomeEmail(username, accountNumber);
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Welcome to Vaultix Bank!',
      html,
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
    const fmtAmt = amount.toLocaleString('en-US', { minimumFractionDigits: 2 });
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Credit Alert: +${currency} ${fmtAmt}`,
      html,
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
    const fmtAmt = amount.toLocaleString('en-US', { minimumFractionDigits: 2 });

    if (transactionType === 'BANK' && details?.transferType === 'WIRE') {
      html = buildWireTransferEmail(
        username, amount, currency, newBalance, transactionId, transactionDate,
        (details.beneficiaryName as string) || 'N/A',
        (details.bankName as string) || 'N/A',
        (details.swiftCode as string) || 'N/A'
      );
      subject = `Wire Transfer: -${currency} ${fmtAmt}`;
    } else if (transactionType === 'BANK' && details?.transferType === 'DOMESTIC') {
      html = buildDomesticTransferEmail(
        username, amount, currency, newBalance, transactionId, transactionDate,
        (details.recipientName as string) || (details.beneficiaryName as string) || 'N/A',
        (details.bankName as string) || 'N/A',
        (details.accountNumber as string) || 'N/A'
      );
      subject = `Domestic Transfer: -${currency} ${fmtAmt}`;
    } else if (transactionType === 'BANK') {
      html = buildBankWithdrawalEmail(
        username, amount, currency, newBalance, transactionId, transactionDate,
        (details?.bankName as string) || 'External Bank',
        (details?.accountNumber as string) || 'N/A'
      );
      subject = `Bank Withdrawal: -${currency} ${fmtAmt}`;
    } else if (transactionType === 'CRYPTO') {
      html = buildCryptoWithdrawalEmail(
        username, amount, currency, newBalance, transactionId, transactionDate,
        (details?.cryptoType as string) || 'Crypto',
        (details?.walletAddress as string) || 'N/A',
        (details?.network as string) || ''
      );
      subject = `Crypto Withdrawal: -${currency} ${fmtAmt}`;
    } else {
      html = buildDebitNotificationEmail(username, amount, currency, newBalance, transactionType, transactionId, transactionDate);
      subject = `Debit Alert: -${currency} ${fmtAmt}`;
    }

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
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
  const fmtAmt = amount.toLocaleString('en-US', { minimumFractionDigits: 2 });
  const content = `
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-block;width:56px;height:56px;background:#fefce8;border-radius:50%;line-height:56px;">
        <span style="font-size:24px;">⏳</span>
      </div>
    </div>
    <h1 style="text-align:center;">Incoming Deposit</h1>
    <p class="subtitle" style="text-align:center;">
      Hi ${username}, you have a pending deposit being processed on your Vaultix account.
    </p>

    <div class="info-box" style="background:#fefce8;border:1px solid #fde68a;">
      <p class="info-label" style="color:#92400e;">Pending Amount</p>
      <p style="color:#d97706;font-size:28px;font-weight:700;margin:0;">+${currency} ${fmtAmt}</p>
    </div>

    <table class="detail-table">
      <tr>
        <td class="detail-label">Transaction ID</td>
        <td class="detail-value mono" style="font-size:12px;">${transactionId}</td>
      </tr>
      <tr>
        <td class="detail-label">Description</td>
        <td class="detail-value">${description}</td>
      </tr>
      <tr>
        <td class="detail-label">Date</td>
        <td class="detail-value">${transactionDate}</td>
      </tr>
      <tr>
        <td class="detail-label">Status</td>
        <td class="detail-value" style="color:#d97706;">⏳ Pending Review</td>
      </tr>
    </table>

    <div class="alert-box" style="background:#fefce8;border:1px solid #fde68a;">
      <p style="color:#92400e;margin:0;">🔔 This deposit is being reviewed. Your balance will be updated once the deposit is confirmed.</p>
    </div>

    <div style="text-align:center;margin:24px 0;">
      <a href="https://vaultixbank.org/login" class="btn btn-primary">View Account</a>
    </div>

    <hr class="divider" />
    <p style="color:#94a3b8;font-size:12px;text-align:center;">
      Questions? <a href="https://vaultixbank.org/support" style="color:#0f172a;font-weight:600;">Contact support</a>
    </p>
  `;
  return wrapEmail(content, `Pending deposit of ${currency} ${fmtAmt} on your Vaultix account`);
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
  const fmtAmt = amount.toLocaleString('en-US', { minimumFractionDigits: 2 });
  const fmtBal = newBalance.toLocaleString('en-US', { minimumFractionDigits: 2 });
  const content = `
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-block;width:56px;height:56px;background:#f0fdf4;border-radius:50%;line-height:56px;">
        <span style="font-size:24px;">✅</span>
      </div>
    </div>
    <h1 style="text-align:center;">Deposit Confirmed</h1>
    <p class="subtitle" style="text-align:center;">
      Hi ${username}, your pending deposit has been confirmed and credited to your account.
    </p>

    <div class="info-box" style="background:#f0fdf4;border:1px solid #bbf7d0;">
      <p class="info-label" style="color:#166534;">Amount Credited</p>
      <p class="amount-credit">+${currency} ${fmtAmt}</p>
    </div>

    <table class="detail-table">
      <tr>
        <td class="detail-label">Transaction ID</td>
        <td class="detail-value mono" style="font-size:12px;">${transactionId}</td>
      </tr>
      <tr>
        <td class="detail-label">Description</td>
        <td class="detail-value">${description}</td>
      </tr>
      <tr>
        <td class="detail-label">Date</td>
        <td class="detail-value">${transactionDate}</td>
      </tr>
      <tr>
        <td class="detail-label">New Balance</td>
        <td class="detail-value" style="color:#16a34a;">${currency} ${fmtBal}</td>
      </tr>
    </table>

    <div class="alert-box" style="background:#f0fdf4;border:1px solid #bbf7d0;">
      <p style="color:#166534;margin:0;">✅ This deposit is now available in your account.</p>
    </div>

    <div style="text-align:center;margin:24px 0;">
      <a href="https://vaultixbank.org/login" class="btn btn-green">View Account</a>
    </div>

    <hr class="divider" />
    <p style="color:#94a3b8;font-size:12px;text-align:center;">
      Didn't expect this? <a href="https://vaultixbank.org/support" style="color:#0f172a;font-weight:600;">Contact support</a>
    </p>
  `;
  return wrapEmail(content, `Deposit of ${currency} ${fmtAmt} confirmed — your balance is updated`);
};

export const buildDepositFailedEmail = (
  username: string,
  amount: number,
  currency: string,
  description: string,
  transactionId: string,
  transactionDate: string
) => {
  const fmtAmt = amount.toLocaleString('en-US', { minimumFractionDigits: 2 });
  const content = `
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-block;width:56px;height:56px;background:#fef2f2;border-radius:50%;line-height:56px;">
        <span style="font-size:24px;">❌</span>
      </div>
    </div>
    <h1 style="text-align:center;">Deposit Failed</h1>
    <p class="subtitle" style="text-align:center;">
      Hi ${username}, unfortunately your pending deposit could not be processed.
    </p>

    <div class="info-box" style="background:#fef2f2;border:1px solid #fecaca;">
      <p class="info-label" style="color:#991b1b;">Amount</p>
      <p style="color:#dc2626;font-size:28px;font-weight:700;margin:0;">${currency} ${fmtAmt}</p>
    </div>

    <table class="detail-table">
      <tr>
        <td class="detail-label">Transaction ID</td>
        <td class="detail-value mono" style="font-size:12px;">${transactionId}</td>
      </tr>
      <tr>
        <td class="detail-label">Description</td>
        <td class="detail-value">${description}</td>
      </tr>
      <tr>
        <td class="detail-label">Date</td>
        <td class="detail-value">${transactionDate}</td>
      </tr>
      <tr>
        <td class="detail-label">Status</td>
        <td class="detail-value" style="color:#dc2626;">❌ Failed</td>
      </tr>
    </table>

    <div class="alert-box" style="background:#fef2f2;border:1px solid #fecaca;">
      <p style="color:#991b1b;margin:0;">This deposit was not applied to your account. No funds have been deducted. If you believe this is an error, please contact our support team.</p>
    </div>

    <div style="text-align:center;margin:24px 0;">
      <a href="https://vaultixbank.org/support" class="btn btn-red">Contact Support</a>
    </div>

    <hr class="divider" />
    <p style="color:#94a3b8;font-size:12px;text-align:center;">
      Need help? <a href="https://vaultixbank.org/support" style="color:#0f172a;font-weight:600;">Reach out to our team</a>
    </p>
  `;
  return wrapEmail(content, `Deposit of ${currency} ${fmtAmt} could not be processed`);
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
    const fmtAmt = amount.toLocaleString('en-US', { minimumFractionDigits: 2 });
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Pending Deposit: +${currency} ${fmtAmt}`,
      html,
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
    const fmtAmt = amount.toLocaleString('en-US', { minimumFractionDigits: 2 });
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Deposit Confirmed: +${currency} ${fmtAmt}`,
      html,
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
    const fmtAmt = amount.toLocaleString('en-US', { minimumFractionDigits: 2 });
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Deposit Failed: ${currency} ${fmtAmt}`,
      html,
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
