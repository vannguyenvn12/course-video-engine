import {listPresets, getPreset} from '../src/presets/registry.js';

const name = process.argv[2];
const targets = name ? [name] : listPresets();
const results = targets.map((presetName) => {
  const p = getPreset(presetName);
  return {preset: presetName, ok: true, dataIds: p.measureDataIds.length};
});
console.log(JSON.stringify({ok: true, results}));
