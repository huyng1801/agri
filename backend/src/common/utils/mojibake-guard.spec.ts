import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const suspiciousTextPattern = /(?:\u00c3|\u00c2|\u00c4|\u00c5|\u00c6)[\u0080-\u00ff]|\ufffd/u;
const sourceRoots = ['src', 'prisma'];
const ignoredDirectories = new Set(['dist', 'node_modules']);
const allowedExtensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.json']);

describe('backend source mojibake guard', () => {
  it('does not contain suspicious mojibake sequences in runtime source files', () => {
    const flaggedFiles = sourceRoots.flatMap((root) => collectSuspiciousFiles(root));

    expect(flaggedFiles).toEqual([]);
  });
});

function collectSuspiciousFiles(root: string) {
  const entries = readdirSync(root);
  const flaggedFiles: string[] = [];

  for (const entry of entries) {
    const fullPath = join(root, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      if (ignoredDirectories.has(entry)) {
        continue;
      }
      flaggedFiles.push(...collectSuspiciousFiles(fullPath));
      continue;
    }

    if (![...allowedExtensions].some((extension) => fullPath.endsWith(extension))) {
      continue;
    }

    const text = readFileSync(fullPath, 'utf8');
    if (suspiciousTextPattern.test(text)) {
      flaggedFiles.push(fullPath);
    }
  }

  return flaggedFiles.sort();
}
