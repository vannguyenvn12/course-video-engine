import {z} from 'zod';

const NormPointSchema = z.object({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
});

const PlacePolygonArgs = z.object({
  sides: z.number().int().min(3).max(24),
  center: NormPointSchema,
  radius: z.number().min(0.05).max(0.45),
});

const SAFE = {w: 1720, h: 880, ox: 100, oy: 100};

const toPixel = (n: number, axis: 'x' | 'y') =>
  axis === 'x' ? SAFE.ox + n * SAFE.w : SAFE.oy + n * SAFE.h;

export const placePolygon = (args: z.infer<typeof PlacePolygonArgs>): string => {
  const {sides, center, radius} = PlacePolygonArgs.parse(args);
  const cx = toPixel(center.x, 'x');
  const cy = toPixel(center.y, 'y');
  const r = radius * Math.min(SAFE.w, SAFE.h);
  const pts: string[] = [];
  for (let i = 0; i < sides; i++) {
    const a = (i / sides) * Math.PI * 2 - Math.PI / 2;
    pts.push(`${(cx + Math.cos(a) * r).toFixed(2)} ${(cy + Math.sin(a) * r).toFixed(2)}`);
  }
  return `M ${pts.join(' L ')} Z`;
};

export const geometryToolManifest = {
  tools: [
    {
      name: 'place_polygon',
      description: 'Regular polygon in normalized safe area (0–1). Returns SVG path d.',
      parameters: PlacePolygonArgs,
    },
  ],
} as const;

export type GeometryToolName = 'place_polygon';

export const executeGeometryTool = (
  tool: GeometryToolName,
  args: unknown,
): {ok: true; path: string} | {ok: false; error: string} => {
  try {
    if (tool === 'place_polygon') {
      return {ok: true, path: placePolygon(args as z.infer<typeof PlacePolygonArgs>)};
    }
    return {ok: false, error: `Unknown tool ${tool}`};
  } catch (err) {
    return {ok: false, error: String(err)};
  }
};
