import {existsSync} from 'node:fs';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';

const root = join(process.cwd(), 'services', 'whisper_align');
const venv = join(root, '.venv');
const py = process.platform === 'win32' ? 'python' : 'python3';

if (existsSync(join(venv, 'Scripts', 'python.exe')) || existsSync(join(venv, 'bin', 'python'))) {
  console.log(JSON.stringify({ok: true, message: 'venv already exists'}));
  process.exit(0);
}

const create = spawnSync(py, ['-m', 'venv', '.venv'], {cwd: root, stdio: 'inherit'});
if (create.status !== 0) {
  console.error(JSON.stringify({ok: false, error: 'venv create failed'}));
  process.exit(1);
}

const pip =
  process.platform === 'win32'
    ? join(venv, 'Scripts', 'python.exe')
    : join(venv, 'bin', 'python');

const install = spawnSync(
  pip,
  ['-m', 'pip', 'install', '-r', 'requirements.txt'],
  {cwd: root, stdio: 'inherit'},
);
if (install.status !== 0) {
  console.error(JSON.stringify({ok: false, error: 'pip install failed'}));
  process.exit(1);
}

console.log(JSON.stringify({ok: true, venv}));
process.exit(0);
