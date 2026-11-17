import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthModule } from '../auth/auth.module';
import { ATTENDANCE_SERVICE } from '../common/attendance.contract';
import { AttendanceClient } from './attendance.client';
import { AttendanceController } from './attendance.controller';

@Module({
  imports: [
    AuthModule,
    ClientsModule.registerAsync([
      {
        name: ATTENDANCE_SERVICE,
        inject: [ConfigService],
        useFactory: (c: ConfigService) => ({
          transport: Transport.TCP,
          options: { host: c.get<string>('ATTENDANCE_HOST') ?? '127.0.0.1', port: Number(c.get('ATTENDANCE_PORT') ?? 3002) },
        }),
      },
    ]),
  ],
  controllers: [AttendanceController],
  providers: [AttendanceClient],
})
export class AttendanceModule {}