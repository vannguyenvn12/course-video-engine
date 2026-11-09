import {mkdirSync, writeFileSync} from 'node:fs';
import {basename, join} from 'node:path';
import {executeGeometryTool} from '../src/geometry/execute-tool-call.js';
import {readFileSync} from 'node:fs';
import {readdirSync} from 'node:fs';

const lectureDir = process.argv[2];
if (!lectureDir) {
  console.error(JSON.stringify({ok: false, error: 'Usage: tsx scripts/svg-asset.ts <lectureDir>'}));
  process.exit(1);
}

const fewDir = join(process.cwd(), 'prompts', 'fewshot', 'svg-sophia');
const fewshots = readdirSync(fewDir).filter((f) => f.endsWith('.md'));

const assetDir = join(lectureDir, 'assets');
mkdirSync(assetDir, {recursive: true});

const polygon = executeGeometryTool('place_polygon', {
  sides: 8,
  center: {x: 0.5, y: 0.5},
  radius: 0.2,
});

if (!polygon.ok) {
  console.error(JSON.stringify({ok: false, error: polygon.error}));
  process.exit(1);
}

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" role="img">
  <path fill="none" stroke="#e85d4a" stroke-width="2" d="${polygon.path}" data-id="decorative"/>
</svg>
`;

const out = join(assetDir, 'hero-octagon.svg');
writeFileSync(out, svg, 'utf8');

console.log(
  JSON.stringify({
    ok: true,
    lecture: basename(lectureDir),
    asset: out,
    fewshotExamplesLoaded: fewshots.length,
    fewshotPreview: fewshots[0] ? readFileSync(join(fewDir, fewshots[0]!), 'utf8').slice(0, 120) : null,
  }),
);
