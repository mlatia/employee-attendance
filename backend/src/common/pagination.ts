import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export class PageQuery {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page: number = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit: number = 10;
}

export const normalizePaging = (page: number, limit: number) => ({
  page: Math.max(1, Math.trunc(page) || 1),
  limit: Math.min(100, Math.max(1, Math.trunc(limit) || 10)),
});