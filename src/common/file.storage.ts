import { Client } from 'minio';
import { AppConfig } from '../app.types';

export class FileStorage {
  constructor(private readonly minio: Client, private readonly config: AppConfig) {}

  async resolveFileUrl(filename: string): Promise<string> {
    return this.minio.presignedGetObject(this.config.fileStorage.bucket, filename);
  }

  async uploadFile(
    filename: string,
    data: Buffer,
  ): Promise<{ etag: string; versionId: string | null }> {
    const result = await this.minio.putObject(this.config.fileStorage.bucket, filename, data);
    return { etag: result.etag, versionId: result.versionId };
  }

  async deleteFile(filename: string): Promise<void> {
    await this.minio.removeObject(this.config.fileStorage.bucket, filename);
  }
}
