import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {join, basename} from 'node:path';
import {runAlign} from '../src/align/run-align.js';
import {runSegment} from '../src/segment/run-segment.js';
import {runSchemaGate} from '../src/dsl/validate-gate.js';
import {runLayout} from '../src/layout/run-layout.js';
import {runCompile} from '../src/compile/run-compile.js';
import {lintTiming} from '../src/qa/lint-timing.js';
import {lintLectureGeometry} from '../src/qa/lint-lecture-geometry.js';
import {runCritic, type CriticMode} from '../src/qa/run-critic.js';
import {runAuthor} from '../src/author/run-author.js';
import {buildReviewPack} from '../src/qa/pack.js';
import {runRenderLecture} from './render-lecture.js';
import {spawnSync} from 'node:child_process';

const lectureDir = process.argv[2];
if (!lectureDir) {
  console.error(JSON.stringify({ok: false, error: 'Usage: pnpm qa <lectureDir>'}));
  process.exit(1);
}

const name = basename(lectureDir);
const outDir = join(process.cwd(), 'out', name);

type StepResult = {step: string; ok: boolean; detail?: unknown};

const steps: StepResult[] = [];

const main = async () => {
  try {
    runAlign(lectureDir, outDir);
    steps.push({step: 'align', ok: true});

    runSegment(lectureDir, outDir);
    steps.push({step: 'segment', ok: true});

    const schema = runSchemaGate(lectureDir, outDir);
    steps.push({step: 'schema', ok: schema.ok, detail: schema.issues});
    if (!schema.ok) {
      fail('schema', steps, schema.issues);
    }

    const presetQa = spawnSync('pnpm', ['exec', 'tsx', 'scripts/preset-test.ts'], {
      encoding: 'utf8',
      shell: true,
    });
    const presetJson = tryParseJson(presetQa.stdout);
    const presetOk = presetQa.status === 0;
    steps.push({step: 'preset-regression', ok: presetOk, detail: presetJson});
    if (!presetOk) {
      fail('preset-regression', steps, presetJson);
    }

    await runLayout(lectureDir, outDir);
    steps.push({step: 'layout', ok: true});

    const {compiled} = runCompile(lectureDir, outDir);
    steps.push({step: 'compile', ok: true});

    const timing = lintTiming(compiled);
    steps.push({step: 'lint-timing', ok: timing.ok, detail: timing.issues});
    if (!timing.ok) {
      fail('lint-timing', steps, timing.issues);
    }

    mkdirSync(join(outDir, 'review'), {recursive: true});
    const geometry = await lintLectureGeometry(lectureDir, outDir);
    steps.push({step: 'lint-geometry', ok: geometry.ok, detail: geometry.issues});
    if (!geometry.ok) {
      fail('lint-geometry', steps, geometry.issues);
    }

    const lintReport = {
      ok: timing.ok && geometry.ok,
      timing: timing.issues,
      geometry: geometry.issues,
    };
    writeFileSync(join(outDir, 'lint.report.json'), `${JSON.stringify(lintReport, null, 2)}\n`, 'utf8');
    steps.push({step: 'lint-report', ok: true});

    const author = await runAuthor(lectureDir, outDir);
    steps.push({step: 'author-plan', ok: author.ok, detail: author});
    if (!author.ok) {
      fail('author-plan', steps, author);
    }

    const pack = await buildReviewPack(lectureDir, outDir, {
      segmentsPath: join(outDir, 'segments.json'),
      lintSummary: `Timing warnings: ${timing.issues.filter((i) => i.severity === 'warn').length}`,
    });
    steps.push({step: 'review-pack', ok: true, detail: pack});

    const {report: critic, mode: criticMode} = await runCritic(compiled, geometry, timing, outDir);
    writeReviewLog(outDir, critic, criticMode);
    steps.push({step: 'critic', ok: critic.ok, detail: {scores: critic.scores, mode: criticMode}});
    if (!critic.ok) {
      fail('critic', steps, critic);
    }

    if (process.env.QA_SKIP_RENDER !== '1') {
      await runRenderLecture(lectureDir);
      steps.push({step: 'render', ok: true});

      const finalQa = spawnSync('pnpm', ['exec', 'tsx', 'scripts/final-qa.ts', lectureDir], {
        encoding: 'utf8',
        shell: true,
      });
      const finalJson = tryParseJson(finalQa.stdout);
      steps.push({step: 'final-qa', ok: finalQa.status === 0, detail: finalJson ?? finalQa.stderr});
      if (finalQa.status !== 0) {
        fail('final-qa', steps, finalJson);
      }

      const pack2 = await buildReviewPack(lectureDir, outDir, {
        segmentsPath: join(outDir, 'segments.json'),
        lintSummary: 'Post-render filmstrip refresh',
      });
      steps.push({step: 'review-pack-post-render', ok: true, detail: pack2.filmstrips});
    }

    console.log(
      JSON.stringify({
        ok: true,
        steps,
        critic: {scores: critic.scores, average: critic.average, mode: criticMode},
      }),
    );
  } catch (err) {
    console.error(JSON.stringify({ok: false, error: String(err), steps}));
    process.exit(1);
  }
};

main();

function fail(failedAt: string, steps: StepResult[], detail: unknown): never {
  console.log(JSON.stringify({ok: false, failedAt, steps, detail}));
  process.exit(1);
}

function tryParseJson(text: string): unknown {
  try {
    return JSON.parse(text.trim());
  } catch {
    return null;
  }
}

function writeReviewLog(outDir: string, critic: import('../src/qa/critic.js').CriticReport, mode: CriticMode) {
  const logPath = join(outDir, 'review', 'LOG.md');
  mkdirSync(join(outDir, 'review'), {recursive: true});
  const body = `# QA log

- Critic mode: ${mode}
- Timestamp: ${new Date().toISOString()}
- Average: ${critic.average.toFixed(2)}
- Scores: ${JSON.stringify(critic.scores)}
`;
  try {
    const prev = readFileSync(logPath, 'utf8');
    writeFileSync(logPath, `${prev}\n${body}`);
  } catch {
    writeFileSync(logPath, body);
  }
}
