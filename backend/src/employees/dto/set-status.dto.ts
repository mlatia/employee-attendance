import { IsBoolean } from 'class-validator';

export class SetStatusDto {
  @IsBoolean()
  active!: boolean;
}