/**
 * One-off: email every unverified user a fresh verification link, with an apology
 * for the email outage that stopped their original verification email arriving.
 *
 *   cd server
 *   # 1. Dry run (default) — lists who would be emailed, sends nothing, changes nothing
 *   npx ts-node scripts/sendVerificationReminders.ts [--since=2026-10-28] [--emails=a@x.com,b@y.com]
 *   # 2. Preview the email — touches nothing (sample data, dummy link)
 *   npx ts-node scripts/sendVerificationReminders.ts --preview=preview.html
 *   npx ts-node scripts/sendVerificationReminders.ts --test-to=you@example.com
 *   # 3. Send for real
 *   npx ts-node scripts/sendVerificationReminders.ts --send [--since=...] [--emails=...]
 *
 * Needs DATABASE_URL, RESEND_API_KEY and CLIENT_URL (the website — verification and
 * sign-in links point there) set to production values. Deploy the website's /verify-email
 * page before sending, or the links will open a blank page.
 */
import 'dotenv/config';
import crypto from 'crypto';
import fs from 'fs';
import { prisma } from '../src/config/database';
import { buildVerificationReminderEmail, sendVerificationReminderEmail } from '../src/utils/email';
import { buildVerificationLink } from '../src/utils/helpers';

const LINK_VALID_DAYS = 7;
const DELAY_BETWEEN_EMAILS_MS = 600; // stay under Resend's default rate limit (2 requests/second)

const arg = (name: string) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split('=').slice(1).join('=');
const send = process.argv.includes('--send');
const since = arg('since');
const onlyEmails = arg('emails')?.split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
const previewFile = arg('preview');
const testTo = arg('test-to');

const clientUrl = process.env.CLIENT_URL || '';
const loginUrl = `${clientUrl}/login`;

// Placeholder data for previews and test sends — the link is deliberately not a real token
const sample = ['Jane Doe', 'janedoe', buildVerificationLink('SAMPLE-LINK'), loginUrl] as const;

async function main() {
  if (previewFile) {
    fs.writeFileSync(previewFile, buildVerificationReminderEmail(...sample));
    console.log(`Preview written to ${previewFile}`);
    return;
  }

  if (testTo) {
    await sendVerificationReminderEmail(testTo, ...sample);
    console.log(`Sample sent to ${testTo} (dummy link — the button will show "invalid link").`);
    return;
  }

  if ((send || testTo) && !/^https:\/\//.test(clientUrl)) {
    throw new Error(`CLIENT_URL must be the production https website URL before sending (got "${clientUrl}").`);
  }
  if (since && Number.isNaN(Date.parse(since))) throw new Error(`--since must be a date like 2026-10-28 (got "${since}").`);

  const users = await prisma.user.findMany({
    where: {
      emailVerified: false,
      ...(since && { createdAt: { gte: new Date(since) } }),
      ...(onlyEmails && { emailAddress: { in: onlyEmails } }),
    },
    select: { id: true, fullName: true, username: true, emailAddress: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });

  const host = (process.env.DATABASE_URL || '').replace(/^.*@([^:/]+).*$/, '$1');
  console.log(`\nDatabase: ${host}\n${users.length} unverified user(s)${since ? ` created since ${since}` : ''}:\n`);
  for (const u of users) {
    console.log(`  ${u.createdAt.toISOString().slice(0, 16).replace('T', ' ')}  ${u.emailAddress}  (${u.username})`);
  }
  if (onlyEmails) {
    const found = new Set(users.map((u) => u.emailAddress));
    const missing = onlyEmails.filter((e) => !found.has(e));
    if (missing.length) console.log(`\n  Not found or already verified: ${missing.join(', ')}`);
  }

  if (!send) {
    console.log('\nDry run — nothing was sent or changed. Re-run with --send to email these users.');
    return;
  }

  let sent = 0;
  const failed: string[] = [];
  for (const u of users) {
    const token = crypto.randomBytes(32).toString('hex');
    await prisma.user.update({
      where: { id: u.id },
      data: {
        emailVerificationToken: token,
        emailVerificationExpiry: new Date(Date.now() + LINK_VALID_DAYS * 24 * 60 * 60 * 1000),
      },
    });
    try {
      await sendVerificationReminderEmail(u.emailAddress, u.fullName, u.username, buildVerificationLink(token), loginUrl);
      sent++;
      console.log(`  ✅ ${u.emailAddress}`);
    } catch (err) {
      failed.push(u.emailAddress);
      console.log(`  ❌ ${u.emailAddress}: ${err instanceof Error ? err.message : err}`);
    }
    await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_EMAILS_MS));
  }

  console.log(`\nSent ${sent} of ${users.length}.${failed.length ? ` Failed: ${failed.join(', ')}` : ''}`);
}

main()
  .catch((err) => {
    console.error(`\n❌ ${err instanceof Error ? err.message : err}`);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
