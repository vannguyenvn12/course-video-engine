import {copyFileSync, mkdirSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dest = join(root, 'public', 'fonts');
mkdirSync(dest, {recursive: true});

const pairs = [
  ['node_modules/@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-200-normal.woff2', 'IBMPlexSans-Light.woff2'],
  ['node_modules/@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-400-normal.woff2', 'IBMPlexSans-Regular.woff2'],
  ['node_modules/@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-700-normal.woff2', 'IBMPlexSans-Bold.woff2'],
  ['node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2', 'IBMPlexMono-Regular.woff2'],
];

for (const [srcRel, name] of pairs) {
  copyFileSync(join(root, srcRel), join(dest, name));
}

console.log(JSON.stringify({ok: true, fonts: pairs.map(([, n]) => n)}));
