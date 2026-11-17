import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isUUID } from 'class-validator';
import { createHash, randomUUID } from 'node:crypto';
import { Brackets, Repository } from 'typeorm';
import type {
  AttendanceView,
  ChallengeView,
  ListPayload,
  PhotoSource,
  SubmitPayload,
  TodayView,
} from '../common/attendance.contract';
import { escapeLike, isDuplicateEntry } from '../common/db.util';
import type { Paginated } from '../common/pagination';
import { Role } from '../common/role.enum';
import { type Actor, rpcError } from '../common/rpc';
import { businessDate } from '../common/time.util';
import { Attendance } from './attendance.entity';
import { ChallengeService } from './challenge.service';
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
  source: a.photoSource,
});

const alreadyAbsent = () => rpcError(409, 'Anda sudah absen hari ini');

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance) private readonly repo: Repository<Attendance>,
    private readonly processor: PhotoProcessor,
    private readonly storage: PhotoStorage,
    private readonly challenges: ChallengeService,
  ) {}

  challenge(actor: Actor): ChallengeView {
    this.assertEmployee(actor);
    return this.challenges.issue(actor.id);
  }

  async today(actor: Actor): Promise<TodayView> {
    this.assertEmployee(actor);
    const workDate = businessDate();
    const record = await this.repo.findOneBy({ employeeId: actor.id, workDate });
    return { workDate, record: record ? toView(record) : null };
  }

  /** Karyawan otomatis hanya melihat miliknya (scope ditentukan di sini, bukan oleh klien). HRD melihat semua. */
  async list(actor: Actor, query: ListPayload): Promise<Paginated<AttendanceView>> {
    const page = Math.max(1, Math.trunc(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Math.trunc(query.limit) || 10));

    const qb = this.repo.createQueryBuilder('a');
    if (actor.role === Role.EMPLOYEE) {
      qb.where('a.employeeId = :id', { id: actor.id });
    } else if (query.q) {
      const like = escapeLike(query.q);
      qb.where(
        new Brackets((w) =>
          w.where('a.fullName LIKE :name', { name: `%${like}%` }).orWhere('a.employeeNo LIKE :no', { no: `${like}%` }),
        ),
      );
    }
    if (query.date) qb.andWhere('a.workDate = :date', { date: query.date });

    // urutan sama dengan index idx_attendance_date (workDate, submittedAt, id)
    const [rows, total] = await qb
      .orderBy('a.workDate', 'DESC')
      .addOrderBy('a.submittedAt', 'DESC')
      .addOrderBy('a.id', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { items: rows.map(toView), total, page, limit };
  }

  /** Pemilik atau HRD. Karyawan lain mendapat 404 (bukan 403) agar keberadaan catatan tidak bocor. */
  async photo(actor: Actor, id: string): Promise<string> {
    const record = await this.repo.findOneBy({ id });
    if (!record || (actor.role === Role.EMPLOYEE && record.employeeId !== actor.id)) {
      throw rpcError(404, 'Foto tidak ditemukan');
    }
    const data = await this.storage.read(record.photoFile).catch(() => {
      throw rpcError(404, 'File foto tidak ditemukan');
    });
    return data.toString('base64');
  }

  async submit(actor: Actor, payload: SubmitPayload): Promise<AttendanceView> {
    this.assertEmployee(actor);
    const { idempotencyKey, challengeToken } = payload;
    if (!isUUID(idempotencyKey, '4')) throw rpcError(400, 'Idempotency-Key tidak valid');
    const input = Buffer.from(payload.photo ?? '', 'base64');
    if (input.length === 0) throw rpcError(400, 'Foto wajib diunggah');

    const note = (payload.note ?? '').trim().slice(0, 500);
    const requestHash = createHash('sha256').update(input).update('\0').update(note).digest('hex');

    // 1. retry dari request yang sama: kembalikan hasil lama (tidak butuh token lagi)
    const replay = await this.findReplay(actor.id, idempotencyKey, requestHash);
    if (replay) return replay;

    // 2. sudah absen hari ini: tolak sebelum memproses foto
    const now = new Date();
    const workDate = businessDate(now);
    if (await this.repo.existsBy({ employeeId: actor.id, workDate })) throw alreadyAbsent();

    // 3. token kamera: valid = foto dikirim dalam jendela waktu singkat setelah kamera dibuka di sesi ini
    let source: PhotoSource = 'FILE';
    if (challengeToken) {
      if (!this.challenges.verify(actor.id, challengeToken)) {
        throw rpcError(410, 'Sesi kamera kedaluwarsa. Buka kamera dan ambil foto lagi');
      }
      source = 'CAMERA';
    }

    // 4. simpan foto, lalu insert. Unique index di DB jadi penentu untuk request bersamaan
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
      photoSource: source,
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
    if (source === 'CAMERA') this.challenges.consume(actor.id);
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