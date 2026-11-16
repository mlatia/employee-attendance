import { Transform } from 'class-transformer';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { Role } from '../../common/role.enum';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

export class UpdateEmployeeDto {
  @IsOptional() @Transform(trim) @IsString() @IsNotEmpty() @MaxLength(100) fullName?: string;
  @IsOptional() @Transform(trim) @IsString() @IsNotEmpty() @MaxLength(80) department?: string;
  @IsOptional() @Transform(trim) @IsString() @IsNotEmpty() @MaxLength(80) jobTitle?: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail()
  @MaxLength(254)
  email?: string;

  @IsOptional() @IsEnum(Role) role?: Role;

  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'Password minimal 8 karakter' })
  @MaxLength(128)
  password?: string;
}