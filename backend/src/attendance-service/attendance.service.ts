import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isUUID } from 'class-validator';
import { createHash, randomUUID } from 'node:crypto';
import { Repository } from 'typeorm';
import type { AttendanceView, SubmitPayload, TodayView } from '../common/attendance.contract';
import { isDuplicateEntry } from '../common/db.util';
import { Role } from '../common/role.enum';
import { type Actor, rpcError } from '../common/rpc';
import { businessDate } from '../common/time.util';
import { Attendance } from './attendance.entity';
import { PhotoStorage } from './photo/photo-storage';
import { PhotoProcessor } from './photo/photo.processor';

const toView = (a: Attendance): AttendanceView => ({
  id: a.id,
  workDate: a.workDate,
  submittedAt: a.submittedAt.toISOString(),
  fullName: a.fullName,
  employeeNo: a.employeeNo,
  department: a.department,
  note: a.note,
});

const alreadyAbsent = () => rpcError(409, 'Anda sudah absen hari ini');

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance) private readonly repo: Repository<Attendance>,
    private readonly processor: PhotoProcessor,
    private readonly storage: PhotoStorage,
  ) {}

  async today(actor: Actor): Promise<TodayView> {
    this.assertEmployee(actor);
    const workDate = businessDate();
    const record = await this.repo.findOneBy({ employeeId: actor.id, workDate });
    return { workDate, record: record ? toView(record) : null };
  }

  async submit(actor: Actor, payload: SubmitPayload): Promise<AttendanceView> {
    this.assertEmployee(actor);
    const { idempotencyKey } = payload;
    if (!isUUID(idempotencyKey, '4')) throw rpcError(400, 'Idempotency-Key tidak valid');
    const input = Buffer.from(payload.photo ?? '', 'base64');
    if (input.length === 0) throw rpcError(400, 'Foto wajib diunggah');

    const note = (payload.note ?? '').trim().slice(0, 500);
    const requestHash = createHash('sha256').update(input).update('\0').update(note).digest('hex');

    const replay = await this.findReplay(actor.id, idempotencyKey, requestHash);
    if (replay) return replay;

    const now = new Date();
    const workDate = businessDate(now);
    if (await this.repo.existsBy({ employeeId: actor.id, workDate })) throw alreadyAbsent();

    const photoFile = `${randomUUID()}.jpg`;
    await this.storage.save(photoFile, await this.processor.toJpeg(input));

    const record = this.repo.create({
      id: randomUUID(),
      employeeId: actor.id,
      workDate,
      submittedAt: now,
      fullName: actor.fullName,
      employeeNo: actor.employeeNo,
      department: actor.department,
      note,
      photoFile,
      idempotencyKey,
      requestHash,
    });

    try {
      await this.repo.insert(record);
    } catch (e) {
      await this.storage.remove(photoFile).catch(() => undefined);
      if (!isDuplicateEntry(e)) throw e;
      const winner = await this.findReplay(actor.id, idempotencyKey, requestHash);
      if (winner) return winner;
      throw alreadyAbsent();
    }
    return toView(record);
  }

  private async findReplay(employeeId: string, idempotencyKey: string, requestHash: string) {
    const prior = await this.repo.findOneBy({ employeeId, idempotencyKey });
    if (!prior) return null;
    if (prior.requestHash !== requestHash) {
      throw rpcError(422, 'Idempotency-Key sudah dipakai untuk permintaan yang berbeda');
    }
    return toView(prior);
  }

  private assertEmployee(actor: Actor) {
    if (actor.role !== Role.EMPLOYEE) throw rpcError(403, 'Hanya karyawan yang dapat absen');
  }
}