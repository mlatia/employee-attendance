import { Controller, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ATTENDANCE_PATTERNS, ListPayload, SubmitPayload } from '../common/attendance.contract';
import { InternalGuard } from '../common/internal.guard';
import type { Envelope } from '../common/rpc';
import { AttendanceService } from './attendance.service';

@Controller()
@UseGuards(InternalGuard)
export class AttendanceHandler {
  constructor(private readonly attendance: AttendanceService) {}

  @MessagePattern(ATTENDANCE_PATTERNS.submit)
  submit(@Payload() { actor, data }: Envelope<SubmitPayload>) {
    return this.attendance.submit(actor, data);
  }

  @MessagePattern(ATTENDANCE_PATTERNS.today)
  today(@Payload() { actor }: Envelope) {
    return this.attendance.today(actor);
  }

  @MessagePattern(ATTENDANCE_PATTERNS.challenge)
  challenge(@Payload() { actor }: Envelope) {
    return this.attendance.challenge(actor);
  }

  @MessagePattern(ATTENDANCE_PATTERNS.list)
  list(@Payload() { actor, data }: Envelope<ListPayload>) {
    return this.attendance.list(actor, data);
  }

  @MessagePattern(ATTENDANCE_PATTERNS.photo)
  photo(@Payload() { actor, data }: Envelope<{ id: string }>) {
    return this.attendance.photo(actor, data.id);
  }
}