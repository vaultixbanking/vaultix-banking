import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = 'Vaultix Bank <no-reply@vaultixbank.org>';

// ─── Shared Styles ──────────────────────────────────────────────────────────

const baseStyles = `
  body { margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
  .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
  .card { background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.05); }
  .header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 32px; text-align: center; }
  .logo-circle { display: inline-block; width: 48px; height: 48px; background: rgba(255,255,255,0.2); border-radius: 12px; line-height: 48px; text-align: center; }
  .logo-circle svg { vertical-align: middle; }
  .logo-text { color: #ffffff; font-size: 22px; font-weight: 700; margin: 12px 0 0; letter-spacing: -0.5px; }
  .body-content { padding: 32px; }
  .footer { text-align: center; padding: 24px 32px; border-top: 1px solid #f1f5f9; }
  .footer p { color: #94a3b8; font-size: 12px; margin: 4px 0; }
  .footer a { color: #94a3b8; text-decoration: underline; }
  .btn { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 16px; }
  .info-box { background: #eff6ff; border: 1px solid #dbeafe; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
  .info-label { color: #1e40af; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 8px; }
  .info-value { color: #1e3a5f; font-size: 24px; font-weight: 700; font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace; margin: 0; }
  .step-row { display: flex; align-items: flex-start; margin-bottom: 16px; }
  .step-num { display: inline-block; width: 28px; height: 28px; background: #1e40af; color: #fff; border-radius: 50%; text-align: center; line-height: 28px; font-size: 13px; font-weight: 700; flex-shrink: 0; }
  .step-text { margin-left: 12px; }
  .step-title { color: #1e293b; font-weight: 600; font-size: 15px; margin: 0; }
  .step-desc { color: #64748b; font-size: 13px; margin: 4px 0 0; }
  h1 { color: #0f172a; font-size: 24px; font-weight: 700; margin: 0 0 12px; }
  .subtitle { color: #64748b; font-size: 16px; margin: 0 0 24px; line-height: 1.5; }
  .divider { border: none; border-top: 1px solid #f1f5f9; margin: 24px 0; }
  .feature-grid { width: 100%; border-spacing: 8px; }
  .feature-cell { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; text-align: center; width: 33%; }
  .feature-icon { display: inline-block; width: 40px; height: 40px; background: #eff6ff; border-radius: 50%; line-height: 42px; text-align: center; margin-bottom: 8px; }
  .feature-title { color: #0f172a; font-size: 13px; font-weight: 600; margin: 0 0 4px; }
  .feature-desc { color: #94a3b8; font-size: 11px; margin: 0; }

  .amount-credit { color: #16a34a; font-size: 32px; font-weight: 700; margin: 0; }
  .amount-debit { color: #dc2626; font-size: 32px; font-weight: 700; margin: 0; }
  .detail-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
  .detail-table td { padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
  .detail-label { color: #94a3b8; font-weight: 500; }
  .detail-value { color: #1e293b; font-weight: 600; text-align: right; }
  .alert-box-green { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px 20px; margin: 20px 0; }
  .alert-box-green p { color: #166534; margin: 0; font-size: 14px; }
  .alert-box-red { background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 16px 20px; margin: 20px 0; }
  .alert-box-red p { color: #991b1b; margin: 0; font-size: 14px; }
`;

const logoSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;

const headerHtml = `
  <div class="header">
    <div class="logo-circle">${logoSvg}</div>
    <p class="logo-text">Vaultix</p>
  </div>
`;

const footerHtml = `
  <div class="footer">
    <p>&copy; ${new Date().getFullYear()} Vaultix Bank. All rights reserved.</p>
    <p>123 Financial District, New York, NY 10001</p>
    <p style="margin-top:8px;">
      <a href="https://vaultixbank.org/privacy">Privacy Policy</a> &bull;
      <a href="https://vaultixbank.org/terms">Terms of Service</a>
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
  <div class="container">
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
    <h1 style="text-align:center;">Verify Your Email</h1>
    <p class="subtitle" style="text-align:center;">
      Hi ${username}, welcome to Vaultix! Please verify your email address to activate your account.
    </p>
    <div style="text-align:center;margin:32px 0;">
      <a href="${verificationLink}" class="btn">Verify Email Address</a>
    </div>
    <hr class="divider" />
    <p style="color:#94a3b8;font-size:13px;text-align:center;line-height:1.6;">
      This link expires in 24 hours. If you didn't create a Vaultix account, you can safely ignore this email.
    </p>
    <p style="color:#cbd5e1;font-size:11px;text-align:center;margin-top:16px;word-break:break-all;">
      ${verificationLink}
    </p>
  `;
  return wrapEmail(content, 'Verify your Vaultix account email address');
};

export const buildWelcomeEmail = (username: string, accountNumber: string) => {
  const content = `
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-block;width:64px;height:64px;background:linear-gradient(135deg,#1e40af,#3b82f6);border-radius:50%;line-height:64px;">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" style="vertical-align:middle;"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
    </div>
    <h1 style="text-align:center;">Welcome to Vaultix, ${username}! 🎉</h1>
    <p class="subtitle" style="text-align:center;">
      Your email has been verified and your secure banking account is now fully active. We're thrilled to have you on board!
    </p>

    <div class="info-box">
      <p class="info-label">Your Account Number</p>
      <p class="info-value">${accountNumber}</p>
    </div>

    <table class="feature-grid" role="presentation">
      <tr>
        <td class="feature-cell">
          <div class="feature-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1e40af" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
          </div>
          <p class="feature-title">Secure Banking</p>
          <p class="feature-desc">256-bit encryption</p>
        </td>
        <td class="feature-cell">
          <div class="feature-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1e40af" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <p class="feature-title">24/7 Access</p>
          <p class="feature-desc">Bank anytime</p>
        </td>
        <td class="feature-cell">
          <div class="feature-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1e40af" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <p class="feature-title">FDIC Insured</p>
          <p class="feature-desc">Up to $250,000</p>
        </td>
      </tr>
    </table>

    <div style="text-align:center;margin:28px 0;">
      <a href="https://vaultixbank.org/login" class="btn">Go to Dashboard</a>
    </div>

    <hr class="divider" />

    <h2 style="color:#0f172a;font-size:18px;font-weight:600;margin:0 0 16px;">What's Next?</h2>

    <table role="presentation" style="width:100%;">
      <tr>
        <td style="width:36px;vertical-align:top;padding-bottom:16px;"><span class="step-num">1</span></td>
        <td style="padding-bottom:16px;">
          <p class="step-title">Complete your profile</p>
          <p class="step-desc">Add your preferences and security settings</p>
        </td>
      </tr>
      <tr>
        <td style="width:36px;vertical-align:top;padding-bottom:16px;"><span class="step-num">2</span></td>
        <td style="padding-bottom:16px;">
          <p class="step-title">Fund your account</p>
          <p class="step-desc">Make your first deposit and start growing</p>
        </td>
      </tr>
      <tr>
        <td style="width:36px;vertical-align:top;"><span class="step-num">3</span></td>
        <td>
          <p class="step-title">Send & receive money</p>
          <p class="step-desc">Enjoy fast, secure transfers worldwide</p>
        </td>
      </tr>
    </table>

    <div style="background:#f8fafc;border-radius:10px;padding:16px 20px;margin-top:24px;">
      <p style="color:#1e293b;font-weight:600;font-size:14px;margin:0 0 4px;">Need help getting started?</p>
      <p style="color:#64748b;font-size:13px;margin:0;">
        Our support team is here 24/7. <a href="https://vaultixbank.org/support" style="color:#2563eb;text-decoration:none;font-weight:600;">Contact Support &rarr;</a>
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
  const content = `
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-block;width:64px;height:64px;background:linear-gradient(135deg,#15803d,#22c55e);border-radius:50%;line-height:64px;">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" style="vertical-align:middle;"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </div>
    </div>
    <h1 style="text-align:center;">Money Received!</h1>
    <p class="subtitle" style="text-align:center;">
      Hi ${username}, your Vaultix account has been credited.
    </p>

    <div class="info-box" style="background:#f0fdf4;border-color:#bbf7d0;">
      <p class="info-label" style="color:#166534;">Amount Credited</p>
      <p class="amount-credit">+${currency} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
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
        <td class="detail-value" style="color:#16a34a;font-size:16px;">${currency} ${newBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
      </tr>
    </table>

    <div class="alert-box-green">
      <p>✅ This credit has been applied to your account and is available for use immediately.</p>
    </div>

    <div style="text-align:center;margin:24px 0;">
      <a href="https://vaultixbank.org/login" class="btn" style="background:linear-gradient(135deg,#15803d,#22c55e);">View Account</a>
    </div>

    <hr class="divider" />
    <p style="color:#94a3b8;font-size:12px;text-align:center;">
      If you don't recognize this transaction, please <a href="https://vaultixbank.org/support" style="color:#2563eb;">contact support</a> immediately.
    </p>
  `;
  return wrapEmail(content, `You received ${currency} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} in your Vaultix account`);
};

export const buildDebitNotificationEmail = (
  username: string,
  amount: number,
  currency: string,
  newBalance: number,
  transactionType: string,
  transactionId: string,
  transactionDate: string
) => {
  const content = `
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-block;width:64px;height:64px;background:linear-gradient(135deg,#dc2626,#f87171);border-radius:50%;line-height:64px;">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" style="vertical-align:middle;"><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </div>
    </div>
    <h1 style="text-align:center;">Money Sent</h1>
    <p class="subtitle" style="text-align:center;">
      Hi ${username}, a debit transaction has been processed on your Vaultix account.
    </p>

    <div class="info-box" style="background:#fef2f2;border-color:#fecaca;">
      <p class="info-label" style="color:#991b1b;">Amount Debited</p>
      <p class="amount-debit">-${currency} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
    </div>

    <table class="detail-table">
      <tr>
        <td class="detail-label">Transaction Type</td>
        <td class="detail-value">${transactionType}</td>
      </tr>
      <tr>
        <td class="detail-label">Transaction ID</td>
        <td class="detail-value" style="font-family:'SF Mono',Monaco,monospace;font-size:12px;">${transactionId}</td>
      </tr>
      <tr>
        <td class="detail-label">Date &amp; Time</td>
        <td class="detail-value">${transactionDate}</td>
      </tr>
      <tr>
        <td class="detail-label">Remaining Balance</td>
        <td class="detail-value" style="font-size:16px;">${currency} ${newBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
      </tr>
    </table>

    <div class="alert-box-red">
      <p>🔔 This debit has been processed from your account.</p>
    </div>

    <div style="text-align:center;margin:24px 0;">
      <a href="https://vaultixbank.org/login" class="btn" style="background:linear-gradient(135deg,#dc2626,#f87171);">View Transaction</a>
    </div>

    <hr class="divider" />
    <p style="color:#94a3b8;font-size:12px;text-align:center;">
      If you didn't authorize this transaction, please <a href="https://vaultixbank.org/support" style="color:#dc2626;font-weight:600;">contact support immediately</a>.
    </p>
  `;
  return wrapEmail(content, `Debit of ${currency} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} from your Vaultix account`);
};

// ─── Send Functions ─────────────────────────────────────────────────────────

export const sendVerificationEmail = async (to: string, username: string, verificationLink: string) => {
  const html = buildVerificationEmail(username, verificationLink);
  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: 'Verify Your Vaultix Account',
    html,
  });
  if (error) {
    console.error('[EMAIL] Verification email failed:', error);
    throw new Error('Failed to send verification email.');
  }
};

export const sendWelcomeEmail = async (to: string, username: string, accountNumber: string) => {
  const html = buildWelcomeEmail(username, accountNumber);
  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: 'Welcome to Vaultix Bank! 🎉',
    html,
  });
  if (error) {
    console.error('[EMAIL] Welcome email failed:', error);
    throw new Error('Failed to send welcome email.');
  }
  console.log(`[EMAIL] Welcome email sent to ${to}`);
};

export const sendCreditNotification = async (
  to: string,
  username: string,
  amount: number,
  currency: string,
  newBalance: number,
  description: string
) => {
  const transactionDate = new Date().toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  const html = buildCreditNotificationEmail(username, amount, currency, newBalance, description, transactionDate);
  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Credit Alert: +${currency} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
    html,
  });
  if (error) {
    console.error('[EMAIL] Credit notification failed:', error);
  }
};

export const sendDebitNotification = async (
  to: string,
  username: string,
  amount: number,
  currency: string,
  newBalance: number,
  transactionType: string,
  transactionId: string
) => {
  const transactionDate = new Date().toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  const html = buildDebitNotificationEmail(username, amount, currency, newBalance, transactionType, transactionId, transactionDate);
  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Debit Alert: -${currency} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
    html,
  });
  if (error) {
    console.error('[EMAIL] Debit notification failed:', error);
  }
};
