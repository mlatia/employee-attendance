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
import { Actor, callRemote } from '../common/rpc';

@Injectable()
export class AttendanceClient {
  private readonly secret: string;

  constructor(
    @Inject(ATTENDANCE_SERVICE) private readonly client: ClientProxy,
    config: ConfigService,
  ) {
    this.secret = config.getOrThrow<string>('INTERNAL_SECRET');
  }

  submit(user: AuthUser, data: SubmitPayload) {
    return this.call<AttendanceView>(ATTENDANCE_PATTERNS.submit, user, data);
  }

  today(user: AuthUser) {
    return this.call<TodayView>(ATTENDANCE_PATTERNS.today, user, null);
  }

  challenge(user: AuthUser) {
    return this.call<ChallengeView>(ATTENDANCE_PATTERNS.challenge, user, null);
  }

  list(user: AuthUser, query: ListPayload) {
    return this.call<Paginated<AttendanceView>>(ATTENDANCE_PATTERNS.list, user, query);
  }

  photo(user: AuthUser, id: string) {
    return this.call<string>(ATTENDANCE_PATTERNS.photo, user, { id });
  }

  private call<T>(pattern: string, user: AuthUser, data: unknown) {
    const actor: Actor = {
      id: user.id,
      role: user.role,
      fullName: user.fullName,
      employeeNo: user.employeeNo,
      department: user.department,
    };
    return callRemote<T>(this.client, pattern, { secret: this.secret, actor, data });
  }
}