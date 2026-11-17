import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { memoryStorage } from 'multer';
import { Auth, CurrentUser } from '../auth/auth.decorator';
import type { AuthUser } from '../auth/auth.types';
import { IdempotencyKey } from '../common/idempotency-key.decorator';
import { Role } from '../common/role.enum';
import { AttendanceClient } from './attendance.client';
import { ListAttendanceQuery } from './dto/list-attendance.query';
import { SubmitAttendanceDto } from './dto/submit-attendance.dto';

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendance: AttendanceClient) {}

  @Get('today')
  @Auth(Role.EMPLOYEE)
  today(@CurrentUser() user: AuthUser) {
    return this.attendance.today(user);
  }

  @Post('challenge')
  @Auth(Role.EMPLOYEE)
  challenge(@CurrentUser() user: AuthUser) {
    return this.attendance.challenge(user);
  }

  @Post()
  @Auth(Role.EMPLOYEE)
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
      challengeToken: dto.challengeToken,
      photo: photo.buffer.toString('base64'),
      idempotencyKey,
    });
  }

  /** HRD melihat semua (view only); karyawan otomatis hanya miliknya. */
  @Get()
  @Auth()
  list(@CurrentUser() user: AuthUser, @Query() query: ListAttendanceQuery) {
    return this.attendance.list(user, query);
  }

  @Get(':id/photo')
  @Auth()
  async photo(
    @CurrentUser() user: AuthUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Res() res: Response,
  ) {
    const image = Buffer.from(await this.attendance.photo(user, id), 'base64');
    res
      .set({
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'private, max-age=600', // hanya cache browser, tidak untuk proxy/CDN
        'X-Content-Type-Options': 'nosniff',
      })
      .end(image);
  }
}