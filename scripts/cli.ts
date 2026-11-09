import {runAlign} from '../src/align/run-align.js';
import {runSegment} from '../src/segment/run-segment.js';
import {runSchemaGate, loadDsl} from '../src/dsl/validate-gate.js';
import {runLayout} from '../src/layout/run-layout.js';
import {runCompile} from '../src/compile/run-compile.js';
import {lintTiming} from '../src/qa/lint-timing.js';
import {transcribeLectureAudio} from '../src/align/transcribe.js';
import {join, basename} from 'node:path';
import {readFileSync} from 'node:fs';

const usage = () => {
  console.error(
    JSON.stringify({
      ok: false,
      error:
        'Usage: pnpm lecture <lectureDir> align|transcribe|segment|schema|layout|compile|lint|render',
    }),
  );
  process.exit(1);
};

const main = async () => {
  const lectureDir = process.argv[2];
  const command = process.argv[3];
  if (!lectureDir || !command) {
    usage();
    return;
  }
  const dir = lectureDir;
  const cmd = command;
  const outDir = join(process.cwd(), 'out', basename(dir));

  try {
    if (cmd === 'align') {
      const {timelinePath, timeline} = runAlign(dir, outDir);
      console.log(JSON.stringify({ok: true, command: cmd, timelinePath, wordCount: timeline.words.length}));
      return;
    }
    if (cmd === 'transcribe') {
      const whisperPath = await transcribeLectureAudio(dir);
      console.log(JSON.stringify({ok: true, command: cmd, whisperPath}));
      return;
    }
    if (cmd === 'segment') {
      const {segmentsPath, segments} = runSegment(dir, outDir);
      console.log(
        JSON.stringify({ok: true, command: cmd, segmentsPath, segmentCount: segments.segments.length}),
      );
      return;
    }
    if (cmd === 'schema') {
      loadDsl(dir);
      const report = runSchemaGate(dir, outDir);
      console.log(JSON.stringify({ok: report.ok, command: cmd, issues: report.issues}));
      if (!report.ok) {
        process.exit(1);
      }
      return;
    }
    if (cmd === 'layout') {
      const {layoutPath} = await runLayout(dir, outDir);
      console.log(JSON.stringify({ok: true, command: cmd, layoutPath}));
      return;
    }
    if (cmd === 'compile') {
      const {compiledPath} = runCompile(dir, outDir);
      console.log(JSON.stringify({ok: true, command: cmd, compiledPath}));
      return;
    }
    if (cmd === 'lint') {
      const compiled = JSON.parse(
        readFileSync(join(outDir, 'timeline.compiled.json'), 'utf8'),
      ) as import('../src/compile/compile.js').CompiledTimeline;
      const report = lintTiming(compiled);
      console.log(JSON.stringify({ok: report.ok, command: cmd, issues: report.issues}));
      if (!report.ok) {
        process.exit(1);
      }
      return;
    }
    if (cmd === 'render') {
      const {runRenderLecture} = await import('./render-lecture.js');
      await runRenderLecture(dir);
      return;
    }
    console.error(JSON.stringify({ok: false, error: `Unknown command: ${command}`}));
    process.exit(1);
  } catch (err) {
    console.error(JSON.stringify({ok: false, error: String(err)}));
    process.exit(1);
  }
};

main();
