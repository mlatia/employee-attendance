import { Module } from '@nestjs/common';
import { AttendanceModule } from '../attendance/attendance.module';
import { IdentityModule } from '../identity/identity.module';
import { HealthController } from './health.controller';

@Module({
  imports: [IdentityModule, AttendanceModule],
  controllers: [HealthController],
})
export class HealthModule {}