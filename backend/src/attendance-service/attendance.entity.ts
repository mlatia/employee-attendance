import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity('attendances')
@Index('uq_attendance_day', ['employeeId', 'workDate'], { unique: true })
@Index('uq_attendance_idempotency', ['employeeId', 'idempotencyKey'], { unique: true })
@Index('idx_attendance_date', ['workDate', 'submittedAt', 'id'])
export class Attendance {
  @PrimaryColumn({ type: 'char', length: 36 }) id!: string;
  @Column({ type: 'char', length: 36 }) employeeId!: string;
  @Column({ type: 'date' }) workDate!: string;
  @Column({ type: 'datetime', precision: 3 }) submittedAt!: Date;
  @Column({ type: 'varchar', length: 100 }) fullName!: string;
  @Column({ type: 'varchar', length: 30 }) employeeNo!: string;
  @Column({ type: 'varchar', length: 80 }) department!: string;
  @Column({ type: 'varchar', length: 500, default: '' }) note!: string;
  @Column({ type: 'varchar', length: 50 }) photoFile!: string;
  @Column({ type: 'char', length: 36 }) idempotencyKey!: string;
  @Column({ type: 'char', length: 64 }) requestHash!: string;
}