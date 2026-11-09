import type {ScenesDsl} from '../dsl/schema.js';
import {getPreset} from './registry.js';
import {OpenerView} from './views/OpenerView.js';
import {TableView} from './views/TableView.js';
import {CodeView} from './views/CodeView.js';
import {StatementView} from './views/StatementView.js';

export type PresetStageProps = {
  preset: string;
  slots: Record<string, unknown>;
};

export const PresetStage: React.FC<PresetStageProps> = ({preset, slots}) => {
  const def = getPreset(preset);
  const parsed = def.schema.parse(slots);

  switch (preset) {
    case 'opener':
      return <OpenerView slots={parsed as import('./views/OpenerView.js').OpenerSlots} />;
    case 'hero-table-with-annotation':
      return <TableView slots={parsed as import('./views/TableView.js').TableSlots} />;
    case 'hero-code':
      return <CodeView slots={parsed as import('./views/CodeView.js').CodeSlots} />;
    case 'statement':
      return <StatementView slots={parsed as {statement: string}} />;
    default:
      return (
        <div data-id="stage-safe" style={{color: '#fff', padding: 96}}>
          Preset `{preset}` measure view not ported yet
        </div>
      );
  }
};

export const sceneFromDsl = (dsl: ScenesDsl, sceneId: string) => {
  const scene = dsl.scenes.find((s) => s.id === sceneId);
  if (!scene) {
    throw new Error(`Scene ${sceneId} not found`);
  }
  return scene;
};
