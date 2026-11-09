import {spawnSync} from 'node:child_process';
import {join} from 'node:path';
import {existsSync} from 'node:fs';

const out = join(process.cwd(), 'public', 'silence.mp3');
if (existsSync(out)) {
  console.log(JSON.stringify({ok: true, path: out, skipped: true}));
  process.exit(0);
}

const result = spawnSync(
  'ffmpeg',
  ['-y', '-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=mono', '-t', '120', '-c:a', 'libmp3lame', '-q:a', '9', out],
  {stdio: 'pipe'},
);

if (result.status !== 0) {
  console.error(JSON.stringify({ok: false, error: result.stderr?.toString() ?? 'ffmpeg failed'}));
  process.exit(1);
}

console.log(JSON.stringify({ok: true, path: out}));
