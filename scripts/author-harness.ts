import {basename, join} from 'node:path';
import {runAuthor} from '../src/author/run-author.js';

const lectureDir = process.argv[2];
if (!lectureDir) {
  console.error(JSON.stringify({ok: false, error: 'Usage: tsx scripts/author-harness.ts <lectureDir>'}));
  process.exit(1);
}

const outDir = join(process.cwd(), 'out', basename(lectureDir));
const result = await runAuthor(lectureDir, outDir);
console.log(JSON.stringify(result));
if (!result.ok) {
  process.exit(1);
}
