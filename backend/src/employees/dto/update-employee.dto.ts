import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateEmployeeDto } from './create-employee.dto';

/** Semua field opsional, aturan validasinya sama dengan tambah karyawan. Role tidak bisa diubah. */
export class UpdateEmployeeDto extends PartialType(OmitType(CreateEmployeeDto, ['role'] as const)) {}