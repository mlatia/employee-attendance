import 'reflect-metadata';
import { randomUUID } from 'node:crypto';
import { DataSource } from 'typeorm';
import { PasswordService } from '../auth/password.service';
import { Role } from '../common/role.enum';
import { dbOptions } from './data-source';
import { Account } from './entities/account.entity';
import { Employee } from './entities/employee.entity';

async function main() {
  process.loadEnvFile('.env');
  const email = process.env.SEED_HRD_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_HRD_PASSWORD;
  if (!email || !password || password.length < 12) {
    throw new Error('Isi SEED_HRD_EMAIL dan SEED_HRD_PASSWORD (min 12 karakter) di .env');
  }

  const ds = await new DataSource(dbOptions(process.env)).initialize();
  try {
    if (await ds.getRepository(Account).existsBy({ email })) {
      console.log('Akun HRD sudah ada, dilewati.');
      return;
    }
    const passwordHash = await new PasswordService().hash(password);
    await ds.transaction(async (m) => {
      const id = randomUUID();
      await m.insert(Employee, { id, employeeNo: 'HRD001', fullName: 'Admin HRD', department: 'Human Resources', jobTitle: 'HRD' });
      await m.insert(Account, { employeeId: id, email, passwordHash, role: Role.HRD });
      await m.insert(Employee, {
        id,
          employeeNo: 'HRD001',
          fullName: 'Admin HRD',
          department: 'Human Resources',
          jobTitle: 'HRD'
        });

        await m.insert(Account, {
          employeeId: id,
          email,
          passwordHash,
          role: Role.HRD
        });
    });
    console.log(`Akun HRD dibuat: ${email}`);
  } finally {
    await ds.destroy();
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});