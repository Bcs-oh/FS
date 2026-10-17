import { spawnSync } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Next 14 static export uses distDir as its FINAL export folder but still writes
// intermediates to .next. Build a temporary source snapshot so a running dev
// server's .next cache and generated types are never used by this build.
const frontend = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const temporary = mkdtempSync(join(tmpdir(), 'freightsentinel-pages-'));
const staged = join(temporary, 'frontend');
let status = 1;
try {
  cpSync(frontend, staged, {
    recursive: true,
    filter: (path) => {
      const name = basename(path);
      return !['node_modules', '.next', '.next-pages', 'out', '.wrangler', '.git', '.env', 'tsconfig.tsbuildinfo'].includes(name)
        && !name.startsWith('.env.') && !name.startsWith('.dev.vars');
    },
  });
  symlinkSync(join(frontend, 'node_modules'), join(staged, 'node_modules'), 'dir');
  mkdirSync(join(temporary, 'data'));
  cpSync(join(frontend, '../data/sdoc-hackathon-bundle.zip'), join(temporary, 'data/sdoc-hackathon-bundle.zip'));
  const result = spawnSync(process.execPath, [join(frontend, 'node_modules/next/dist/bin/next'), 'build'], {
    cwd: staged,
    stdio: 'inherit',
    env: {
      ...process.env,
      FREE_PAGES_EXPORT: '1',
      NEXT_PUBLIC_FREE_DEMO: process.env.NEXT_PUBLIC_FREE_DEMO || '1',
    },
  });
  if (result.error) console.error(result.error.message);
  status = result.status ?? 1;
  if (status === 0) {
    rmSync(join(frontend, 'out'), { recursive: true, force: true });
    cpSync(join(staged, '.next-pages'), join(frontend, 'out'), { recursive: true });
    console.log('Cloudflare Pages static files: frontend/out');
  }
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
process.exit(status);
