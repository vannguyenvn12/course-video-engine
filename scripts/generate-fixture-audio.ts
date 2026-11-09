import {spawnSync} from 'node:child_process';
import {join} from 'node:path';
import {existsSync, writeFileSync} from 'node:fs';
import {readFileSync} from 'node:fs';

const fixtureDir = join(process.cwd(), 'lectures', 'postgres', 'fixture-seq-scan');
const durationFile = join(fixtureDir, 'audio.duration.json');
const outMp3 = join(fixtureDir, 'audio.mp3');

const durationMs = existsSync(durationFile)
  ? (JSON.parse(readFileSync(durationFile, 'utf8')) as {durationMs: number}).durationMs
  : 45_000;

const durationSec = Math.ceil(durationMs / 1000);

const result = spawnSync(
  'ffmpeg',
  [
    '-y',
    '-f',
    'lavfi',
    '-i',
    'anullsrc=r=48000:cl=mono',
    '-t',
    String(durationSec),
    '-c:a',
    'libmp3lame',
    '-q:a',
    '9',
    outMp3,
  ],
  {stdio: 'pipe'},
);

if (result.status !== 0) {
  console.error(JSON.stringify({ok: false, error: result.stderr?.toString() ?? 'ffmpeg failed'}));
  process.exit(1);
}

writeFileSync(durationFile, `${JSON.stringify({durationMs}, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ok: true, path: outMp3, durationMs}));
