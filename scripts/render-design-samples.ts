import {mkdirSync} from 'node:fs';
import {join} from 'node:path';
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';

const entry = join(process.cwd(), 'src', 'index.ts');
const outDir = join(process.cwd(), 'out', 'phase0.5');

const samples = [
  {id: 'SampleOpener', file: 'sample-01-opener.png'},
  {id: 'SampleTable', file: 'sample-02-table.png'},
  {id: 'SampleCode', file: 'sample-03-code.png'},
] as const;

const main = async () => {
  mkdirSync(outDir, {recursive: true});
  const serveUrl = await bundle({
    entryPoint: entry,
    publicDir: join(process.cwd(), 'public'),
  });
  const written: string[] = [];
  for (const {id, file} of samples) {
    const composition = await selectComposition({serveUrl, id, inputProps: {}});
    const output = join(outDir, file);
    await renderStill({
      composition,
      serveUrl,
      output,
      frame: 0,
      imageFormat: 'png',
    });
    written.push(output);
  }
  console.log(JSON.stringify({ok: true, paths: written}));
};

main().catch((err) => {
  console.error(JSON.stringify({ok: false, error: String(err)}));
  process.exit(1);
});
