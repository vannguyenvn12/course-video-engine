import {readdirSync, existsSync} from 'node:fs';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';

const courseDir = process.argv[2];
if (!courseDir) {
  console.error(JSON.stringify({ok: false, error: 'Usage: pnpm batch <courseDir>'}));
  process.exit(1);
}

const lectures = readdirSync(courseDir, {withFileTypes: true})
  .filter((d) => d.isDirectory())
  .map((d) => join(courseDir, d.name))
  .filter((dir) => existsSync(join(dir, 'script.md')));

const reports: {lecture: string; ok: boolean}[] = [];
for (const dir of lectures) {
  try {
    execFileSync('pnpm', ['qa', dir], {stdio: 'pipe', shell: true});
    reports.push({lecture: dir, ok: true});
  } catch {
    reports.push({lecture: dir, ok: false});
  }
}

const ok = reports.every((r) => r.ok);
console.log(JSON.stringify({ok, reports}));
if (!ok) {
  process.exit(1);
}
