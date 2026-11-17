import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import type { ChallengeView } from '../common/attendance.contract';

const TTL_MS = 5 * 60 * 1000;

interface Entry {
  token: string;
  expiresAt: number;
}

@Injectable()
export class ChallengeService implements OnModuleDestroy {
  private readonly store = new Map<string, Entry>();
  private readonly sweeper = setInterval(() => this.sweep(), 60_000).unref();

  issue(employeeId: string): ChallengeView {
    const token = randomBytes(24).toString('base64url');
    const expiresAt = Date.now() + TTL_MS;
    this.store.set(employeeId, { token, expiresAt }); // token baru menggantikan yang lama
    return { token, expiresAt: new Date(expiresAt).toISOString() };
  }

  verify(employeeId: string, token: string): boolean {
    const entry = this.store.get(employeeId);
    if (!entry || entry.expiresAt <= Date.now()) return false;
    const a = Buffer.from(entry.token);
    const b = Buffer.from(token);
    return a.length === b.length && timingSafeEqual(a, b);
  }

  /** Dipanggil setelah absensi tersimpan, supaya token tidak bisa dipakai dua kali. */
  consume(employeeId: string): void {
    this.store.delete(employeeId);
  }

  onModuleDestroy() {
    clearInterval(this.sweeper);
  }

  private sweep() {
    const now = Date.now();
    for (const [id, e] of this.store) if (e.expiresAt <= now) this.store.delete(id);
  }
}