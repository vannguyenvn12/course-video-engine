import {writeFileSync, existsSync} from 'node:fs';
import {join} from 'node:path';
import {spawn} from 'node:child_process';
import {WhisperPayloadSchema} from './types.js';

const SERVICE_URL = process.env.WHISPER_SERVICE_URL ?? 'http://127.0.0.1:8765';

export const transcribeLectureAudio = async (lectureDir: string): Promise<string> => {
  const audioPath = join(lectureDir, 'audio.mp3');
  const outPath = join(lectureDir, 'whisper.words.json');
  if (!existsSync(audioPath)) {
    throw new Error(`Missing audio.mp3 in ${lectureDir}`);
  }

  let payload: {words: {word: string; start: number; end: number}[]; duration_sec?: number};

  try {
    const res = await fetch(`${SERVICE_URL}/transcribe`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({audio_path: audioPath}),
    });
    if (res.ok) {
      const data = (await res.json()) as {
        words: {word: string; start: number; end: number}[];
        duration_sec: number;
      };
      payload = {words: data.words, duration_sec: data.duration_sec};
    } else {
      throw new Error(`HTTP ${res.status}`);
    }
  } catch {
    payload = await transcribeViaPythonCli(audioPath);
  }

  WhisperPayloadSchema.parse({words: payload.words});
  writeFileSync(outPath, `${JSON.stringify({words: payload.words}, null, 2)}\n`, 'utf8');

  const durationMs = Math.ceil(
    (payload.duration_sec ?? payload.words.at(-1)?.end ?? 0) * 1000,
  );
  const durationFile = join(lectureDir, 'audio.duration.json');
  writeFileSync(durationFile, `${JSON.stringify({durationMs}, null, 2)}\n`, 'utf8');

  return outPath;
};

const transcribeViaPythonCli = (audioPath: string): Promise<{
  words: {word: string; start: number; end: number}[];
  duration_sec?: number;
}> => {
  const cli = join(process.cwd(), 'services', 'whisper_align', 'cli.py');
  const venvPython = join(process.cwd(), 'services', 'whisper_align', '.venv', 'Scripts', 'python.exe');
  const python = existsSync(venvPython) ? venvPython : 'python';

  return new Promise((resolve, reject) => {
    const proc = spawn(python, [cli, audioPath], {
      cwd: join(process.cwd(), 'services', 'whisper_align'),
      shell: false,
    });
    let out = '';
    let err = '';
    proc.stdout.on('data', (d) => {
      out += String(d);
    });
    proc.stderr.on('data', (d) => {
      err += String(d);
    });
    proc.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(err || `whisper cli exit ${code}`));
        return;
      }
      try {
        const parsed = JSON.parse(out) as {
          ok: boolean;
          words: {word: string; start: number; end: number}[];
          duration_sec?: number;
        };
        if (!parsed.ok) {
          reject(new Error('whisper cli failed'));
          return;
        }
        resolve(parsed);
      } catch (e) {
        reject(e);
      }
    });
  });
};
