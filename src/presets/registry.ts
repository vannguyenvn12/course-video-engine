import {openerPreset} from './opener/index.js';
import {statementPreset} from './statement/index.js';
import {heroCodePreset} from './hero-code/index.js';
import {heroTablePreset} from './hero-table-with-annotation/index.js';
import {heroCodePlusOutputPreset} from './hero-code-plus-output/index.js';
import {heroTreePreset} from './hero-tree/index.js';
import {heroGraphPreset} from './hero-graph/index.js';
import {compareSplitPreset} from './compare-split/index.js';
import {lanesTimelinePreset} from './lanes-timeline/index.js';
import {memoryBlocksPreset} from './memory-blocks/index.js';
import {metricCalloutPreset} from './metric-callout/index.js';
import {warningCalloutPreset} from './warning-callout/index.js';

import type {PresetDefinition} from './types.js';

const presets: PresetDefinition[] = [
  openerPreset,
  statementPreset,
  heroCodePreset,
  heroTablePreset,
  heroCodePlusOutputPreset,
  heroTreePreset,
  heroGraphPreset,
  compareSplitPreset,
  lanesTimelinePreset,
  memoryBlocksPreset,
  metricCalloutPreset,
  warningCalloutPreset,
];

const byName = new Map(presets.map((p) => [p.name, p]));

export const listPresets = (): string[] => [...byName.keys()];

export const getPreset = (name: string): PresetDefinition => {
  const preset = byName.get(name);
  if (!preset) {
    throw new Error(`Preset not registered: ${name}`);
  }
  return preset;
};
