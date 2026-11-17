import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Auth, CurrentUser } from '../auth/auth.decorator';
import type { AuthUser } from '../auth/auth.types';
import { IdempotencyKey } from '../common/idempotency-key.decorator';
import { Role } from '../common/role.enum';
import { AttendanceClient } from './attendance.client';
import { SubmitAttendanceDto } from './dto/submit-attendance.dto';

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

@Controller('attendance')
@Auth(Role.EMPLOYEE)
export class AttendanceController {
    constructor(private readonly attendance: AttendanceClient) {}

    @Get('today')
    today(@CurrentUser() user: AuthUser) {
        return this.attendance.today(user);
    }

    @Post()
    @UseInterceptors(FileInterceptor('photo', { storage: memoryStorage(), limits: { fileSize: MAX_PHOTO_BYTES, files: 1 } }))
    submit(
        @CurrentUser() user: AuthUser,
        @IdempotencyKey() idempotencyKey: string,
        @Body() dto: SubmitAttendanceDto,
        @UploadedFile() photo?: Express.Multer.File,
    ) {
        if (!photo) throw new BadRequestException('Foto wajib diunggah');
        return this.attendance.submit(user, {
        note: dto.note,
        photo: photo.buffer.toString('base64'),
        idempotencyKey,
        });
    }
}