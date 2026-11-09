import {layout} from '../design/tokens.js';
import type {Bbox} from './bbox.js';
import {bboxCenter, expandBbox, segmentIntersectsRect} from './bbox.js';

export type ConnectorPath = {
  from: string;
  to: string;
  points: {x: number; y: number}[];
};

/** Orthogonal route from source center toward target; detours if segment crosses text bbox. */
export const routeConnector = (
  from: Bbox,
  to: Bbox,
  obstacles: Bbox[],
): {x: number; y: number}[] => {
  const start = bboxCenter(from);
  const end = bboxCenter(to);
  const midX = start.x + (end.x - start.x) * 0.5;
  let points = [
    start,
    {x: midX, y: start.y},
    {x: midX, y: end.y},
    end,
  ];

  const pad = layout.spacing[2];
  for (const obstacle of obstacles) {
    const inflated = expandBbox(obstacle, pad);
    const hits =
      segmentIntersectsRect(points[0]!.x, points[0]!.y, points[1]!.x, points[1]!.y, inflated) ||
      segmentIntersectsRect(points[1]!.x, points[1]!.y, points[2]!.x, points[2]!.y, inflated) ||
      segmentIntersectsRect(points[2]!.x, points[2]!.y, points[3]!.x, points[3]!.y, inflated);
    if (hits) {
      const detourY = inflated.y - pad * 2;
      points = [
        start,
        {x: start.x, y: detourY},
        {x: end.x, y: detourY},
        end,
      ];
      break;
    }
  }
  return points;
};
