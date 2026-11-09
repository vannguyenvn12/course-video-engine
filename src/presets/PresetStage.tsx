import type {CompiledBeat} from '../compile/compile.js';
import type {ScenesDsl} from '../dsl/schema.js';
import type {MotionState} from '../motion/beat-state.js';
import {getPreset} from './registry.js';
import {OpenerView} from './views/OpenerView.js';
import {TableView} from './views/TableView.js';
import {CodeView} from './views/CodeView.js';
import {CodePlusOutputView} from './views/CodePlusOutputView.js';
import {CompareSplitView} from './views/CompareSplitView.js';
import {MetricCalloutView} from './views/MetricCalloutView.js';
import {StatementView} from './views/StatementView.js';
import {TreeView} from './views/TreeView.js';
import {GraphView} from './views/GraphView.js';
import {MemoryBlocksView} from './views/MemoryBlocksView.js';
import {LanesTimelineView} from './views/LanesTimelineView.js';
import {WarningCalloutView} from './views/WarningCalloutView.js';

export type PresetStageProps = {
  preset: string;
  slots: Record<string, unknown>;
  motion?: MotionState;
  localFrame?: number;
  beats?: CompiledBeat[];
};

const defaultMotion: MotionState = {
  revealed: new Set(),
  emphasized: null,
  focusId: null,
  scanActive: false,
  scanRowIndex: -1,
  counterValue: null,
  dim: false,
};

export const PresetStage: React.FC<PresetStageProps> = ({
  preset,
  slots,
  motion = defaultMotion,
  localFrame = 0,
  beats = [],
}) => {
  const def = getPreset(preset);
  const parsed = def.schema.parse(slots);

  switch (preset) {
    case 'opener':
      return (
        <OpenerView
          slots={parsed as import('./views/OpenerView.js').OpenerSlots}
          motion={motion}
          localFrame={localFrame}
        />
      );
    case 'hero-table-with-annotation':
      return (
        <TableView
          slots={parsed as import('./views/TableView.js').TableSlots}
          motion={motion}
          localFrame={localFrame}
          beats={beats}
        />
      );
    case 'hero-code':
      return (
        <CodeView slots={parsed as import('./views/CodeView.js').CodeSlots} motion={motion} localFrame={localFrame} />
      );
    case 'hero-code-plus-output':
      return (
        <CodePlusOutputView
          slots={parsed as import('./views/CodePlusOutputView.js').CodePlusOutputSlots}
          motion={motion}
          localFrame={localFrame}
        />
      );
    case 'compare-split':
      return (
        <CompareSplitView
          slots={parsed as import('./views/CompareSplitView.js').CompareSplitSlots}
          motion={motion}
          localFrame={localFrame}
        />
      );
    case 'metric-callout':
      return (
        <MetricCalloutView
          slots={parsed as import('./views/MetricCalloutView.js').MetricCalloutSlots}
          motion={motion}
          localFrame={localFrame}
        />
      );
    case 'statement':
      return (
        <StatementView slots={parsed as {statement: string}} motion={motion} localFrame={localFrame} />
      );
    case 'hero-tree':
      return (
        <TreeView
          slots={parsed as import('./views/TreeView.js').TreeSlots}
          motion={motion}
          localFrame={localFrame}
        />
      );
    case 'hero-graph':
      return (
        <GraphView
          slots={parsed as import('./views/GraphView.js').GraphSlots}
          motion={motion}
          localFrame={localFrame}
        />
      );
    case 'memory-blocks':
      return (
        <MemoryBlocksView
          slots={parsed as import('./views/MemoryBlocksView.js').MemoryBlocksSlots}
          motion={motion}
          localFrame={localFrame}
        />
      );
    case 'lanes-timeline':
      return (
        <LanesTimelineView
          slots={parsed as import('./views/LanesTimelineView.js').LanesTimelineSlots}
          motion={motion}
          localFrame={localFrame}
        />
      );
    case 'warning-callout':
      return (
        <WarningCalloutView
          slots={parsed as import('./views/WarningCalloutView.js').WarningCalloutSlots}
          motion={motion}
          localFrame={localFrame}
        />
      );
    default:
      throw new Error(`Preset view not implemented: ${preset}`);
  }
};

export const sceneFromDsl = (dsl: ScenesDsl, sceneId: string) => {
  const scene = dsl.scenes.find((s) => s.id === sceneId);
  if (!scene) {
    throw new Error(`Scene ${sceneId} not found`);
  }
  return scene;
};
