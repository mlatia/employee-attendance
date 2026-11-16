import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { Role } from '../../common/role.enum';
import { Employee } from './employee.entity';

@Entity('accounts')
export class Account {
  @PrimaryColumn({ type: 'char', length: 36 }) employeeId!: string;
  @Column({ type: 'varchar', length: 254, unique: true }) email!: string;
  @Column({ type: 'varchar', length: 200 }) passwordHash!: string;
  @Column({ type: 'enum', enum: Role, default: Role.EMPLOYEE }) role!: Role;
  @Column({ type: 'boolean', default: true }) active!: boolean;
  @Column({ type: 'int', default: 1 }) authVersion!: number;

  @OneToOne(() => Employee)
  @JoinColumn({ name: 'employeeId' })
  employee!: Employee;
}