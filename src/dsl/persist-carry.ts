import type {ScenesDsl} from './schema.js';

export type PersistTableCarry = {
  id: string;
  columns: string[];
  rows: string[][];
};

export const findPersistTable = (
  slots: Record<string, unknown>,
  targetId: string,
): PersistTableCarry | null => {
  const table = slots.table as
    | {id: string; columns: string[]; rows: string[][]}
    | undefined;
  if (table?.id === targetId) {
    return {id: table.id, columns: table.columns, rows: table.rows};
  }
  return null;
};

/** First matching `persist` id carried from the previous scene's slots. */
export const persistCarryFromPrevious = (
  dsl: ScenesDsl,
  sceneIndex: number,
): PersistTableCarry | null => {
  if (sceneIndex <= 0) {
    return null;
  }
  const scene = dsl.scenes[sceneIndex];
  const prev = dsl.scenes[sceneIndex - 1];
  if (!scene?.persist?.length || !prev) {
    return null;
  }
  for (const id of scene.persist) {
    const carried = findPersistTable(prev.slots, id);
    if (carried) {
      return carried;
    }
  }
  return null;
};
