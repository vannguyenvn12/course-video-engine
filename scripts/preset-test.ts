import {listPresets, getPreset} from '../src/presets/registry.js';
import {runPresetRegression} from '../src/qa/regression.js';

const main = async () => {
  const name = process.argv[2];
  const targets = name ? [name] : listPresets();

  const registry = targets.map((presetName) => {
    const p = getPreset(presetName);
    return {preset: presetName, ok: true, dataIds: p.measureDataIds.length};
  });

  const toRegress = name ? targets : listPresets();
  const regressions = [];
  for (const preset of toRegress) {
    regressions.push(await runPresetRegression(preset));
  }

  const regOk = regressions.every((r) => r.ok || Boolean(r.error?.includes('skipped')));
  console.log(JSON.stringify({ok: regOk, registry, regressions}));
  if (!regOk) {
    process.exit(1);
  }
};

main().catch((err) => {
  console.error(JSON.stringify({ok: false, error: String(err)}));
  process.exit(1);
});
