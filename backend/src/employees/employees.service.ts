import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'node:crypto';
import { Brackets, DataSource, Repository } from 'typeorm';
import { PasswordService } from '../auth/password.service';
import { Role } from '../common/role.enum';
import { Account } from '../database/entities/account.entity';
import { Employee } from '../database/entities/employee.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { ListEmployeesQuery } from './dto/list-employees.query';

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
      if (isDuplicate(e)) throw new ConflictException('Nomor karyawan atau email sudah terdaftar');
      throw e;
    }

    const account = await this.accounts.findOneOrFail({ where: { employeeId: id }, relations: { employee: true } });
    return toView(account);
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
}