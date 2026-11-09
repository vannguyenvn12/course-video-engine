import type {CompiledBeat} from '../compile/compile.js';

export type MotionHints = {
  tableRowCount?: number;
  counterTo?: number;
};

export type MotionState = {
  revealed: Set<string>;
  emphasized: string | null;
  focusId: string | null;
  scanActive: boolean;
  scanRowIndex: number;
  counterValue: number | null;
  dim: boolean;
};

const FRAMES_PER_SCAN_ROW = 10;

export const motionStateAtFrame = (
  beats: CompiledBeat[],
  localFrame: number,
  hints: MotionHints = {},
): MotionState => {
  const state: MotionState = {
    revealed: new Set(),
    emphasized: null,
    focusId: null,
    scanActive: false,
    scanRowIndex: -1,
    counterValue: null,
    dim: false,
  };

  let scanStartFrame: number | null = null;
  const rowCount = hints.tableRowCount ?? 0;

  for (const beat of beats) {
    if (beat.frame > localFrame) {
      break;
    }
    const target = beat.target;
    if (!target) {
      continue;
    }
    switch (beat.do) {
      case 'reveal':
        state.revealed.add(target);
        break;
      case 'emphasize':
        state.emphasized = target;
        break;
      case 'deemphasize':
        if (state.emphasized === target) {
          state.emphasized = null;
        }
        break;
      case 'draw':
      case 'connect':
        state.revealed.add(target ?? '');
        break;
      case 'focus':
        state.focusId = target;
        state.dim = true;
        break;
      case 'scan-rows':
        state.scanActive = true;
        scanStartFrame = beat.frame;
        state.revealed.add(target);
        break;
      case 'highlight-lines':
        state.emphasized = target;
        state.revealed.add(target);
        break;
      case 'traverse':
        state.emphasized = target;
        state.revealed.add(target.split('.')[0] ?? target);
        break;
      case 'type-code':
        state.revealed.add(target);
        break;
      case 'count':
        state.counterValue = hints.counterTo ?? state.counterValue;
        state.emphasized = target;
        break;
      default:
        state.revealed.add(target);
    }
  }

  if (state.scanActive && scanStartFrame !== null && rowCount > 0) {
    const elapsed = Math.max(0, localFrame - scanStartFrame);
    state.scanRowIndex = Math.min(rowCount - 1, Math.floor(elapsed / FRAMES_PER_SCAN_ROW));
    const counterMax = hints.counterTo ?? rowCount;
    state.counterValue = Math.min(counterMax, state.scanRowIndex + 1);
  } else if (hints.counterTo !== undefined && !state.scanActive) {
    state.counterValue = hints.counterTo;
  }

  return state;
};
