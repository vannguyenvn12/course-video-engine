import {existsSync, mkdirSync, copyFileSync} from 'node:fs';
import {join} from 'node:path';
import {runPresetRegression} from '../src/qa/regression.js';

const preset = process.argv[2];
if (!preset) {
  console.error(JSON.stringify({ok: false, error: 'Usage: pnpm preset:golden <preset>'}));
  process.exit(1);
}

const result = await runPresetRegression(preset);
if (!result.actualPath) {
  console.error(JSON.stringify({ok: false, error: 'Could not render preset still'}));
  process.exit(1);
}

const goldenDir = join(process.cwd(), 'src', 'presets', preset, 'golden');
mkdirSync(goldenDir, {recursive: true});
const goldenPath = join(goldenDir, 'default.png');
copyFileSync(result.actualPath, goldenPath);
console.log(JSON.stringify({ok: true, goldenPath, note: 'Human approval required per spec'}));
