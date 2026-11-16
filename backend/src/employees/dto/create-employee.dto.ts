import { Transform } from 'class-transformer';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { Role } from '../../common/role.enum';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

export class CreateEmployeeDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  @Matches(/^[A-Za-z0-9._-]+$/, { message: 'Nomor karyawan hanya boleh huruf, angka, titik, strip, dan underscore' })
  employeeNo!: string;

  @Transform(trim) @IsString() @IsNotEmpty() @MaxLength(100) fullName!: string;
  @Transform(trim) @IsString() @IsNotEmpty() @MaxLength(80) department!: string;
  @Transform(trim) @IsString() @IsNotEmpty() @MaxLength(80) jobTitle!: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @IsString()
  @MinLength(8, { message: 'Password minimal 8 karakter' })
  @MaxLength(128)
  password!: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}