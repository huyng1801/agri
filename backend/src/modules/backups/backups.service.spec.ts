import { BadRequestException } from '@nestjs/common';
import { mkdtemp, rm, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { BackupsService } from './backups.service';

describe('BackupsService', () => {
  let backupDir: string;
  let service: BackupsService;

  beforeEach(async () => {
    backupDir = await mkdtemp(join(tmpdir(), 'agri-backups-'));
    process.env.BACKUP_DIR = backupDir;
    service = new BackupsService({ record: jest.fn() } as never);
  });

  afterEach(async () => {
    await rm(backupDir, { recursive: true, force: true });
    delete process.env.BACKUP_DIR;
  });

  it('lists only valid backup files with restore confirmations', async () => {
    await writeFile(join(backupDir, 'agri-passport-20260704-130000.sql.gz'), 'backup');
    await writeFile(join(backupDir, 'notes.txt'), 'ignored');

    const backups = await service.list();

    expect(backups).toHaveLength(1);
    expect(backups[0]).toMatchObject({
      fileName: 'agri-passport-20260704-130000.sql.gz',
      downloadPath: '/backups/agri-passport-20260704-130000.sql.gz/download',
      restoreConfirmation: 'RESTORE:agri-passport-20260704-130000.sql.gz'
    });
  });

  it('rejects restore without the exact confirmation token', async () => {
    const fileName = 'agri-passport-20260704-130000.sql.gz';
    await writeFile(join(backupDir, fileName), 'backup');

    await expect(
      service.restore(
        { id: 'u1', email: 'admin@example.com', fullName: 'Admin', cooperativeId: null, roles: [], permissions: [] },
        fileName,
        { confirmation: 'RESTORE' }
      )
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
