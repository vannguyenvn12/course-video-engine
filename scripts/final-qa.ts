import {existsSync, readFileSync} from 'node:fs';
import {join, basename} from 'node:path';
import {spawnSync} from 'node:child_process';

const lectureDir = process.argv[2];
if (!lectureDir) {
  console.error(JSON.stringify({ok: false, error: 'Usage: pnpm final:qa <lectureDir>'}));
  process.exit(1);
}

const name = basename(lectureDir);
const outDir = join(process.cwd(), 'out', name);
const mp4 = join(outDir, 'lecture.mp4');
const compiledPath = join(outDir, 'timeline.compiled.json');

if (!existsSync(mp4)) {
  console.error(JSON.stringify({ok: false, error: `Missing ${mp4}`}));
  process.exit(1);
}

const probe = spawnSync(
  'ffprobe',
  ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', mp4],
  {encoding: 'utf8'},
);

if (probe.status !== 0) {
  console.error(JSON.stringify({ok: false, error: probe.stderr ?? 'ffprobe failed'}));
  process.exit(1);
}

const videoSec = Number.parseFloat(probe.stdout.trim());
const compiled = JSON.parse(readFileSync(compiledPath, 'utf8')) as {durationMs: number};
const expectedSec = compiled.durationMs / 1000;
const drift = Math.abs(videoSec - expectedSec);

const ok = drift <= 1.5;
console.log(
  JSON.stringify({
    ok,
    videoSec,
    expectedSec,
    driftSec: drift,
    mp4,
  }),
);
process.exit(ok ? 0 : 1);
