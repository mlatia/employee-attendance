import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import type { AuthUser } from '../auth/auth.types';
import type { LoginPayload, LoginResult, SessionPayload } from '../common/identity.contract';
import { rpcError } from '../common/rpc';
import { Account } from '../database/entities/account.entity';
import { PasswordService } from './password.service';

const toUser = (a: Account): AuthUser => ({
  id: a.employeeId,
  email: a.email,
  role: a.role,
  fullName: a.employee.fullName,
  employeeNo: a.employee.employeeNo,
  department: a.employee.department,
});

@Injectable()
export class IdentityService {
  constructor(
    @InjectRepository(Account) private readonly accounts: Repository<Account>,
    private readonly passwords: PasswordService,
  ) {}

  async login({ email, password }: LoginPayload): Promise<LoginResult> {
    const account = await this.find({ email: email.trim().toLowerCase() });
    const ok = await this.passwords.verify(password, account?.passwordHash);
    if (!account || !ok || !account.active) throw rpcError(401, 'Email atau password salah');
    return { user: toUser(account), authVersion: account.authVersion };
  }

  /** Dipanggil gateway di tiap request: akun nonaktif atau authVersion berubah = sesi dicabut. */
  async session({ sub, av }: SessionPayload): Promise<AuthUser> {
    const account = await this.find({ employeeId: sub });
    if (!account || !account.active || account.authVersion !== av) throw rpcError(401, 'Sesi tidak valid');
    return toUser(account);
  }

  async revoke(employeeId: string): Promise<{ ok: true }> {
    await this.accounts.increment({ employeeId }, 'authVersion', 1);
    return { ok: true }; // jangan return undefined: client TCP menganggapnya respons kosong
  }

  private find(where: FindOptionsWhere<Account>) {
    return this.accounts.findOne({ where, relations: { employee: true } });
  }
}