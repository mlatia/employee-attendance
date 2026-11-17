import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import type { AuthUser } from '../auth/auth.types';
import {
  ATTENDANCE_PATTERNS,
  ATTENDANCE_SERVICE,
  AttendanceView,
  ChallengeView,
  ListPayload,
  SubmitPayload,
  TodayView,
} from '../common/attendance.contract';
import type { Paginated } from '../common/pagination';
import { ServiceClient } from '../common/service.client';

@Injectable()
export class AttendanceClient extends ServiceClient {
  constructor(@Inject(ATTENDANCE_SERVICE) client: ClientProxy, config: ConfigService) {
    super(client, config.getOrThrow<string>('INTERNAL_SECRET'));
  }

  submit(user: AuthUser, data: SubmitPayload) {
    return this.call<AttendanceView>(ATTENDANCE_PATTERNS.submit, data, user);
  }

  today(user: AuthUser) {
    return this.call<TodayView>(ATTENDANCE_PATTERNS.today, null, user);
  }

  challenge(user: AuthUser) {
    return this.call<ChallengeView>(ATTENDANCE_PATTERNS.challenge, null, user);
  }

  list(user: AuthUser, query: ListPayload) {
    return this.call<Paginated<AttendanceView>>(ATTENDANCE_PATTERNS.list, query, user);
  }

  photo(user: AuthUser, id: string) {
    return this.call<string>(ATTENDANCE_PATTERNS.photo, { id }, user);
  }
}