import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'node:crypto';
import { Brackets, DataSource, Repository } from 'typeorm';
import { escapeLike, isDuplicateEntry } from '../common/db.util';
import type { CreateEmployeePayload, EmployeeView, ListEmployeesPayload,UpdateEmployeePayload, SetStatusPayload } from '../common/identity.contract';
import { normalizePaging, type Paginated } from '../common/pagination';
import { Role } from '../common/role.enum';
import { rpcError } from '../common/rpc';
import { Account } from '../database/entities/account.entity';
import { Employee } from '../database/entities/employee.entity';
import { PasswordService } from './password.service';

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

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee) private readonly employees: Repository<Employee>,
    @InjectRepository(Account) private readonly accounts: Repository<Account>,
    private readonly dataSource: DataSource,
    private readonly passwords: PasswordService,
  ) {}

  async create(dto: CreateEmployeePayload): Promise<EmployeeView> {
    const [noTaken, emailTaken] = await Promise.all([
      this.employees.existsBy({ employeeNo: dto.employeeNo }),
      this.accounts.existsBy({ email: dto.email }),
    ]);
    if (noTaken) throw rpcError(409, 'Nomor karyawan sudah dipakai');
    if (emailTaken) throw rpcError(409, 'Email sudah terdaftar');

    const id = randomUUID();
    const passwordHash = await this.passwords.hash(dto.password);

    try {
      // employee + account harus masuk bersamaan, kalau salah satu gagal dua-duanya batal
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
      // dua request bersamaan lolos pengecekan di atas, unique index di DB yang menang
      if (isDuplicateEntry(e)) throw rpcError(409, 'Nomor karyawan atau email sudah terdaftar');
      throw e;
    }

    const account = await this.accounts.findOneOrFail({ where: { employeeId: id }, relations: { employee: true } });
    return toView(account);
  }

  async list(query: ListEmployeesPayload): Promise<Paginated<EmployeeView>> {
    const { page, limit } = normalizePaging(query.page, query.limit);
    const qb = this.accounts
      .createQueryBuilder('a')
      .innerJoinAndSelect('a.employee', 'e')
      .orderBy('e.createdAt', 'DESC')
      .addOrderBy('e.id', 'ASC');

    if (query.q) {
      qb.where(
        new Brackets((w) =>
          w
            .where('e.fullName LIKE :q')
            .orWhere('e.employeeNo LIKE :q')
            .orWhere('e.department LIKE :q')
            .orWhere('e.jobTitle LIKE :q')
            .orWhere('a.email LIKE :q'),
        ),
      ).setParameter('q', `%${escapeLike(query.q)}%`);
    }

    const [rows, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { items: rows.map(toView), total, page, limit };
  }

  async update({ id, ...dto }: UpdateEmployeePayload): Promise<EmployeeView> {
    const current = await this.findAccount(id);

    const profile: Partial<Pick<Employee, 'employeeNo' | 'fullName' | 'department' | 'jobTitle'>> = {};
    if (dto.employeeNo !== undefined && dto.employeeNo !== current.employee.employeeNo) profile.employeeNo = dto.employeeNo;
    if (dto.fullName !== undefined) profile.fullName = dto.fullName;
    if (dto.department !== undefined) profile.department = dto.department;
    if (dto.jobTitle !== undefined) profile.jobTitle = dto.jobTitle;

    const email = dto.email !== undefined && dto.email !== current.email ? dto.email : undefined;
    const passwordHash = dto.password ? await this.passwords.hash(dto.password) : undefined;

    if (profile.employeeNo && (await this.employees.existsBy({ employeeNo: profile.employeeNo }))) {
      throw rpcError(409, 'Nomor karyawan sudah dipakai');
    }
    if (email && (await this.accounts.existsBy({ email }))) throw rpcError(409, 'Email sudah terdaftar');

    try {
      await this.dataSource.transaction(async (m) => {
        if (Object.keys(profile).length) await m.update(Employee, { id }, profile);
        if (email || passwordHash) {
          await m.update(Account, { employeeId: id }, { ...(email ? { email } : {}), ...(passwordHash ? { passwordHash } : {}) });
        }
        // password diganti: sesi lama dicabut
        if (passwordHash) await m.increment(Account, { employeeId: id }, 'authVersion', 1);
      });
    } catch (e) {
      // dua request bersamaan lolos pengecekan di atas, unique index di DB yang menang
      if (isDuplicateEntry(e)) throw rpcError(409, 'Nomor karyawan atau email sudah terdaftar');
      throw e;
    }
    return toView(await this.findAccount(id));
  }

  async setStatus(actorId: string, { id, active }: SetStatusPayload): Promise<EmployeeView> {
    if (id === actorId && !active) throw rpcError(409, 'Anda tidak dapat menonaktifkan akun sendiri');
    await this.findAccount(id); // 404 kalau tidak ada

    await this.accounts
      .createQueryBuilder()
      .update(Account)
      // menonaktifkan juga menaikkan authVersion, supaya token lama tidak hidup lagi saat akun diaktifkan kembali
      .set(active ? { active } : { active, authVersion: () => 'authVersion + 1' })
      .where('employeeId = :id', { id })
      .execute();

    return toView(await this.findAccount(id));
  }

  private async findAccount(id: string): Promise<Account> {
    const account = await this.accounts.findOne({ where: { employeeId: id }, relations: { employee: true } });
    if (!account) throw rpcError(404, 'Karyawan tidak ditemukan');
    return account;
  }

  
}