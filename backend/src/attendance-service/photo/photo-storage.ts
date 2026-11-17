export abstract class PhotoStorage {
  abstract save(key: string, data: Buffer): Promise<void>;
  abstract remove(key: string): Promise<void>;
}