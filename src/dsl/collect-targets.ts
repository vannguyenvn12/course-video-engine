const ID_KEY = 'id';

/** Collect declared element ids from preset slots (nested objects with id field). */
export const collectSlotIds = (slots: Record<string, unknown>): Set<string> => {
  const ids = new Set<string>();
  const walk = (value: unknown) => {
    if (!value || typeof value !== 'object') {
      return;
    }
    if (Array.isArray(value)) {
      value.forEach(walk);
      return;
    }
    const record = value as Record<string, unknown>;
    if (typeof record[ID_KEY] === 'string') {
      ids.add(record[ID_KEY]);
    }
    for (const v of Object.values(record)) {
      walk(v);
    }
  };
  walk(slots);
  return ids;
};

/** Resolve target path like orders.row[2] to base id orders for bbox lookup. */
export const targetRootId = (target: string): string => {
  const dot = target.indexOf('.');
  return dot === -1 ? target : target.slice(0, dot);
};

export const targetExists = (target: string, slotIds: Set<string>): boolean => {
  const root = targetRootId(target);
  return slotIds.has(root);
};
