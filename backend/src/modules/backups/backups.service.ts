import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException
} from '@nestjs/common';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { createReadStream, createWriteStream, ReadStream } from 'fs';
import { mkdir, readdir, stat, unlink } from 'fs/promises';
import { basename, resolve, sep } from 'path';
import { pipeline } from 'stream/promises';
import { RestoreBackupDto } from '../../common/dto';
import { AuthUser } from '../../common/types';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

const BACKUP_FILE_PATTERN = /^agri-passport-\d{8}-\d{6}(?:-[a-z0-9-]+)?\.sql\.gz$/;

export type BackupFile = {
  fileName: string;
  sizeBytes: number;
  createdAt: string;
  downloadPath: string;
  restoreConfirmation: string;
};

@Injectable()
export class BackupsService {
  constructor(private readonly audit: AuditLogsService) {}

  async list() {
    await this.ensureBackupDir();
    const entries = await readdir(this.backupDir(), { withFileTypes: true });
    const files = await Promise.all(
      entries
        .filter((entry) => entry.isFile() && this.isValidBackupName(entry.name))
        .map((entry) => this.describe(entry.name))
    );
    return files.sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt));
  }

  async create(user: AuthUser, suffix?: string) {
    await this.ensureBackupDir();
    const fileName = this.backupName(suffix);
    const filePath = this.resolveBackupPath(fileName);
    try {
      await this.dumpDatabase(filePath);
    } catch (error) {
      await unlink(filePath).catch(() => undefined);
      throw error;
    }
    await this.audit.record({
      user,
      action: suffix === 'pre-restore' ? 'backups.create_pre_restore' : 'backups.create',
      entity: 'Backup',
      entityId: fileName,
      metadata: { fileName }
    });
    return this.describe(fileName);
  }

  async download(fileName: string): Promise<{ fileName: string; sizeBytes: number; stream: ReadStream }> {
    const filePath = await this.assertReadableBackup(fileName);
    const info = await stat(filePath);
    return {
      fileName,
      sizeBytes: info.size,
      stream: createReadStream(filePath)
    };
  }

  async restore(user: AuthUser, fileName: string, dto: RestoreBackupDto) {
    const filePath = await this.assertReadableBackup(fileName);
    const expected = this.restoreConfirmation(fileName);
    if (dto.confirmation !== expected) {
      throw new BadRequestException(`Nhập ${expected} để xác nhận khôi phục`);
    }

    const safetyBackup = await this.create(user, 'pre-restore');
    await this.restoreDatabase(filePath);
    await this.audit.record({
      user,
      action: 'backups.restore',
      entity: 'Backup',
      entityId: fileName,
      metadata: { fileName, safetyBackup: safetyBackup.fileName }
    });
    return {
      restored: true,
      fileName,
      safetyBackup: safetyBackup.fileName
    };
  }

  private async describe(fileName: string): Promise<BackupFile> {
    const filePath = this.resolveBackupPath(fileName);
    const info = await stat(filePath);
    return {
      fileName,
      sizeBytes: info.size,
      createdAt: info.mtime.toISOString(),
      downloadPath: `/backups/${encodeURIComponent(fileName)}/download`,
      restoreConfirmation: this.restoreConfirmation(fileName)
    };
  }

  private async assertReadableBackup(fileName: string) {
    if (!this.isValidBackupName(fileName)) {
      throw new BadRequestException('Tên backup không hợp lệ');
    }
    const filePath = this.resolveBackupPath(fileName);
    try {
      const info = await stat(filePath);
      if (!info.isFile()) throw new NotFoundException('Không tìm thấy backup');
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new NotFoundException('Không tìm thấy backup');
    }
    return filePath;
  }

  private async dumpDatabase(filePath: string) {
    const config = this.databaseConfig();
    const pgDump = spawn(
      'pg_dump',
      [
        '-h',
        config.host,
        '-p',
        config.port,
        '-U',
        config.user,
        '--clean',
        '--if-exists',
        '--no-owner',
        '--no-acl',
        config.database
      ],
      { env: this.pgEnv(config.password) }
    );
    const gzip = spawn('gzip', ['-c']);
    const output = createWriteStream(filePath, { flags: 'wx' });

    await this.pipeProcesses(
      [
        { name: 'pg_dump', process: pgDump },
        { name: 'gzip', process: gzip }
      ],
      [
        pipeline(pgDump.stdout, gzip.stdin),
        pipeline(gzip.stdout, output)
      ]
    );
  }

  private async restoreDatabase(filePath: string) {
    const config = this.databaseConfig();
    const gzip = spawn('gzip', ['-dc', filePath]);
    const psql = spawn(
      'psql',
      ['-h', config.host, '-p', config.port, '-U', config.user, '-d', config.database, '-v', 'ON_ERROR_STOP=1'],
      { env: this.pgEnv(config.password) }
    );

    await this.pipeProcesses(
      [
        { name: 'gzip', process: gzip },
        { name: 'psql', process: psql }
      ],
      [pipeline(gzip.stdout, psql.stdin)]
    );
  }

  private async pipeProcesses(
    processes: Array<{ name: string; process: ChildProcessWithoutNullStreams }>,
    pipes: Array<Promise<unknown>>
  ) {
    const stderr = new Map<string, string>();
    const exits = processes.map(({ name, process }) => {
      stderr.set(name, '');
      process.stderr.on('data', (chunk: Buffer) => {
        stderr.set(name, `${stderr.get(name) ?? ''}${chunk.toString('utf8')}`);
      });
      return this.waitForExit(name, process);
    });

    const codes = await Promise.all([...pipes, ...exits]).then((values) => values.slice(pipes.length) as number[]);
    const failed = codes.findIndex((code) => code !== 0);
    if (failed >= 0) {
      const failedProcess = processes[failed];
      const message = (stderr.get(failedProcess.name) || '').trim().slice(0, 800);
      throw new InternalServerErrorException(message || `${failedProcess.name} chạy không thành công`);
    }
  }

  private waitForExit(name: string, process: ChildProcessWithoutNullStreams) {
    return new Promise<number>((resolveExit, rejectExit) => {
      process.once('error', (error) => rejectExit(new InternalServerErrorException(`${name} chưa sẵn sàng: ${error.message}`)));
      process.once('close', (code) => resolveExit(code ?? 0));
    });
  }

  private databaseConfig() {
    const url = process.env.DATABASE_URL ? new URL(process.env.DATABASE_URL) : undefined;
    const database = process.env.POSTGRES_DB || url?.pathname.replace(/^\//, '') || 'agri_passport';
    const user = process.env.POSTGRES_USER || url?.username || process.env.POSTGRES_APP_USER || 'agri_user';
    const password = process.env.POSTGRES_PASSWORD || url?.password || process.env.POSTGRES_APP_PASSWORD || '';
    if (!password) {
      throw new InternalServerErrorException('Thiếu mật khẩu PostgreSQL để sao lưu');
    }
    return {
      host: process.env.POSTGRES_HOST || url?.hostname || 'postgres',
      port: process.env.POSTGRES_PORT || url?.port || '5432',
      database: decodeURIComponent(database),
      user: decodeURIComponent(user),
      password: decodeURIComponent(password)
    };
  }

  private pgEnv(password: string) {
    return {
      ...process.env,
      PGPASSWORD: password
    };
  }

  private async ensureBackupDir() {
    await mkdir(this.backupDir(), { recursive: true });
  }

  private resolveBackupPath(fileName: string) {
    const safeName = basename(fileName);
    const dir = resolve(this.backupDir());
    const filePath = resolve(dir, safeName);
    if (!filePath.startsWith(`${dir}${sep}`)) {
      throw new BadRequestException('Tên backup không hợp lệ');
    }
    return filePath;
  }

  private isValidBackupName(fileName: string) {
    return basename(fileName) === fileName && BACKUP_FILE_PATTERN.test(fileName);
  }

  private backupName(suffix?: string) {
    const now = new Date().toISOString();
    const stamp = `${now.slice(0, 10).replace(/-/g, '')}-${now.slice(11, 19).replace(/:/g, '')}`;
    const safeSuffix = suffix ? `-${suffix.toLowerCase().replace(/[^a-z0-9-]+/g, '-')}` : '';
    return `agri-passport-${stamp}${safeSuffix}.sql.gz`;
  }

  private restoreConfirmation(fileName: string) {
    return `RESTORE:${fileName}`;
  }

  private backupDir() {
    return process.env.BACKUP_DIR || '/backups';
  }
}
