const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const prisma = require('../src/helpers/prisma');

async function main() {
  const username = 'kikensbatara';
  const email = 'kikensbatara@gateway.local';
  const rawPassword = 'cocodark';

  // Cek apakah user sudah ada
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ username }, { email }]
    }
  });

  const hashedPassword = await bcrypt.hash(rawPassword, 10);
  const apiKey = `gw_${crypto.randomBytes(24).toString('hex')}`;

  if (existingUser) {
    // Update password dan role ke ADMIN
    const updated = await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        password: hashedPassword,
        role: 'ADMIN',
        status: 'ACTIVE'
      }
    });
    console.log(`✅ User ${updated.username} berhasil diperbarui dengan role ADMIN!`);
    console.log(`🔑 API Key: ${updated.apiKey}`);
    return;
  }

  // Buat user baru
  const user = await prisma.user.create({
    data: {
      name: 'Kiken S Batara',
      username,
      email,
      password: hashedPassword,
      appName: 'Master Gateway Admin',
      purpose: 'Administrator Sistem Gateway SIASN',
      allowedDomains: '*',
      apiKey,
      role: 'ADMIN',
      status: 'ACTIVE'
    }
  });

  console.log('==================================================');
  console.log('🎉 Akun Master Admin berhasil dibuat:');
  console.log(`👤 Name     : ${user.name}`);
  console.log(`🆔 Username : ${user.username}`);
  console.log(`📧 Email    : ${user.email}`);
  console.log(`🏷️ Role     : ${user.role}`);
  console.log(`🔑 API Key  : ${user.apiKey}`);
  console.log('==================================================');
}

main()
  .catch((e) => {
    console.error('❌ Gagal membuat akun seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
