/**
 * Reset an admin's password (or create an admin) directly in the database.
 *
 *   cd server
 *   DATABASE_URL="<database url>" npx ts-node scripts/resetAdminPassword.ts
 *
 * Run it in your own terminal: the new password is typed with hidden input,
 * so it never ends up in shell history, logs, or chat transcripts.
 * Note: ADMIN_USERNAME / ADMIN_PASSWORD in .env are NOT used for admin login —
 * only the `admins` table is.
 */
import 'dotenv/config';
import readline from 'readline';
import bcrypt from 'bcryptjs';
import { prisma } from '../src/config/database';

function ask(question: string, hidden = false): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      if (hidden) process.stdout.write('\n');
      resolve(answer);
    });
    if (hidden) {
      // The prompt is already printed — stop echoing keystrokes
      (rl as unknown as { _writeToOutput: (s: string) => void })._writeToOutput = () => {};
    }
  });
}

async function main() {
  const host = (process.env.DATABASE_URL || '').replace(/^.*@([^:/]+).*$/, '$1') || '(DATABASE_URL not set)';
  console.log(`\nDatabase host: ${host}\n`);

  const admins = await prisma.admin.findMany({ select: { username: true, email: true, updatedAt: true } });
  if (admins.length === 0) {
    console.log('No admin accounts exist in this database.');
  } else {
    console.log('Existing admin accounts (log in with this exact username — it is case-sensitive):');
    for (const a of admins) console.log(`  • ${a.username}  <${a.email}>  last changed ${a.updatedAt.toISOString().slice(0, 10)}`);
  }
  console.log('');

  const defaultName = admins.length === 1 ? admins[0].username : '';
  const username = (await ask(`Admin username${defaultName ? ` [${defaultName}]` : ''}: `)).trim() || defaultName;
  if (!username) throw new Error('A username is required.');

  const existing = await prisma.admin.findUnique({ where: { username } });
  let email = existing?.email;
  if (!existing) {
    const create = (await ask(`No admin named "${username}". Create it? (yes/no): `)).trim().toLowerCase();
    if (create !== 'yes') return console.log('Cancelled — nothing changed.');
    email = (await ask('Admin email: ')).trim();
    if (!email) throw new Error('An email is required to create an admin.');
  }

  const password = await ask('New password (hidden, min 10 characters): ', true);
  if (password.length < 10) throw new Error('Password must be at least 10 characters.');
  if ((await ask('Repeat new password: ', true)) !== password) throw new Error('Passwords do not match.');

  const confirm = (await ask(`${existing ? 'Reset password for' : 'Create'} admin "${username}" on ${host}? (yes/no): `)).trim().toLowerCase();
  if (confirm !== 'yes') return console.log('Cancelled — nothing changed.');

  const hashed = await bcrypt.hash(password, 10);
  await prisma.admin.upsert({
    where: { username },
    update: { password: hashed },
    create: { username, email: email!, password: hashed, role: 'superadmin' },
  });

  console.log(`\n✅ Done. Sign in at /admin with username "${username}" and your new password.`);
}

main()
  .catch((err) => {
    console.error(`\n❌ ${err instanceof Error ? err.message : err}`);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
