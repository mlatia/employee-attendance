import { Injectable } from '@nestjs/common';
import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';

const KEYLEN = 64;
const FALLBACK_SALT = Buffer.alloc(16);

const derive = (password: string, salt: Buffer) =>
  new Promise<Buffer>((resolve, reject) =>
    scrypt(password, salt, KEYLEN, { N: 16384, r: 8, p: 1 }, (err, key) => (err ? reject(err) : resolve(key))),
  );

@Injectable()
export class PasswordService {
  async hash(password: string): Promise<string> {
    const salt = randomBytes(16);
    const key = await derive(password, salt);
    return `scrypt$${salt.toString('base64')}$${key.toString('base64')}`;
  }

  /** Selalu menjalankan scrypt walau hash kosong, agar waktu respons tidak membocorkan email terdaftar. */
  async verify(password: string, stored?: string): Promise<boolean> {
    const [scheme, saltB64, keyB64] = stored?.split('$') ?? [];
    const valid = scheme === 'scrypt' && !!saltB64 && !!keyB64;
    const key = await derive(password, valid ? Buffer.from(saltB64, 'base64') : FALLBACK_SALT);
    return valid && timingSafeEqual(key, Buffer.from(keyB64, 'base64'));
  }
}