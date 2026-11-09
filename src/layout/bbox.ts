export type Bbox = {x: number; y: number; width: number; height: number};

export const bboxCenter = (b: Bbox): {x: number; y: number} => ({
  x: b.x + b.width / 2,
  y: b.y + b.height / 2,
});

export const expandBbox = (b: Bbox, pad: number): Bbox => ({
  x: b.x - pad,
  y: b.y - pad,
  width: b.width + pad * 2,
  height: b.height + pad * 2,
});

export const segmentIntersectsRect = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  rect: Bbox,
): boolean => {
  const left = rect.x;
  const right = rect.x + rect.width;
  const top = rect.y;
  const bottom = rect.y + rect.height;
  const minX = Math.min(x1, x2);
  const maxX = Math.max(x1, x2);
  const minY = Math.min(y1, y2);
  const maxY = Math.max(y1, y2);
  return !(maxX < left || minX > right || maxY < top || minY > bottom);
};
