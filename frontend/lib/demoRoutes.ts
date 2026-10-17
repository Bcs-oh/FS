import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import manifest from '@/data/demo-routes.json';

/** The export only covers emails that exist in the tracked demo bundle. */
export function demoEmailIds(): string[] {
  const bundle = readFileSync(resolve(process.cwd(), '../data/sdoc-hackathon-bundle.zip'));
  const hash = createHash('sha256').update(bundle).digest('hex');
  if (hash !== manifest.bundle_sha256) {
    throw new Error('Demo route IDs are stale. Run python3 scripts/generate-demo-routes.py from frontend, then rebuild.');
  }
  return manifest.email_ids;
}
