import { Injectable } from '@nestjs/common';
import sharp from 'sharp';
import { rpcError } from '../../common/rpc';

sharp.cache(false);
sharp.concurrency(2);

const ALLOWED = new Set(['jpeg', 'png', 'webp']);

@Injectable()
export class PhotoProcessor {
  async toJpeg(input: Buffer): Promise<Buffer> {
    try {
      const image = sharp(input, { limitInputPixels: 12_000_000 });
      const { format } = await image.metadata();
      if (!format || !ALLOWED.has(format)) throw new Error('unsupported');
      return await image
        .rotate()
        .resize(1280, 1280, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 78, mozjpeg: true })
        .toBuffer();
    } catch {
      throw rpcError(400, 'Foto tidak valid. Gunakan JPEG, PNG, atau WebP (maksimal 12 megapiksel)');
    }
  }
}