import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from '../database/entities/account.entity';
import { AuthUser, JwtPayload } from './auth.types';
import { LoginDto } from './dto/login.dto';
import { PasswordService } from './password.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Account) private readonly accounts: Repository<Account>,
    private readonly passwords: PasswordService,
    private readonly jwt: JwtService,
  ) {}

  async login({ email, password }: LoginDto): Promise<{ token: string; user: AuthUser }> {
    const account = await this.accounts.findOne({ where: { email }, relations: { employee: true } });
    const ok = await this.passwords.verify(password, account?.passwordHash);
    if (!account || !ok || !account.active) {
      throw new UnauthorizedException('Email atau password salah');
    }
    const payload: JwtPayload = { sub: account.employeeId, av: account.authVersion };
    return { token: await this.jwt.signAsync(payload), user: this.toUser(account) };
  }

  /** Dipanggil guard di tiap request: akun nonaktif / authVersion berubah = sesi dicabut. */
  async session({ sub, av }: JwtPayload): Promise<AuthUser> {
    const account = await this.accounts.findOne({ where: { employeeId: sub }, relations: { employee: true } });
    if (!account || !account.active || account.authVersion !== av) throw new UnauthorizedException();
    return this.toUser(account);
  }

  async revokeSessions(employeeId: string): Promise<void> {
    await this.accounts.increment({ employeeId }, 'authVersion', 1);
  }

  private toUser(a: Account): AuthUser {
    return { id: a.employeeId, email: a.email, role: a.role, fullName: a.employee.fullName, employeeNo: a.employee.employeeNo };
  }
}