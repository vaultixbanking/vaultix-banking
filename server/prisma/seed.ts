import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ─── Seed Admin ───────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('Mercy139556$$!!', 10);

  const admin = await prisma.admin.upsert({
    where: { username: 'admin' },
    update: { password: adminPassword },
    create: {
      username: 'admin',
      email: 'admin@vaultix.com',
      password: adminPassword,
      role: 'superadmin',
    },
  });

  console.log(`✅ Admin seeded: ${admin.username} (${admin.email})`);

  // ─── Seed Default Deposit Methods ─────────────────────────────────────────
  const depositMethods = [
    { method: 'btc', details: '' },
    { method: 'eth', details: '' },
    { method: 'ltc', details: '' },
    { method: 'usdt', details: '' },
  ];

  for (const dm of depositMethods) {
    await prisma.depositMethod.upsert({
      where: { method: dm.method },
      update: {},
      create: dm,
    });
  }

  console.log('✅ Default deposit methods seeded');
  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
