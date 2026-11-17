import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import type { AuthUser } from '../auth/auth.types';
import {
  ATTENDANCE_PATTERNS,
  ATTENDANCE_SERVICE,
  AttendanceView,
  SubmitPayload,
  TodayView,
} from '../common/attendance.contract';
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
    return callRemote<AttendanceView>(this.client, ATTENDANCE_PATTERNS.submit, this.envelope(user, data));
  }

  today(user: AuthUser) {
    return callRemote<TodayView>(this.client, ATTENDANCE_PATTERNS.today, this.envelope(user, null));
  }

  private envelope<T>(user: AuthUser, data: T) {
    const actor: Actor = {
      id: user.id,
      role: user.role,
      fullName: user.fullName,
      employeeNo: user.employeeNo,
      department: user.department,
    };
    return { secret: this.secret, actor, data };
  }
}