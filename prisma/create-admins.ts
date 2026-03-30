import 'dotenv/config';
import { PrismaClient } from '../lib/prisma-generated/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import bcrypt from 'bcryptjs';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

const adapterFactory = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter: adapterFactory });

async function main() {
  const adminUsers = [
    { email: 'rose@enchipai.com', name: 'Rose', password: 'Enchipai2026!' },
    { email: 'sam@enchipai.com', name: 'Sam', password: 'Enchipai2026!' },
  ];

  for (const admin of adminUsers) {
    const hashedPassword = await bcrypt.hash(admin.password, 12);
    const user = await prisma.user.upsert({
      where: { email: admin.email },
      update: { role: 'ADMIN' },
      create: {
        email: admin.email,
        name: admin.name,
        password: hashedPassword,
        role: 'ADMIN',
        emailVerified: new Date(),
      },
    });
    console.log(`✅ Admin created: ${user.email} (${user.role})`);
  }

  console.log('\n🔑 Default password for both: Enchipai2026!');
  console.log('⚠️  Please change passwords after first login.');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
