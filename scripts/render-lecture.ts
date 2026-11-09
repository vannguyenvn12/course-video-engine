import {mkdirSync, readFileSync, existsSync, copyFileSync} from 'node:fs';
import {join, basename} from 'node:path';
import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';
import {loadDsl} from '../src/dsl/validate-gate.js';
import {canvas} from '../src/design/tokens.js';
import {withTypeScriptExtensionAlias} from '../src/remotion/webpack-extension-alias.js';

export const runRenderLecture = async (lectureDir: string): Promise<string> => {
const name = basename(lectureDir);
const outDir = join(process.cwd(), 'out', name);
const compiledPath = join(outDir, 'timeline.compiled.json');
const audioSrc = join(lectureDir, 'audio.mp3');

  if (!existsSync(compiledPath)) {
    throw new Error(`Missing ${compiledPath}; run compile first`);
  }
  const compiled = JSON.parse(readFileSync(compiledPath, 'utf8')) as {
    fps: number;
    durationMs: number;
    scenes: {
      id: string;
      preset: string;
      startFrame: number;
      endFrame: number;
    }[];
  };
  const dsl = loadDsl(lectureDir);
  const slotById = new Map(dsl.scenes.map((s) => [s.id, s.slots]));

  const scenes = compiled.scenes.map((s) => ({
    id: s.id,
    preset: s.preset,
    startFrame: s.startFrame,
    durationFrames: Math.max(1, s.endFrame - s.startFrame),
    slots: slotById.get(s.id) ?? {},
  }));

  const publicAudio = join(process.cwd(), 'public', `lecture-audio-${name}.mp3`);
  if (existsSync(audioSrc)) {
    copyFileSync(audioSrc, publicAudio);
  }

  const entry = join(process.cwd(), 'src', 'index.ts');
  const serveUrl = await bundle({
    entryPoint: entry,
    publicDir: join(process.cwd(), 'public'),
    webpackOverride: withTypeScriptExtensionAlias,
  });

  const inputProps = {
    audioFile: existsSync(audioSrc) ? `lecture-audio-${name}.mp3` : 'silence.mp3',
    scenes,
  };

  const composition = await selectComposition({
    serveUrl,
    id: 'Lecture',
    inputProps,
  });

  const durationInFrames = Math.round((compiled.durationMs / 1000) * compiled.fps);
  const comp = {...composition, durationInFrames};

  mkdirSync(outDir, {recursive: true});
  const output = join(outDir, 'lecture.mp4');

  const videoOnly = join(outDir, 'lecture.video-only.mp4');
  await renderMedia({
    composition: comp,
    serveUrl,
    inputProps: {...inputProps, audioFile: 'silence.mp3'},
    codec: 'h264',
    outputLocation: videoOnly,
    imageFormat: 'jpeg',
    overwrite: true,
    muted: true,
    enforceAudioTrack: false,
    forceIPv4: true,
  });

  const audioTrack = existsSync(audioSrc) ? audioSrc : join(process.cwd(), 'public', 'silence.mp3');
  const mux = await import('node:child_process');
  const muxed = mux.spawnSync(
    'ffmpeg',
    ['-y', '-i', videoOnly, '-i', audioTrack, '-c:v', 'copy', '-c:a', 'aac', '-shortest', output],
    {stdio: 'pipe'},
  );
  if (muxed.status !== 0) {
    throw new Error(muxed.stderr?.toString() ?? 'ffmpeg mux failed');
  }

  console.log(
    JSON.stringify({
      ok: true,
      output,
      durationFrames: durationInFrames,
      fps: canvas.fps,
    }),
  );
  return output;
};

const lectureDir = process.argv[2];
if (lectureDir) {
  runRenderLecture(lectureDir).catch((err) => {
    console.error(JSON.stringify({ok: false, error: String(err)}));
    process.exit(1);
  });
}
