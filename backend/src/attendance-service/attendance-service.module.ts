import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthHandler } from '../common/healt.handler';
import { InternalGuard } from '../common/internal.guard';
import { attendanceEnv } from '../config/env';
import { dbOptions } from '../database/data-source';
import { Attendance } from './attendance.entity';
import { AttendanceHandler } from './attendance.handler';
import { AttendanceService } from './attendance.service';
import { ChallengeService } from './challenge.service';
import { LocalPhotoStorage } from './photo/local-photo-storage';
import { PhotoStorage } from './photo/photo-storage';
import { PhotoProcessor } from './photo/photo.processor';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: attendanceEnv }),
    TypeOrmModule.forRootAsync({ useFactory: () => dbOptions(process.env, [Attendance], 'ATTENDANCE') }),
    TypeOrmModule.forFeature([Attendance]),
  ],
  controllers: [AttendanceHandler, HealthHandler],
  providers: [
    AttendanceService,
    PhotoProcessor,
    ChallengeService,
    InternalGuard,
    { provide: PhotoStorage, useClass: LocalPhotoStorage }, // ganti ke S3/MinIO cukup di sini
  ],
})
export class AttendanceServiceModule {}