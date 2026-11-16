import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('employees')
export class Employee {
  @PrimaryColumn({ type: 'char', length: 36 }) id!: string;
  @Column({ type: 'varchar', length: 30, unique: true }) employeeNo!: string;
  @Column({ type: 'varchar', length: 100 }) fullName!: string;
  @Column({ type: 'varchar', length: 80 }) department!: string;
  @Column({ type: 'varchar', length: 80 }) jobTitle!: string;
  @CreateDateColumn({ type: 'datetime', precision: 3 }) createdAt!: Date;
  @UpdateDateColumn({ type: 'datetime', precision: 3 }) updatedAt!: Date;
}