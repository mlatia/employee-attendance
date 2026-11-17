import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InternalGuard } from '../common/internal.guard';
import { validateEnv } from '../config/env';
import { dbOptions } from '../database/data-source';
import { Attendance } from './attendance.entity';
import { AttendanceHandler } from './attendance.handler';
import { AttendanceService } from './attendance.service';
import { LocalPhotoStorage } from './photo/local-photo-storage';
import { PhotoStorage } from './photo/photo-storage';
import { PhotoProcessor } from './photo/photo.processor';
import { ChallengeService } from './challenge.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    TypeOrmModule.forRootAsync({ useFactory: () => dbOptions(process.env, [Attendance]) }),
    TypeOrmModule.forFeature([Attendance]),
  ],
  controllers: [AttendanceHandler],
  providers: [
    AttendanceService,
    PhotoProcessor,
    InternalGuard,
    { provide: PhotoStorage, useClass: LocalPhotoStorage },
    ChallengeService,
  ],

})
export class AttendanceServiceModule {}