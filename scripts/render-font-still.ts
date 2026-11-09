import {mkdirSync} from 'node:fs';
import {join} from 'node:path';
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';

const entry = join(process.cwd(), 'src', 'index.ts');
const outDir = join(process.cwd(), 'out', 'phase0');
const outPath = join(outDir, 'font-still.png');

const main = async () => {
  mkdirSync(outDir, {recursive: true});
  const serveUrl = await bundle({entryPoint: entry, publicDir: join(process.cwd(), 'public')});
  const composition = await selectComposition({
    serveUrl,
    id: 'FontStill',
    inputProps: {},
  });
  await renderStill({
    composition,
    serveUrl,
    output: outPath,
    frame: 0,
    imageFormat: 'png',
  });
  console.log(JSON.stringify({ok: true, path: outPath}));
};

main().catch((err) => {
  console.error(JSON.stringify({ok: false, error: String(err)}));
  process.exit(1);
});
