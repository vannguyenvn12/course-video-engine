import type {Page} from 'playwright';
import type {MeasuredBox} from '../qa/lint-geometry.js';
import {measureDataIds} from '../qa/lint-geometry.js';

export type LayoutSceneBeat = {
  beatIndex: number;
  boxes: Record<string, MeasuredBox>;
};

export const boxesToRecord = (boxes: MeasuredBox[]): Record<string, MeasuredBox> => {
  const out: Record<string, MeasuredBox> = {};
  for (const b of boxes) {
    if (b.id) {
      out[b.id] = b;
    }
  }
  return out;
};

export const measurePageBeat = async (page: Page, beatIndex: number): Promise<LayoutSceneBeat> => {
  const boxes = await measureDataIds(page);
  return {beatIndex, boxes: boxesToRecord(boxes)};
};
