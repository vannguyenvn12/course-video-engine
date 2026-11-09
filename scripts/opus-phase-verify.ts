import {existsSync, readFileSync, readdirSync} from 'node:fs';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {AuthorPlanSchema} from '../src/dsl/author-plan.js';
import {executeGeometryTool} from '../src/geometry/execute-tool-call.js';

type PhaseCheck = {phase: string; ok: boolean; detail?: unknown};

const checks: PhaseCheck[] = [];
const root = process.cwd();

const must = (phase: string, ok: boolean, detail?: unknown) => checks.push({phase, ok, detail});

// O0
must('O0', existsSync(join(root, 'prompts/author.md')) && existsSync(join(root, 'prompts/author-vot.md')), {
  author: existsSync(join(root, 'prompts/author.md')),
  vot: existsSync(join(root, 'prompts/author-vot.md')),
  planSchema: existsSync(join(root, 'src/dsl/author-plan.ts')),
});

// O1
must(
  'O1',
  existsSync(join(root, 'scripts/author-harness.ts')) && existsSync(join(root, 'src/author/run-author.ts')),
);

// O2
must(
  'O2',
  existsSync(join(root, 'src/qa/run-critic.ts')) &&
    existsSync(join(root, 'src/qa/spatial-critic.ts')) &&
    existsSync(join(root, 'src/qa/agentic-critic.ts')),
);

// O3
const poly = executeGeometryTool('place_polygon', {sides: 6, center: {x: 0.5, y: 0.5}, radius: 0.15});
must('O3', poly.ok && poly.path.startsWith('M'), poly);

// O4
const fewDir = join(root, 'prompts/fewshot/svg-sophia');
const fewFiles = existsSync(fewDir) ? readdirSync(fewDir).filter((f) => f.endsWith('.md')) : [];
must('O4', fewFiles.length >= 3, {count: fewFiles.length});

// O5 author plan on canonical
const planPath = join(root, 'out/fixture-seq-scan/author.plan.json');
if (existsSync(planPath)) {
  const plan = AuthorPlanSchema.safeParse(JSON.parse(readFileSync(planPath, 'utf8')));
  must('O5-author-plan', plan.success && plan.data!.scenes.length >= 5, {
    scenes: plan.success ? plan.data!.scenes.length : plan.error,
  });
} else {
  must('O5-author-plan', false, 'Run pnpm qa on fixture-seq-scan first');
}

const qa = spawnSync('pnpm', ['test'], {encoding: 'utf8', shell: true, cwd: root});
must('tests', qa.status === 0, qa.status);

const allOk = checks.every((c) => c.ok);
console.log(JSON.stringify({ok: allOk, checks}));
process.exit(allOk ? 0 : 1);
