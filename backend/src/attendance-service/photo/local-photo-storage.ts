import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { mkdir, rm, writeFile, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { PhotoStorage } from './photo-storage';

const SAFE_KEY = /^[0-9a-f-]{36}\.jpg$/;

@Injectable()
export class LocalPhotoStorage extends PhotoStorage implements OnModuleInit {
  private readonly dir: string;

  constructor(config: ConfigService) {
    super();
    this.dir = resolve(config.get<string>('UPLOAD_DIR') ?? 'uploads');
  }

  onModuleInit() {
    return mkdir(this.dir, { recursive: true }).then(() => undefined);
  }

  save(key: string, data: Buffer) {
    return writeFile(this.path(key), data, { flag: 'wx' });
  }
  read(key: string) {
    return readFile(this.path(key));
  }
  remove(key: string) {
    return rm(this.path(key), { force: true });
  }

  private path(key: string) {
    if (!SAFE_KEY.test(key)) throw new Error('Invalid photo key');
    return join(this.dir, key);
  }
}