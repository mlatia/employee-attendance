import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'node:crypto';
import { Brackets, DataSource, Repository } from 'typeorm';
import type { AuthUser } from '../auth/auth.types';
import { PasswordService } from '../auth/password.service';
import { Role } from '../common/role.enum';
import { Account } from '../database/entities/account.entity';
import { Employee } from '../database/entities/employee.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { ListEmployeesQuery } from './dto/list-employees.query';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

export interface EmployeeView {
  id: string;
  employeeNo: string;
  fullName: string;
  department: string;
  jobTitle: string;
  email: string;
  role: Role;
  active: boolean;
  createdAt: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

const toView = (a: Account): EmployeeView => ({
  id: a.employeeId,
  employeeNo: a.employee.employeeNo,
  fullName: a.employee.fullName,
  department: a.employee.department,
  jobTitle: a.employee.jobTitle,
  email: a.email,
  role: a.role,
  active: a.active,
  createdAt: a.employee.createdAt.toISOString(),
});

const escapeLike = (s: string) => s.replace(/[\\%_]/g, '\\$&');
const isDuplicate = (e: unknown) => typeof e === 'object' && e !== null && (e as { code?: string }).code === 'ER_DUP_ENTRY';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee) private readonly employees: Repository<Employee>,
    @InjectRepository(Account) private readonly accounts: Repository<Account>,
    private readonly dataSource: DataSource,
    private readonly passwords: PasswordService,
  ) {}

  async create(dto: CreateEmployeeDto): Promise<EmployeeView> {
    const [noTaken, emailTaken] = await Promise.all([
      this.employees.existsBy({ employeeNo: dto.employeeNo }),
      this.accounts.existsBy({ email: dto.email }),
    ]);
    if (noTaken) throw new ConflictException('Nomor karyawan sudah dipakai');
    if (emailTaken) throw new ConflictException('Email sudah terdaftar');

    const id = randomUUID();
    const passwordHash = await this.passwords.hash(dto.password);

    try {
      await this.dataSource.transaction(async (m) => {
        await m.insert(Employee, {
          id,
          employeeNo: dto.employeeNo,
          fullName: dto.fullName,
          department: dto.department,
          jobTitle: dto.jobTitle,
        });
        await m.insert(Account, { employeeId: id, email: dto.email, passwordHash, role: dto.role ?? Role.EMPLOYEE });
      });
    } catch (e) {
      if (isDuplicate(e)) throw new ConflictException('Nomor karyawan atau email sudah terdaftar');
      throw e;
    }

    return toView(await this.findAccount(id));
  }

  async list({ q, page, limit }: ListEmployeesQuery): Promise<Paginated<EmployeeView>> {
    const qb = this.accounts
      .createQueryBuilder('a')
      .innerJoinAndSelect('a.employee', 'e')
      .orderBy('e.createdAt', 'DESC')
      .addOrderBy('e.id', 'ASC');

    if (q) {
      qb.where(
        new Brackets((w) =>
          w
            .where('e.fullName LIKE :q')
            .orWhere('e.employeeNo LIKE :q')
            .orWhere('e.department LIKE :q')
            .orWhere('e.jobTitle LIKE :q')
            .orWhere('a.email LIKE :q'),
        ),
      ).setParameter('q', `%${escapeLike(q)}%`);
    }

    const [rows, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { items: rows.map(toView), total, page, limit };
  }

  async update(id: string, dto: UpdateEmployeeDto, actor: AuthUser): Promise<EmployeeView> {
    const account = await this.findAccount(id);
    const isSelf = id === actor.id;

    if (isSelf && dto.role !== undefined && dto.role !== account.role) {
      throw new ForbiddenException('Role akun sendiri tidak dapat diubah');
    }
    if (isSelf && dto.password !== undefined) {
      throw new ForbiddenException('Password akun sendiri tidak dapat direset lewat menu ini');
    }
    if (dto.email !== undefined && dto.email !== account.email && (await this.accounts.existsBy({ email: dto.email }))) {
      throw new ConflictException('Email sudah terdaftar');
    }

    const employeePatch: Partial<Pick<Employee, 'fullName' | 'department' | 'jobTitle'>> = {};
    if (dto.fullName !== undefined) employeePatch.fullName = dto.fullName;
    if (dto.department !== undefined) employeePatch.department = dto.department;
    if (dto.jobTitle !== undefined) employeePatch.jobTitle = dto.jobTitle;

    const accountPatch: Partial<Pick<Account, 'email' | 'role' | 'passwordHash'>> = {};
    if (dto.email !== undefined) accountPatch.email = dto.email;
    if (dto.role !== undefined) accountPatch.role = dto.role;
    if (dto.password !== undefined) accountPatch.passwordHash = await this.passwords.hash(dto.password);

    try {
      await this.dataSource.transaction(async (m) => {
        if (Object.keys(employeePatch).length) await m.update(Employee, { id }, employeePatch);
        if (Object.keys(accountPatch).length) await m.update(Account, { employeeId: id }, accountPatch);
        // password direset: sesi lama harus mati
        if (dto.password !== undefined) await m.increment(Account, { employeeId: id }, 'authVersion', 1);
      });
    } catch (e) {
      if (isDuplicate(e)) throw new ConflictException('Email sudah terdaftar');
      throw e;
    }

    return toView(await this.findAccount(id));
  }

  async setStatus(id: string, active: boolean, actor: AuthUser): Promise<EmployeeView> {
    if (id === actor.id && !active) throw new ForbiddenException('Tidak dapat menonaktifkan akun sendiri');

    const account = await this.findAccount(id);
    if (account.active === active) return toView(account);

    await this.dataSource.transaction(async (m) => {
      await m.update(Account, { employeeId: id }, { active });
      await m.increment(Account, { employeeId: id }, 'authVersion', 1);
    });

    return toView(await this.findAccount(id));
  }

  private async findAccount(id: string): Promise<Account> {
    const account = await this.accounts.findOne({ where: { employeeId: id }, relations: { employee: true } });
    if (!account) throw new NotFoundException('Karyawan tidak ditemukan');
    return account;
  }
}