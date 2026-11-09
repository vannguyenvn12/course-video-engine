import {existsSync} from 'node:fs';
import {join} from 'node:path';
import {spawn} from 'node:child_process';

const root = join(process.cwd(), 'services', 'whisper_align');
const venvPy =
  process.platform === 'win32'
    ? join(root, '.venv', 'Scripts', 'python.exe')
    : join(root, '.venv', 'bin', 'python');

if (!existsSync(venvPy)) {
  console.error(
    JSON.stringify({ok: false, error: 'Missing venv; run pnpm whisper:install first'}),
  );
  process.exit(1);
}

const proc = spawn(
  venvPy,
  ['-m', 'uvicorn', 'app:app', '--host', '127.0.0.1', '--port', '8765'],
  {cwd: root, stdio: 'inherit', shell: false},
);

proc.on('exit', (code) => process.exit(code ?? 1));
