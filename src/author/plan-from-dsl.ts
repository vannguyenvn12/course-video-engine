import type {ScenesDsl} from '../dsl/schema.js';
import type {AuthorPlan} from '../dsl/author-plan.js';

const regionForPreset = (preset: string): string => {
  const map: Record<string, string> = {
    opener: 'title @ middle-center; subtitle @ bottom-center',
    'memory-blocks': 'page stack @ middle-center',
    'hero-table-with-annotation': 'table @ middle-center; counter @ middle-right',
    'compare-split': 'left label @ middle-left; right label @ middle-right',
    'metric-callout': 'metric @ middle-center',
    'hero-code-plus-output': 'code @ middle-left; plan output @ middle-right',
    'hero-tree': 'tree @ middle-center',
    'hero-graph': 'graph @ middle-center',
    'lanes-timeline': 'lanes @ middle-center',
    statement: 'statement @ middle-center',
    'hero-code': 'code @ middle-center',
    'warning-callout': 'callout @ middle-center',
  };
  return map[preset] ?? `hero @ middle-center (${preset})`;
};

const heroIdsFromSlots = (slots: Record<string, unknown>): string[] => {
  const ids: string[] = [];
  const walk = (v: unknown) => {
    if (v && typeof v === 'object') {
      const o = v as Record<string, unknown>;
      if (typeof o.id === 'string') {
        ids.push(o.id);
      }
      for (const k of Object.keys(o)) {
        walk(o[k]);
      }
    }
  };
  walk(slots);
  return [...new Set(ids)];
};

export const buildAuthorPlanFromDsl = (dsl: ScenesDsl, mode: AuthorPlan['mode'] = 'agentic'): AuthorPlan => {
  return {
    lecture: dsl.lecture,
    generatedAt: new Date().toISOString(),
    mode,
    scenes: dsl.scenes.map((scene) => {
      const heroIds = heroIdsFromSlots(scene.slots as Record<string, unknown>);
      const connectBeats = scene.beats.filter((b) => b.do === 'connect');
      const persist = scene.persist?.length ? `Persist: ${scene.persist.join(', ')}` : 'Fresh scene';
      const votSteps = [
        `Viewer must see: ${scene.preset} with ids ${heroIds.join(', ') || 'hero'}.`,
        `Grid: ${regionForPreset(scene.preset)}.`,
        persist,
        `Motion: ${scene.beats.length} beats; transitions ${scene.transition ?? 'cut'}.`,
        connectBeats.length
          ? `Connect targets: ${connectBeats.map((b) => `${b.from ?? '?'}→${b.to ?? b.target ?? '?'}`).join('; ')}.`
          : 'No explicit connect beat.',
        'Subtract: drop redundant subtitle badge.',
      ];
      return {
        sceneId: scene.id,
        segmentId: scene.segment,
        votSteps,
        semanticGrid: regionForPreset(scene.preset),
        subtractDetail: 'no redundant subtitle badge',
        preset: scene.preset,
        heroIds: heroIds.length ? heroIds : ['hero'],
      };
    }),
  };
};
