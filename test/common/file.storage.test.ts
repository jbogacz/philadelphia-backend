import { test } from 'node:test';
import assert from 'node:assert';
import { build } from '../helper';
import { FileStorage } from '../../src/common/file.storage';

test('common:file.storage.service', async t => {
  const fastify = await build(t);
  const fileStorage: FileStorage = fastify.fileStorage;

  // await t.test('should upload and delete file url', async () => {
  //   const result = await fileStorage.uploadFile('file.storage.jpg', Buffer.from('./file.storage.jpg'));
  //   assert.ok(result);

  //   const fileUrl = await fileStorage.resolveFileUrl('file.storage.jpg');
  //   assert.ok(fileUrl);

  //   await fileStorage.deleteFile('file.storage.jpg');
  // });
});
