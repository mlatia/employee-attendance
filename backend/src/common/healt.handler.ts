import { Controller, UseGuards } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { DataSource } from 'typeorm';
import { PING } from './healt';
import { InternalGuard } from './internal.guard';

@Controller()
@UseGuards(InternalGuard)
export class HealthHandler {
  constructor(private readonly db: DataSource) {}

  @MessagePattern(PING)
  async ping() {
    await this.db.query('SELECT 1'); // memastikan koneksi DB service ini hidup
    return { ok: true };
  }
}