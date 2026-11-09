import {mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {join, basename} from 'node:path';
import {runAlign} from '../src/align/run-align.js';
import {runSegment} from '../src/segment/run-segment.js';
import {runSchemaGate} from '../src/dsl/validate-gate.js';
import {runLayout} from '../src/layout/run-layout.js';
import {runCompile} from '../src/compile/run-compile.js';
import {lintTiming} from '../src/qa/lint-timing.js';
import {runSelfCritic} from '../src/qa/critic.js';
import {buildReviewPack} from '../src/qa/pack.js';

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
      console.log(JSON.stringify({ok: false, failedAt: 'schema', steps, issues: schema.issues}));
      process.exit(1);
    }

    await runLayout(lectureDir, outDir);
    steps.push({step: 'layout', ok: true});

    const {compiled} = runCompile(lectureDir, outDir);
    steps.push({step: 'compile', ok: true});

    const timing = lintTiming(compiled);
    steps.push({step: 'lint-timing', ok: timing.ok, detail: timing.issues});
    if (!timing.ok) {
      console.log(JSON.stringify({ok: false, failedAt: 'lint-timing', steps, issues: timing.issues}));
      process.exit(1);
    }

    const critic = runSelfCritic(compiled, {ok: true, issues: []}, timing);
    writeReviewLog(outDir, critic);
    steps.push({step: 'critic', ok: critic.ok, detail: critic.scores});
    if (!critic.ok) {
      console.log(JSON.stringify({ok: false, failedAt: 'critic', steps, critic}));
      process.exit(1);
    }

    if (process.env.QA_SKIP_PACK !== '1') {
      try {
        const stills = await buildReviewPack(lectureDir, outDir);
        steps.push({step: 'review-pack', ok: true, detail: stills});
      } catch (packErr) {
        steps.push({step: 'review-pack', ok: false, detail: String(packErr)});
      }
    }

    console.log(JSON.stringify({ok: true, steps, critic: {scores: critic.scores, average: critic.average}}));
  } catch (err) {
    console.error(JSON.stringify({ok: false, error: String(err), steps}));
    process.exit(1);
  }
};

main();

function writeReviewLog(outDir: string, critic: ReturnType<typeof runSelfCritic>) {
  const logPath = join(outDir, 'review', 'LOG.md');
  mkdirSync(join(outDir, 'review'), {recursive: true});
  const body = `# QA log

- Auto-approved (self-critic): ${new Date().toISOString()}
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
