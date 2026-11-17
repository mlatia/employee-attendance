import { Transform } from 'class-transformer';
import { IsISO8601, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { PageQuery } from '../../common/pagination';

export class ListAttendanceQuery extends PageQuery {
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Format tanggal harus YYYY-MM-DD' })
  @IsISO8601({ strict: true }, { message: 'Tanggal tidak valid' })
  date?: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MaxLength(100)
  q?: string;
}