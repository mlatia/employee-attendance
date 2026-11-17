import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ATTENDANCE_SERVICE } from '../common/attendance.contract';
import { tcpClient } from '../common/tranport';
import { AttendanceClient } from './attendance.client';
import { AttendanceController } from './attendance.controller';

@Module({
  imports: [AuthModule, tcpClient(ATTENDANCE_SERVICE, 'ATTENDANCE_HOST', 'ATTENDANCE_PORT', 3002)],
  controllers: [AttendanceController],
  providers: [AttendanceClient],
  exports: [AttendanceClient],
})
export class AttendanceModule {}