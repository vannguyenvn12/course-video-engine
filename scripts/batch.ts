import {createHash} from 'node:crypto';
import {existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync} from 'node:fs';
import {join, basename} from 'node:path';
import {spawnSync} from 'node:child_process';

const courseDir = process.argv[2];
if (!courseDir) {
  console.error(JSON.stringify({ok: false, error: 'Usage: pnpm batch <courseDir>'}));
  process.exit(1);
}

const lectures = readdirSync(courseDir, {withFileTypes: true})
  .filter((d) => d.isDirectory())
  .map((d) => join(courseDir, d.name))
  .filter((dir) => existsSync(join(dir, 'script.md')) && existsSync(join(dir, 'scenes.dsl.json')));

export type BatchLectureResult = {
  lecture: string;
  id: string;
  ok: boolean;
  criticAverage?: number;
  criticOk?: boolean;
  error?: string;
};

const inputHash = (lectureDir: string): string => {
  const parts = ['script.md', 'scenes.dsl.json', 'audio.duration.json', 'whisper.fixture.json']
    .filter((f) => existsSync(join(lectureDir, f)))
    .map((f) => readFileSync(join(lectureDir, f)));
  return createHash('sha256').update(Buffer.concat(parts)).digest('hex').slice(0, 16);
};

const parseQaSummary = (stdout: string): {ok: boolean; average?: number; criticOk?: boolean} => {
  const lines = stdout.trim().split('\n').filter(Boolean);
  const last = lines.at(-1);
  if (!last) {
    return {ok: false};
  }
  try {
    const j = JSON.parse(last) as {ok?: boolean; critic?: {average?: number; scores?: Record<string, number>}};
    const values = j.critic?.scores ? Object.values(j.critic.scores) : [];
    const criticOk = values.length ? values.every((v) => v >= 4) && (j.critic?.average ?? 0) >= 4.3 : undefined;
    return {ok: Boolean(j.ok), average: j.critic?.average, criticOk};
  } catch {
    return {ok: false};
  }
};

const results: BatchLectureResult[] = [];
const skipRender = process.env.BATCH_SKIP_RENDER === '1';

for (const dir of lectures) {
  const id = basename(dir);
  const hash = inputHash(dir);
  const outDir = join(process.cwd(), 'out', id);
  const hashFile = join(outDir, '.input-hash');
  const cached =
    existsSync(hashFile) &&
    readFileSync(hashFile, 'utf8').trim() === hash &&
    existsSync(join(outDir, 'lint.report.json'));

  if (cached && process.env.BATCH_FORCE !== '1') {
    results.push({lecture: dir, id, ok: true});
    continue;
  }

  const qa = spawnSync('pnpm', ['qa', dir], {
    encoding: 'utf8',
    shell: true,
    env: {
      ...process.env,
      ...(skipRender ? {QA_SKIP_RENDER: '1'} : {}),
    },
  });
  const summary = parseQaSummary(qa.stdout ?? '');
  const ok = qa.status === 0 && summary.ok;
  mkdirSync(outDir, {recursive: true});
  if (ok) {
    writeFileSync(hashFile, `${hash}\n`, 'utf8');
  }
  results.push({
    lecture: dir,
    id,
    ok,
    criticAverage: summary.average,
    criticOk: summary.criticOk,
    error: ok ? undefined : (qa.stderr || qa.stdout)?.slice(0, 500),
  });
}

const report = {
  ok: results.every((r) => r.ok),
  course: courseDir,
  lectureCount: results.length,
  skipRender,
  results,
};
const reportPath = join(process.cwd(), 'out', 'batch-report.json');
mkdirSync(join(process.cwd(), 'out'), {recursive: true});
writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(report));
if (!report.ok) {
  process.exit(1);
}
